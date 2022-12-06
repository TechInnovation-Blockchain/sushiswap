import hardhat from 'hardhat'

import { getBigNumber } from '@sushiswap/tines'
import { WETH9ABI } from '../ABI/WETH9.mjs'
import { BentoBox } from '@sushiswap/route-processor/dist/liquidityProviders/Trident.mjs'
import { ChainId } from '@sushiswap/chain'
import { SUSHI, Token, WNATIVE } from '@sushiswap/currency'
import { expect } from 'chai'
import { DataFetcher } from '@sushiswap/route-processor/dist/DataFetcher.mjs'
import { Router } from '@sushiswap/route-processor/dist/Router.mjs'
import { getRouteProcessorCode } from '@sushiswap/route-processor/dist/TinesToRouteProcessor.mjs'

import { configureChains, chain, createClient } from '@wagmi/core'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'

const { ethers, network } = hardhat

const { provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.polygon],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })]
)

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
})

const delay = async (ms) => new Promise((res) => setTimeout(res, ms))

const WRAPPED_NATIVE = {
  [ChainId.ETHEREUM]: new Token({
    chainId: ChainId.ETHEREUM,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  }),
  [ChainId.POLYGON]: new Token({
    chainId: ChainId.POLYGON,
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    decimals: 18,
    symbol: 'WMATIC',
    name: 'Wrapped Matic',
  }),
}

class BackCounter {
  start
  current

  constructor(start) {
    this.start = start
    this.current = start
  }

  async wait() {
    while (this.current > 0) {
      console.log(`Wait ${this.current} sec ...`)
      this.current--
      await delay(1000)
    }
  }

  reset() {
    this.current = this.start
  }
}

async function testRouter(chainId, amountIn, toToken, swaps = 1) {
  let provider
  switch (chainId) {
    case ChainId.ETHEREUM:
      provider = new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_API_KEY)
      break
    case ChainId.POLYGON:
      provider = new ethers.providers.AlchemyProvider('matic', process.env.ALCHEMY_POLYGON_API_KEY)
      break
    default:
      throw new Error('Unsupported net!')
  }

  const amountInBN = getBigNumber(amountIn * 1e18)
  const baseWrappedToken = WRAPPED_NATIVE[chainId]

  console.log(`1. ${chainId} Find best route ...`)
  const backCounter = new BackCounter(3)
  const dataFetcher = new DataFetcher(provider, chainId)
  dataFetcher.startDataFetching()
  dataFetcher.fetchPoolsForToken(baseWrappedToken, toToken)
  const router = new Router(dataFetcher, baseWrappedToken, amountInBN, toToken, 30e9)
  router.startRouting((r) => {
    //console.log('Known Pools:', dataFetcher.poolCodes.reduce((a, b) => ))
    const printed = router.routeToString(r, baseWrappedToken, toToken)
    console.log(printed)
    backCounter.reset()
  })

  await backCounter.wait()
  router.stopRouting()
  dataFetcher.stopDataFetching()

  console.log(`2. ChainId=${chainId} RouteProcessor deployment ...`)

  const RouteProcessor = await ethers.getContractFactory('RouteProcessor')
  const routeProcessor = await RouteProcessor.deploy(BentoBox[chainId] || '0x0000000000000000000000000000000000000000')
  await routeProcessor.deployed()

  console.log('3. User creation ...')
  const [Alice] = await ethers.getSigners()

  console.log(`4. Deposit user's ${amountIn} ${WNATIVE[chainId].symbol} to ${baseWrappedToken.symbol}`)
  await Alice.sendTransaction({
    to: baseWrappedToken.address,
    value: amountInBN.mul(swaps),
  })

  console.log(`5. Approve user's ${baseWrappedToken.symbol} to the route processor ...`)
  const WrappedBaseTokenContract = await new ethers.Contract(baseWrappedToken.address, WETH9ABI, Alice)
  await WrappedBaseTokenContract.connect(Alice).approve(routeProcessor.address, amountInBN.mul(swaps))

  console.log('6. Create route processor code ...')
  const route = router.getBestRoute()
  const code = getRouteProcessorCode(route, routeProcessor.address, Alice.address, dataFetcher.getCurrentPoolCodeMap())

  console.log('7. Call route processor ...')
  const amountOutMin = route.amountOutBN.mul(getBigNumber((1 - 0.005) * 1_000_000)).div(1_000_000)

  const toTokenContract = await new ethers.Contract(toToken.address, WETH9ABI, Alice)
  const balanceOutBNBefore = await toTokenContract.connect(Alice).balanceOf(Alice.address)
  const tx = await routeProcessor.processRoute(
    baseWrappedToken.address,
    route.amountInBN,
    toToken.address,
    amountOutMin,
    Alice.address,
    code
  )
  const receipt = await tx.wait()

  console.log("8. Fetching user's output balance ...")
  const balanceOutBN = (await toTokenContract.connect(Alice).balanceOf(Alice.address)).sub(balanceOutBNBefore)
  console.log(`    expected amountOut: ${route.amountOutBN.toString()}`)
  console.log(`    real amountOut:     ${balanceOutBN.toString()}`)
  const slippage = parseInt(balanceOutBN.sub(route.amountOutBN).mul(10_000).div(route.amountOutBN).toString())
  console.log(`    slippage: ${slippage / 100}%`)
  console.log(`    gas use: ${receipt.gasUsed.toString()}`)
}

describe('RouteCreator', async function () {
  it('Ethereum WETH => FEI check', async function () {
    const forking_url = network.config?.forking?.url
    if (forking_url !== undefined && forking_url.search('eth-mainnet') >= 0) {
      expect(process.env.ALCHEMY_API_KEY).not.undefined
      const FEI = new Token({
        chainId: ChainId.ETHEREUM,
        address: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
        decimals: 18,
        symbol: 'FEI',
        name: 'Fei USD',
      })
      await testRouter(ChainId.ETHEREUM, 10, FEI)
    }
  })

  it('Polygon WMATIC => SUSHI check', async function () {
    const forking_url = network.config?.forking?.url
    if (forking_url !== undefined && forking_url.search('polygon') >= 0) {
      expect(process.env.ALCHEMY_POLYGON_API_KEY).not.undefined
      await testRouter(ChainId.POLYGON, 1_000_000, SUSHI[ChainId.POLYGON])
    }
  })
})
