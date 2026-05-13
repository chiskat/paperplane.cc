import 'server-only'

import { TRPCError } from '@trpc/server'

import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'
import { deleteZod, idZod, resortZod } from '@/lib/zods/common'
import { OARobotProfileZod } from '@/lib/zods/oa-robot'
import { Prisma } from '@/models/client'

export const profile = router({
  list: loginProcedure.query(async ({ ctx }) => {
    return prisma.oARobotProfile.findMany({
      where: { userId: ctx.user.id },
      orderBy: [{ index: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, type: true },
    })
  }),

  get: loginProcedure.input(idZod).query(async ({ input, ctx }) => {
    return prisma.oARobotProfile.findFirstOrThrow({
      where: { id: input.id, userId: ctx.user.id },
    })
  }),

  add: loginProcedure
    .input(OARobotProfileZod.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.getSession()
      const index = await prisma.oARobotProfile.count({ where: { userId: session!.user.id } })

      return prisma.oARobotProfile.create({
        data: { ...input, index, userId: session!.user.id },
      })
    }),

  update: loginProcedure
    .input(OARobotProfileZod.extend({ id: OARobotProfileZod.shape.id.unwrap() }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      await prisma.oARobotProfile.findFirstOrThrow({
        where: { id, userId: ctx.user.id },
      })

      return prisma.oARobotProfile.update({ where: { id }, data })
    }),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input, ctx }) => {
    const item = await prisma.oARobotProfile.findFirstOrThrow({
      where: { id: input.id, userId: ctx.user.id },
    })
    await prisma.oARobotProfile.delete({ where: { id: item.id } })
    await prisma.oARobotProfile.updateMany({
      where: { userId: ctx.user.id, index: { gt: item.index! } },
      data: { index: { decrement: 1 } },
    })
  }),

  resort: loginProcedure.input(resortZod).mutation(async ({ input, ctx }) => {
    const ids = input.map(item => item.id)
    const ownedItems = await prisma.oARobotProfile.findMany({
      where: { id: { in: ids }, userId: ctx.user.id },
      select: { id: true },
    })

    if (ownedItems.length !== input.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '排序数据无效' })
    }

    const caseSql = Prisma.join(
      input.map(item => Prisma.sql`WHEN ${item.id} THEN ${item.index}`),
      ' '
    )

    await prisma.$executeRaw`
      UPDATE "oa_robot_profile"
      SET "index" = (CASE "id" ${caseSql} END)::integer
      WHERE "id" IN (${Prisma.join(ids)}) AND "user_id" = ${ctx.user.id}
    `
  }),
})
