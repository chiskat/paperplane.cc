import 'server-only'

import { TRPCError } from '@trpc/server'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { loginProcedure, publicProcedure, router } from '@/lib/trpc'
import { deleteZod, paginationZod } from '@/lib/zods/common'
import { addShortItemZod, shortItemReturn, shortItemZod } from '@/lib/zods/short'
import { Short } from '@/models/client'
import { ShortFindFirstArgs, ShortWhereInput } from '@/models/models'
import { createShortURL } from './create-short-url'

export const items = router({
  list: publicProcedure
    .input(
      paginationZod
        .extend({ keyword: z.string().optional() })
        .optional()
        .default({ page: 1, pageSize: 10 })
    )
    .query(async ({ ctx, input }) => {
      const session = await ctx.getSession()
      const { page, pageSize, keyword } = input

      const where: ShortWhereInput = {}
      if (!session?.user) {
        where.public = true
      }
      if (keyword) {
        where.OR = [
          { key: { contains: keyword, mode: 'insensitive' } },
          { url: { contains: keyword, mode: 'insensitive' } },
          { tag: { contains: keyword, mode: 'insensitive' } },
        ]
      }

      const queryOptions: ShortFindFirstArgs = {
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }
      const [list, total] = await prisma.$transaction([
        prisma.short.findMany(queryOptions),
        prisma.short.count({ where }),
      ])

      const result: Pagination<Short> = {
        list,
        page: page,
        pageSize,
        total,
        totalPage: Math.ceil(total / pageSize),
      }

      return result
    }),

  add: loginProcedure
    .meta({ openapi: { method: 'POST', path: '/short', protect: true } })
    .input(addShortItemZod)
    .output(shortItemReturn)
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.getSession()
      const userId = session!.user.id

      return createShortURL(input, userId)
    }),

  get: publicProcedure
    .input(z.object({ key: shortItemZod.shape.key.unwrap() }))
    .query(async ({ input }) => {
      const key = input.key
      const item = await prisma.short.findFirst({
        where: { key, OR: [{ expiredAt: { gt: new Date() } }, { expiredAt: null }] },
        include: { author: true },
      })

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `此短链接码 “${key}” 无效，请确保曾创建过它，且只在其有效期内使用`,
        })
      }

      return item
    }),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input }) => {
    const id = input.id
    await prisma.short.delete({ where: { id } })
  }),
})
