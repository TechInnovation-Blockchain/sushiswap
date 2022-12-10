import { Prisma, PrismaClient } from '@prisma/client'

export async function createTokens(client: PrismaClient, tokens: Prisma.TokenCreateManyInput[]) {
  if (tokens.length === 0) {
    return
  }
  const created = await client.token.createMany({
    data: tokens,
    skipDuplicates: true,
  })

  console.log(`LOAD - Created ${created.count} tokens. `)
}