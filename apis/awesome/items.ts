import 'server-only'

import { prisma } from '@/lib/prisma'
import { loginProcedure, publicProcedure, router } from '@/lib/trpc'
import { AwesomeCatelog, AwesomeItem, Prisma } from '@/models/client'
import { awesomeItemZod } from '@/zods/awesome'
import { deleteZod, idZod, resortZod } from '@/zods/common'

export type AwesomeTreeResult = AwesomeCatelog & {
  underAwesomes: Omit<AwesomeItemResult, 'underAwesomes'>[]
  parent?: Omit<AwesomeTreeResult, 'parent'>
}

export type AwesomeItemResult = Awaited<ReturnType<typeof items.get>>

export const items = router({
  tree: publicProcedure.query(async () => {
    const [list, noCatelog] = await Promise.all([
      prisma.awesomeCatelog.findMany({
        where: { parentId: null },
        orderBy: { index: 'asc' },
        include: {
          underAwesomes: {
            orderBy: { index: 'asc' },
            include: { tags: { orderBy: { index: 'asc' } } },
          },
          children: {
            orderBy: { index: 'asc' },
            include: {
              underAwesomes: {
                orderBy: { index: 'asc' },
                include: { tags: { orderBy: { index: 'asc' } } },
              },
            },
          },
        },
      }),
      prisma.awesomeItem.findMany({
        where: { catelogId: null },
        orderBy: { index: 'asc' },
        include: { tags: { orderBy: { index: 'asc' } } },
      }),
    ])

    const result = list
      .map(item => {
        const { children, ...rest } = item
        return [rest, children.map(child => ({ ...child, parent: rest }))]
      })
      .flat(2)

    if (noCatelog.length > 0) {
      result.unshift({
        id: '__no-id',
        name: '(无类别)',
        index: -1,
        underAwesomes: noCatelog,
      } as (typeof result)[0])
    }

    return result as AwesomeTreeResult[]
  }),

  get: publicProcedure.input(idZod).query(async ({ input }) => {
    const { id } = input
    const awesomeItem = await prisma.awesomeItem.findFirstOrThrow({
      where: { id },
      include: { catelog: { include: { parent: true } }, tags: true },
    })

    return awesomeItem
  }),

  add: loginProcedure.input(awesomeItemZod).mutation(async ({ input }) => {
    const index = await prisma.awesomeItem.count({
      where: { catelogId: input.catelogId || null },
    })

    return prisma.awesomeItem.create({
      data: { ...input, index, tags: { connect: input.tags?.map(id => ({ id })) } },
    })
  }),

  update: loginProcedure.input(awesomeItemZod).mutation(async ({ input }) => {
    const origin = await prisma.awesomeItem.findFirstOrThrow({ where: { id: input.id } })
    const data = input as AwesomeItem

    if (origin.catelogId !== input.catelogId) {
      data.index = await prisma.awesomeItem.count({ where: { catelogId: input.catelogId } })
      await prisma.awesomeItem.updateMany({
        where: { catelogId: origin.catelogId, index: { gt: origin.index! } },
        data: { index: { decrement: 1 } },
      })
    }

    return prisma.awesomeItem.update({
      where: { id: input.id },
      data: { ...data, tags: { set: input.tags?.map(id => ({ id })) } },
    })
  }),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input }) => {
    const item = await prisma.awesomeItem.findFirstOrThrow({ where: { id: input.id } })
    await prisma.awesomeItem.delete({ where: { id: item.id } })
    await prisma.awesomeItem.updateMany({
      where: { catelogId: item.catelogId, index: { gt: item.index! } },
      data: { index: { decrement: 1 } },
    })
  }),

  resort: loginProcedure.input(resortZod).mutation(async ({ input }) => {
    const caseSql = Prisma.join(
      input.map(item => Prisma.sql`WHEN ${item.id} THEN ${item.index}`),
      ' '
    )
    await prisma.$executeRaw`
      UPDATE "awesome_item"
      SET "index" = (CASE "id" ${caseSql} END)::integer
      WHERE "id" IN (${Prisma.join(input.map(item => item.id))})
    `
  }),
})
