import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/models/client'

export const prisma =
  ((globalThis as any).prisma as PrismaClient) ||
  (process.env.CI
    ? (null as unknown as PrismaClient)
    : new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.POSTGRESQL_URL }) }))

if (process.env.NODE_ENV !== 'production') {
  ;(globalThis as any).prisma = prisma
}
