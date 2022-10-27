const { getBuiltGraphSDK } = require('./.graphclient')

const sdk = getBuiltGraphSDK({
  chainId: 1,
  subgraphName: 'sushiswap/exchange',
})

sdk
  .getLiquidityPositions({
    first: 5000,
    skip: 0,
    where: { user: '0x5ad6211cd3fde39a9cecb5df6f380b8263d1e277' },
  })
  .then(({ liquidityPositions }) => {
    console.log({ liquidityPositions })
  })
