import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'
import { deleteZod, idZod } from '@/lib/zods/common'
import { wlbProfileZod } from '@/lib/zods/wlb'

export const profile = router({
  list: loginProcedure.query(async () => {
    return prisma.wLBProfile.findMany({ select: { id: true, name: true } })
  }),

  get: loginProcedure.input(idZod).query(async ({ input }) => {
    return prisma.wLBProfile.findUniqueOrThrow({ where: input })
  }),

  add: loginProcedure.input(wlbProfileZod).mutation(async ({ ctx, input }) => {
    const session = await ctx.getSession()
    const data = { ...input, userId: session?.user.id }
    const result = await prisma.wLBProfile.create({ data })

    return result
  }),

  update: loginProcedure
    .input(wlbProfileZod.extend({ id: wlbProfileZod.shape.id.unwrap() }))
    .mutation(async ({ input }) => {
      const { id } = input
      await prisma.wLBProfile.findUniqueOrThrow({ where: { id } })
      const result = await prisma.wLBProfile.update({ data: input, where: { id: input.id } })

      return result
    }),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input }) => {
    const { id } = input
    await prisma.wLBProfile.findUniqueOrThrow({ where: { id } })
    await prisma.wLBProfile.delete({ where: { id } })
  }),
})
