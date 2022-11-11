import { chainName, chainShortName } from '@sushiswap/chain'
import { SUBGRAPH_HOST, SUSHISWAP_ENABLED_NETWORKS, SUSHISWAP_SUBGRAPH_NAME } from '@sushiswap/graph-config'
import { GraphQLResolveInfo } from 'graphql'

import { Query, QueryResolvers, QuerytokenPricesByChainIdsArgs, TokenPrice } from '../../.graphclient'
import { SushiSwapTypes } from '../../.graphclient/sources/SushiSwap/types'
import { TridentTypes } from '../../.graphclient/sources/Trident/types'

export const _tokenPricesByChainIds = async (
  root = {},
  args: QuerytokenPricesByChainIdsArgs,
  context: SushiSwapTypes.Context & TridentTypes.Context,
  info: GraphQLResolveInfo
): Promise<Query['tokenPricesByChainIds']> => {
  return Promise.all<Query['tokenPricesByChainIds'][]>([
    ...args.chainIds
      .filter((el) => SUSHISWAP_ENABLED_NETWORKS.includes(el))
      .map((chainId: typeof SUSHISWAP_ENABLED_NETWORKS[number]) =>
        context.SushiSwap.Query.tokenPrices({
          root,
          args,
          context: {
            ...context,
            chainId,
            chainName: chainName[chainId],
            chainShortName: chainShortName[chainId],
            subgraphName: SUSHISWAP_SUBGRAPH_NAME[chainId],
            subgraphHost: SUBGRAPH_HOST[chainId],
          },
          info,
        }).then((prices: TokenPrice[]) => {
          if (!Array.isArray(prices)) {
            console.error(`SushiSwap tokenPrices query failed on ${chainId}`, prices)
            return []
          }

          return prices.length > 0
            ? prices.map((token) => ({
                ...token,
                id: `${chainShortName[chainId]}:${token.id}`,
                chainId,
              }))
            : []
        })
      ),
  ]).then((value) => value.flat())
}

export const tokenPricesByChainIds: QueryResolvers['tokenPricesByChainIds'] = async (root, args, context, info) => {
  return _tokenPricesByChainIds(root, args, context, info)
}
