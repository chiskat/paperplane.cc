import 'server-only'

import { initTRPC, TRPCError } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { cache } from 'react'
import superjson from 'superjson'
import { OpenApiMeta } from 'trpc-to-openapi'

import { Prisma } from '@/models/client'
import { auth } from './auth'

export const createTRPCContext = cache(
  async (opts: Partial<FetchCreateContextFnOptions> | null) => ({
    async getSession() {
      return opts?.req ? await auth.api.getSession(opts.req) : null
    },

    async getHeaders() {
      return opts?.req?.headers
    },
  })
)
export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<TRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          prismaCode:
            error.cause instanceof Prisma.PrismaClientKnownRequestError ? error.cause.code : null,
        },
      }
    },
  })

export const { router, createCallerFactory, procedure: baseProcedure } = t

const prismaErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2001':
        case 'P2015':
        case 'P2018':
        case 'P2025':
          throw new TRPCError({ code: 'NOT_FOUND', message: '资源不存在', cause: err })
        case 'P2002':
          throw new TRPCError({ code: 'CONFLICT', message: '数据已存在', cause: err })
        case 'P2003':
          throw new TRPCError({ code: 'BAD_REQUEST', message: '关联数据不存在', cause: err })
        case 'P2011':
          throw new TRPCError({ code: 'BAD_REQUEST', message: '字段不能为空', cause: err })
        case 'P2014':
          throw new TRPCError({ code: 'BAD_REQUEST', message: '违反必要的关联关系', cause: err })
        case 'P2006':
        case 'P2007':
        case 'P2019':
          throw new TRPCError({ code: 'BAD_REQUEST', message: '输入数据无效', cause: err })
        case 'P2020':
          throw new TRPCError({ code: 'BAD_REQUEST', message: '数值超出字段类型范围', cause: err })
        case 'P2024':
          throw new TRPCError({
            code: 'TIMEOUT',
            message: '数据库连接超时，请稍后重试',
            cause: err,
          })
        case 'P2034':
          throw new TRPCError({ code: 'TIMEOUT', message: '事务冲突，请稍后重试', cause: err })
        default:
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '数据库操作失败',
            cause: err,
          })
      }
    }
    throw err
  }
})

export const publicProcedure = baseProcedure.use(prismaErrorMiddleware)

export const loginProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.getSession()
  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({ ctx: { ...ctx, user: session.user, session } })
})
