import 'dotenv/config'

import { ChainId } from '@sushiswap/chain'
import { getUnixTime } from 'date-fns'

import { getBuiltGraphSDK } from '../.graphclient'
import { EXCHANGE_SUBGRAPH_NAME, GRAPH_HOST, SUSHISWAP_CHAINS, TRIDENT_CHAINS, TRIDENT_SUBGRAPH_NAME } from './config'
import redis from './redis'

async function getSushiSwapResults() {
  const results = await Promise.all(
    SUSHISWAP_CHAINS.map((chainId) => {
      const sdk = getBuiltGraphSDK({ chainId, host: GRAPH_HOST[chainId], name: EXCHANGE_SUBGRAPH_NAME[chainId] })

      return sdk.TokenPairs({ first: 100000 }).catch(() => {
        console.log(`Fetch failed: Exchange - ${ChainId[chainId]}`)

        return undefined
      })
    })
  )

  return results
    .filter((result): result is NonNullable<typeof results[0]> => result !== undefined)
    .filter((result) => result.tokenPairs.filter((tokenPair) => tokenPair.pair.liquidityUSD > 2000))
    .map((result, i) => {
      const tokens = result.tokenPairs.reduce<Record<string, Set<string>>>((acc, cur) => {
        if (!acc[cur.token.id]) {
          acc[cur.token.id] = new Set<string>()
        }
        acc[cur.token.id].add(cur.pair.token0.id === cur.token.id ? cur.pair.token1.id : cur.pair.token0.id)
        return acc
      }, {})

      return {
        chainId: SUSHISWAP_CHAINS[i],
        updatedAtBlock: Number(result?._meta?.block.number),
        tokens,
      }
    })
}

export async function execute() {
  console.log(
    `Updating token permutations for chains: ${[...SUSHISWAP_CHAINS, ...TRIDENT_CHAINS]
      .map((chainId) => ChainId[chainId])
      .join(', ')}`
  )

  const results = await getSushiSwapResults()
  const chainIds = Array.from(new Set(results.map((result) => result.chainId)))

  const combined = chainIds.map((chainId) => {
    const sources = results.filter((result) => result.chainId === chainId)
    let tokens = Object.entries(sources[0].tokens).map(([token, tokenList]) => {
      return {
        [token]: Array.from(tokenList),
      }
    })
    return { chainId, updatedAtBlock: sources[0].updatedAtBlock, updatedAtTimestamp: getUnixTime(Date.now()), tokens }
  })

  await redis.hset(
    'token-permutations',
    Object.fromEntries(
      combined.map(({ chainId, tokens, updatedAtBlock, updatedAtTimestamp }) => [
        chainId,
        JSON.stringify({
          chainId,
          tokens,
          updatedAtBlock,
          updatedAtTimestamp,
        }),
      ])
    )
  )
  console.log(`Finished updating token permutations`)
  process.exit()
}
