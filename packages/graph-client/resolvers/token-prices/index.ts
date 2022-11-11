import { Resolvers } from '../../.graphclient'
import { tokenPricesByChainId } from './tokenPricesByChainId'
import { tokenPricesByChainIds } from './tokenPricesByChainIds'

export const resolvers: Resolvers = {
  TokenPrice: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  Query: {
    tokenPricesByChainIds,
    tokenPricesByChainId,
  },
}
