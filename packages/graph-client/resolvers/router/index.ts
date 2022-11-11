import { Query, Resolvers } from '../../.graphclient'

export const resolvers: Resolvers = {
  Query: {
    positiveSlippage: async (root, args, context, info) => {
      const swaps: Query['ROUTER_swaps'] = await context.Router.Query.ROUTER_swaps({
        root,
        args,
        context,
        info,
      }).then((swaps: Query['ROUTER_swaps']) => {
        if (!Array.isArray(swaps)) {
          console.error('router swaps query failed', swaps)
          return []
        }
        return swaps
      })

      console.log({ swaps })

      // const tokenOutAddresses = Array.from(new Set(swaps.filter((swap) => swap.tokenIn).map((swap) => swap.tokenIn.id)))
      // console.log({ tokenOutAddresses })

      return { positiveSlippage: 0 }

      // const sdk = getBuiltGraphSDK()
      // const { prices } = await sdk.TokenPricesByChainId(
      //   { chainId: ChainId.ETHEREUM, first: 1000, skip: 0 },
      //   {
      //     context: {
      //       subgraphName: SUSHISWAP_SUBGRAPH_NAME[ChainId.ETHEREUM],
      //       subgraphHost: SUBGRAPH_HOST[ChainId.ETHEREUM],
      //     },
      //   }
      // )
      // console.log({ prices })

      // const sdk = getBuiltGraphSDK({
      //   subgraphName: SUSHISWAP_SUBGRAPH_NAME[ChainId.ETHEREUM],
      //   subgraphHost: SUBGRAPH_HOST[ChainId.ETHEREUM],
      // })
      // const { tokens } = await sdk.TokensByChainId({ chainId: ChainId.ETHEREUM, first: 1000, skip: 0 })

      // console.log({ tokens })

      // const prices: Query['tokenPrices'] = await context.SushiSwap.Query.tokenPrices({
      //   root,
      //   args: {
      //     first: 1000,
      //     skip: 0,
      //   },
      //   context: {
      //     ...context,
      //     chainId: ChainId.ETHEREUM,
      //     subgraphName: SUSHISWAP_SUBGRAPH_NAME[ChainId.ETHEREUM],
      //     subgraphHost: SUBGRAPH_HOST[ChainId.ETHEREUM],
      //   },
      //   info,
      // }).then((prices: any) => {
      //   console.log('prices???', prices)
      // })

      // const tokens: Query['tokens'] = await context.SushiSwap.Query.tokens({
      //   root,
      //   args: {
      //     first: 1000,
      //     skip: 0,
      //   },
      //   context: {
      //     ...context,
      //     chainId: ChainId.ETHEREUM,
      //     subgraphName: SUSHISWAP_SUBGRAPH_NAME[ChainId.ETHEREUM],
      //     subgraphHost: SUBGRAPH_HOST[ChainId.ETHEREUM],
      //   },
      //   info,
      // }).then((tokens: any) => {
      //   console.log('tokens???', tokens)
      // })

      // return {
      //   positiveSlippage:
      //     swaps?.reduce((previousValue, currentValue) => {
      //       if (
      //         !currentValue?.tokenOut?.id ||
      //         !currentValue?.tokenOut?.decimalsSuccess ||
      //         currentValue?.positiveSlippage === '0'
      //       ) {
      //         return previousValue
      //       }

      //       const token = tokens.find((token: Token) => token.id === currentValue.tokenOut.id)
      //       if (!token || !token?.price || token?.price?.lastUsdPrice === '0') {
      //         return previousValue
      //       }

      //       const positiveSlippage =
      //         (Number(currentValue.positiveSlippage) / Math.pow(10, Number(currentValue.tokenOut.decimals))) *
      //         Number(token.price.lastUsdPrice)
      //       return previousValue + positiveSlippage
      //     }, 0) ?? 0,
      // }
    },
  },
}
