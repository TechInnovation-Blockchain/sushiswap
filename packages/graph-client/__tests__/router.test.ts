import { getBuiltGraphSDK } from '..'

describe('Router', () => {
  const sdk = getBuiltGraphSDK()
  it('should return tokens for multiple chain ids', async () => {
    const { positiveSlippage } = await sdk.PositiveSlippage()
    console.log({ positiveSlippage })
    expect(positiveSlippage).toBeGreaterThan(0)
  })
})
