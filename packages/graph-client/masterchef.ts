import { ChainId, chainName } from '@sushiswap/chain'
import {
  MASTERCHEF_V1_SUBGRAPH_NAME,
  MASTERCHEF_V2_SUBGRAPH_NAME,
  MINICHEF_SUBGRAPH_NAME,
  SUBGRAPH_HOST,
} from '@sushiswap/graph-config'
import { isPromiseFulfilled } from '@sushiswap/validate'

import { ChefUser, getBuiltGraphSDK, QueryResolvers, Resolvers } from './.graphclient'

export const crossChainChefUser: QueryResolvers['crossChainChefUser'] = async (
  root,
  args,
  context,
  info
): Promise<ChefUser[]> => {
  const fetcher = async ({
    chainId,
    subgraphName,
    subgraphHost,
  }: {
    chainId: ChainId
    subgraphName:
      | typeof MASTERCHEF_V1_SUBGRAPH_NAME[number]
      | typeof MASTERCHEF_V2_SUBGRAPH_NAME[number]
      | typeof MINICHEF_SUBGRAPH_NAME[number]
    subgraphHost: typeof SUBGRAPH_HOST[number]
  }) => {
    const sdk = getBuiltGraphSDK({ subgraphHost, subgraphName, chainId })
    const { first, skip, where, block } = args
    return sdk.ChefUser({ first, skip, where: where ?? undefined, block: block ?? undefined }).then(({ users }) => {
      return users.map((user) => ({
        ...user,
        chainId,
        chainName: chainName[chainId],
      }))
    })
  }
  return Promise.allSettled([
    ...(args.chainIds.includes(ChainId.ETHEREUM)
      ? [MASTERCHEF_V1_SUBGRAPH_NAME, MASTERCHEF_V2_SUBGRAPH_NAME].map((subgraphName) =>
          fetcher({ chainId: ChainId.ETHEREUM, subgraphName, subgraphHost: SUBGRAPH_HOST[ChainId.ETHEREUM] })
        )
      : []),
    ...args.chainIds
      .filter((chainId): chainId is keyof typeof MINICHEF_SUBGRAPH_NAME => chainId in MINICHEF_SUBGRAPH_NAME)
      .map((chainId) =>
        fetcher({ chainId, subgraphName: MINICHEF_SUBGRAPH_NAME[chainId], subgraphHost: SUBGRAPH_HOST[chainId] })
      ),
  ]).then((promiseSettledResults) => {
    return promiseSettledResults
      .flat()
      .filter(isPromiseFulfilled)
      .flatMap((promiseFulfilled) => promiseFulfilled.value)
    // return users.flat().reduce((previous, current) => {
    //   if (current.status === 'fulfilled' && current.value.length > 0) {
    //     previous.push(...current.value)
    //   }
    //   return previous
    // }, [] as Awaited<ReturnType<typeof fetcher>>)
  })
}

// const crossChainPairs: QueryResolvers['crossChainPairs'] = async (root, args, context, info): Promise<Pair[]> => {
//   return Promise.all<Pair[]>(
//     args.chainIds
//       .filter((chainId): chainId is typeof SUSHISWAP_ENABLED_NETWORKS[number] =>
//         SUSHISWAP_ENABLED_NETWORKS.includes(chainId)
//       )
//       .map((chainId) => {
//         return context.SushiSwap.Query.pairs({
//           root,
//           args,
//           context: {
//             ...context,
//             chainId,
//             subgraphName: SUSHISWAP_SUBGRAPH_NAME[chainId],
//             subgraphHost: SUBGRAPH_HOST[chainId],
//           },
//           info,
//         }).then((pairs) => {
//           return pairs.map((pair) => ({ ...pair, chainId }))
//         })
//       })
//   ).then((pairs) => pairs.flat())
// }

export const resolvers: Resolvers = {
  Pair: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  Query: {
    crossChainChefUser,
  },
}
