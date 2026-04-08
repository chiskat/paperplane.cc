import 'server-only'

import { omit } from 'lodash-es'

import { prisma } from '@/lib/prisma'
import { loginProcedure, publicProcedure, router } from '@/lib/trpc'
import { AwesomeCatelog, Prisma } from '@/models/client'
import { awesomeCatelogZod } from '@/zods/awesome'
import { deleteZod, resortZod } from '@/zods/common'

export interface AwesomeCatelogNode extends AwesomeCatelog {
  children: AwesomeCatelogNode[]
}

export const catelogs = router({
  tree: publicProcedure.query(async () => {
    const list = await prisma.awesomeCatelog.findMany({ orderBy: { index: 'asc' } })
    const map = new Map<any, AwesomeCatelogNode>()
    const tree: AwesomeCatelogNode[] = []

    list?.forEach(item => void map.set(item.id, { ...item, children: [] }))
    list?.forEach(item => {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children.push(map.get(item.id)!)
      } else {
        tree.push(map.get(item.id)!)
      }
    })

    return tree
  }),

  list: publicProcedure.query(async () => {
    const list = await prisma.awesomeCatelog.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { index: 'asc' }, include: { parent: true } },
        parent: true,
      },
      orderBy: { index: 'asc' },
    })
    const result = list
      .map(item => {
        const { children, ...rest } = item
        return [rest, children]
      })
      .flat(2)

    return result
  }),

  add: loginProcedure.input(awesomeCatelogZod).mutation(async ({ input }) => {
    const index = input.parentId
      ? await prisma.awesomeCatelog.count({ where: { parentId: input.parentId } })
      : await prisma.awesomeCatelog.count()

    return prisma.awesomeCatelog.create({ data: { ...(input as any), index } })
  }),

  update: loginProcedure
    .input(awesomeCatelogZod)
    .mutation(({ input }) =>
      prisma.awesomeCatelog.update({ where: { id: input.id }, data: omit(input, 'children') })
    ),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input }) => {
    const item = await prisma.awesomeCatelog.findFirstOrThrow({ where: { id: input.id } })
    await prisma.awesomeCatelog.delete({ where: { id: item.id } })
    await prisma.awesomeCatelog.updateMany({
      where: { parentId: item.parentId, index: { gt: item.index! } },
      data: { index: { decrement: 1 } },
    })
  }),

  resort: loginProcedure.input(resortZod).mutation(async ({ input }) => {
    const caseSql = Prisma.join(
      input.map(item => Prisma.sql`WHEN ${item.id} THEN ${item.index}`),
      ' '
    )
    await prisma.$executeRaw`
      UPDATE "awesome_catelog"
      SET "index" = (CASE "id" ${caseSql} END)::integer
      WHERE "id" IN (${Prisma.join(input.map(item => item.id))})
    `
  }),
})
