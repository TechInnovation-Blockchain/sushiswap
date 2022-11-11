import { ChainId } from '@sushiswap/chain'

import { getBuiltGraphSDK } from './dist'
;(async () => {
  const sdk = getBuiltGraphSDK()

  const { swaps } = await sdk.RouterSwaps({
    first: 5000,
    skip: 0,
    where: {
      txTo: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
      tokenOut_in: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
      ],
    },
    orderBy: 'positiveSlippage',
    orderDirection: 'desc',
  })
  // console.log({ swaps })

  const tokenOutAddresses = Array.from(new Set(swaps.map((swap) => swap.tokenOut.id)))
  // console.log({ tokenOutAddresses })

  const { bundles } = await sdk.Bundles({ chainIds: [ChainId.ETHEREUM] })

  const [bundle] = bundles

  const { tokens } = await sdk.TokensByChainIds({
    first: 5000,
    skip: 0,
    chainIds: [ChainId.ETHEREUM],
    where: {
      id_in: tokenOutAddresses,
    },
  })

  swaps.reverse().forEach((swap) => {
    console.log(
      `Swap out ${swap.tokenOut.symbol} on ethereum, found ${swap.positiveSlippage} ($${
        (Number(swap.positiveSlippage) / Math.pow(10, Number(swap.tokenOut.decimals))) *
        Number(tokens.find((token) => token.id.split(':')[1] === swap.tokenOut.id)?.price?.derivedNative) *
        Number(bundle?.nativePrice)
      })`
    )
  })

  console.log({
    positiveSlippageUSD: swaps?.reduce((previousValue, currentValue) => {
      if (
        !currentValue?.tokenOut?.id ||
        !currentValue?.tokenOut?.decimalsSuccess ||
        currentValue?.positiveSlippage === '0'
      ) {
        return previousValue
      }

      const token = tokens.find((token) => token.id.split(':')[1] === currentValue.tokenOut.id)

      const tokenPrice = Number(token?.price?.derivedNative) * Number(bundle?.nativePrice)

      const positiveSlippage =
        (Number(currentValue.positiveSlippage) / Math.pow(10, Number(currentValue.tokenOut.decimals))) * tokenPrice

      return previousValue + positiveSlippage
    }, 0),
  })
})()
