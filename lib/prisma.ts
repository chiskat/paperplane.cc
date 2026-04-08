import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/models/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ||
  (process.env.CI
    ? (undefined as unknown as PrismaClient)
    : new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.POSTGRESQL_URL }) }))

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
