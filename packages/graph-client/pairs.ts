import { SUBGRAPH_HOST, SUSHISWAP_ENABLED_NETWORKS, SUSHISWAP_SUBGRAPH_NAME } from '@sushiswap/graph-config'

import { Pair, QueryResolvers, Resolvers } from './.graphclient'

const crossChainPairs: QueryResolvers['crossChainPairs'] = async (root, args, context, info): Promise<Pair[]> => {
  return Promise.all<Pair[]>(
    args.chainIds
      .filter((chainId): chainId is typeof SUSHISWAP_ENABLED_NETWORKS[number] =>
        SUSHISWAP_ENABLED_NETWORKS.includes(chainId)
      )
      .map((chainId) => {
        return context.SushiSwap.Query.pairs({
          root,
          args,
          context: {
            ...context,
            chainId,
            subgraphName: SUSHISWAP_SUBGRAPH_NAME[chainId],
            subgraphHost: SUBGRAPH_HOST[chainId],
          },
          info,
        }).then((pairs) => {
          return pairs.map((pair) => ({ ...pair, chainId }))
        })
      })
  ).then((pairs) => pairs.flat())
}

export const resolvers: Resolvers = {
  Pair: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  Query: {
    crossChainPairs,
  },
}
