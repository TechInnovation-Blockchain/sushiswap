import { GraphQLResolveInfo } from 'graphql'

import { Query, QueryResolvers, QuerytokenPricesByChainIdArgs } from '../../.graphclient'
import { SushiSwapTypes } from '../../.graphclient/sources/SushiSwap/types'
import { TridentTypes } from '../../.graphclient/sources/Trident/types'
import { _tokenPricesByChainIds } from './tokenPricesByChainIds'

export const _tokenPricesByChainId = async (
  root = {},
  args: QuerytokenPricesByChainIdArgs,
  context: SushiSwapTypes.Context & TridentTypes.Context,
  info: GraphQLResolveInfo
): Promise<Query['tokenPricesByChainId']> => {
  return _tokenPricesByChainIds(root, { ...args, chainIds: [args.chainId] }, context, info)
}

export const tokenPricesByChainId: QueryResolvers['tokenPricesByChainId'] = async (
  root,
  args,
  context,
  info
): Promise<Query['tokenPricesByChainId']> => {
  return _tokenPricesByChainId(root, args, context, info)
}
