import z from 'zod'

import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'
import { deleteZod, idZod } from '@/lib/zods/common'
import { wlbSubscriptionZod } from '@/lib/zods/wlb'

const profileIdZod = z.object({ profileId: z.string() })

export const subscription = router({
  listByProfile: loginProcedure.input(profileIdZod).query(async ({ input }) => {
    const { profileId } = input
    return prisma.wLBSubscription.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, enable: true, type: true, timeOffset: true },
    })
  }),

  get: loginProcedure.input(idZod).query(async ({ input }) => {
    return prisma.wLBSubscription.findUniqueOrThrow({ where: input })
  }),

  add: loginProcedure
    .input(wlbSubscriptionZod.and(profileIdZod))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.getSession()
      const data = { ...input, userId: session?.user.id }
      const result = await prisma.wLBSubscription.create({ data })

      return result
    }),

  update: loginProcedure
    .input(wlbSubscriptionZod.and(z.object({ id: z.string(), profileId: z.string().optional() })))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      await prisma.wLBSubscription.findUniqueOrThrow({ where: { id } })
      const result = await prisma.wLBSubscription.update({ data, where: { id } })

      return result
    }),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input }) => {
    const { id } = input
    await prisma.wLBSubscription.findUniqueOrThrow({ where: { id } })
    await prisma.wLBSubscription.delete({ where: { id } })
  }),
})
