import { Prisma, PrismaClient } from '@prisma/client'

/**
 * Filters pools to only include the ones that are new or have changed.
 * @param client
 * @param pools
 * @returns
 */
export async function filterPools(
  client: PrismaClient,
  pools: Prisma.PoolCreateManyInput[]
): Promise<Prisma.PoolCreateManyInput[]> {
  const poolSelect = Prisma.validator<Prisma.PoolSelect>()({
    id: true,
    address: true,
    liquidityUSD: true,
  })

  let poolsToCreate = 0
  let poolsToUpdate = 0

    const poolsFound = await client.pool.findMany({
      where: {
        address: { in: pools.map((pool) => pool.address) },
      },
      select: poolSelect,
    })

    const filteredPools = pools.filter((pool) => {
      const poolExists = poolsFound.find((p) => p.id === pool.id)
      if (!poolExists) {
        poolsToCreate++
        return true
      }
      if (
        Number(pool.liquidityUSD).toFixed(2) !== poolExists.liquidityUSD.toFixed(2).toString()
      ) {
        poolsToUpdate++
        return true
      }
      return false
    })
  return filteredPools
}