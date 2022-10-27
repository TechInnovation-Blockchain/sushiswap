import { Resolvers } from '../../.graphclient'
import { crossChainBlocks, customBlocks, oneDayBlocks, oneWeekBlocks, twoDayBlocks } from './crossChainBlocks'
import { crossChainBundles } from './crossChainBundles'
import { crossChainChefUser } from './crossChainChefUser'
import { crossChainUserWithFarms } from './crossChainChefUserWithFarms'
import { crossChainFactories } from './crossChainFactories'
import { crossChainFactoryDaySnapshots } from './crossChainFactoryDaySnapshots'
import { crossChainLiquidityPositions } from './crossChainLiquidityPositions'
import { crossChainPair } from './crossChainPair'
import { crossChainPairs } from './crossChainPairs'
import { crossChainRebases } from './crossChainRebases'
import { crossChainToken } from './crossChainToken'
import { crossChainTokens } from './crossChainTokens'

/* eslint no-unused-vars: 0, unused-imports/no-unused-vars: 0, @typescript-eslint/no-unused-vars: 0 */

export const resolvers: Resolvers = {
  Block: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  Bundle: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  Factory: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  FactoryDaySnapshot: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    chainName: (root, args, context, info) => root.chainName || context.chainName || 'Ethereum',
    chainShortName: (root, args, context, info) => root.chainShortName || context.chainShortName || 'eth',
  },
  LiquidityPosition: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    chainName: (root, args, context, info) => root.chainName || context.chainName || 'Ethereum',
    chainShortName: (root, args, context, info) => root.chainShortName || context.chainShortName || 'eth',
  },
  Pair: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
    chainName: (root, args, context, info) => root.chainName || context.chainName || 'Ethereum',
    chainShortName: (root, args, context, info) => root.chainShortName || context.chainShortName || 'eth',
    volume1d: (root, args, context, info) => root.volume1d || '0',
    volume1w: (root, args, context, info) => root.volume1w || '0',
    fees1d: (root, args, context, info) => root.fees1d || '0',
    fees1w: (root, args, context, info) => root.fees1w || '0',
  },
  Rebase: {
    chainId: (root, args, context, info) => Number(root.chainId || context.chainId || 1),
  },
  Query: {
    crossChainBlocks,
    oneDayBlocks,
    twoDayBlocks,
    oneWeekBlocks,
    customBlocks,
    crossChainRebases,
    crossChainBundles,
    crossChainFactories,
    crossChainFactoryDaySnapshots,
    crossChainPair,
    crossChainPairs,
    crossChainTokens,
    crossChainToken,
    crossChainLiquidityPositions,
    crossChainChefUser,
    crossChainUserWithFarms,
  },
}
