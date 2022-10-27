import { BLOCKS_SUBGRAPH_NAME, SUBGRAPH_HOST } from '@sushiswap/graph-config'
import { addSeconds, getUnixTime, startOfHour, startOfMinute, startOfSecond, subDays } from 'date-fns'

import { Block, QueryResolvers } from '../../graph-client/.graphclient'

export const crossChainBlocks: QueryResolvers['crossChainBlocks'] = async (
  root,
  args,
  context,
  info
): Promise<Block[]> => {
  return Promise.all<Block[]>(
    args.chainIds
      .filter((chainId) => chainId in BLOCKS_SUBGRAPH_NAME)
      .map((chainId) => {
        return context.Blocks.Query.blocks({
          root,
          args,
          context: {
            ...context,
            chainId,
            subgraphName: BLOCKS_SUBGRAPH_NAME[chainId],
            subgraphHost: SUBGRAPH_HOST[chainId],
          },
          info,
        })
      })
  ).then((blocks) => blocks.flat())
}

export const oneDayBlocks: QueryResolvers['oneDayBlocks'] = async (root, args, context, info) => {
  const date = startOfSecond(startOfMinute(startOfHour(subDays(Date.now(), 1))))
  const start = getUnixTime(date)
  const end = getUnixTime(addSeconds(date, 600))
  const blocks = await crossChainBlocks(
    root,
    {
      ...args,
      where: { timestamp_gt: start, timestamp_lt: end },
    },
    context,
    info
  )
  return blocks
}

export const twoDayBlocks: QueryResolvers['twoDayBlocks'] = async (root, args, context, info) => {
  const date = startOfSecond(startOfMinute(startOfHour(subDays(Date.now(), 2))))
  const start = getUnixTime(date)
  const end = getUnixTime(addSeconds(date, 600))
  const blocks = await crossChainBlocks(
    root,
    {
      ...args,
      where: { timestamp_gt: start, timestamp_lt: end },
    },
    context,
    info
  )
  return blocks
}

export const oneWeekBlocks: QueryResolvers['oneWeekBlocks'] = async (root, args, context, info) => {
  const date = startOfSecond(startOfMinute(startOfHour(subDays(Date.now(), 7))))
  const start = getUnixTime(date)
  const end = getUnixTime(addSeconds(date, 600))
  const blocks = await crossChainBlocks(
    root,
    {
      ...args,
      where: { timestamp_gt: start, timestamp_lt: end },
    },
    context,
    info
  )
  return blocks
}

export const customBlocks: QueryResolvers['customBlocks'] = async (root, args, context, info) => {
  const start = args.timestamp
  const end = start + 600
  const blocks = await crossChainBlocks(
    root,
    {
      ...args,
      where: { timestamp_gt: start, timestamp_lt: end },
    },
    context,
    info
  )
  return blocks
}
