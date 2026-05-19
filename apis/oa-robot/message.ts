import z from 'zod'

import { prisma } from '@/lib/prisma'
import { loginProcedure, publicProcedure, router } from '@/lib/trpc'
import {
  OARobotSendByConfigZod,
  OARobotSendByIdOpenAPIZod,
  OARobotSendByIdZod,
} from '@/lib/zods/oa-robot'
import { OARobotProfile } from '@/models/client'
import { sendMessage } from './helper/sender'

export const messages = router({
  sendById: loginProcedure
    .meta({ openapi: { method: 'POST', path: '/oa-robot/{robotId}/send', protect: true } })
    .input(OARobotSendByIdOpenAPIZod)
    .output(z.object({ ok: z.literal(true) }))
    .mutation(async ({ input, ctx }) => {
      const data = OARobotSendByIdZod.parse(input)
      const session = await ctx.getSession()

      const { robotId: id, ...message } = data
      const userId = session!.user.id

      const profile = await prisma.oARobotProfile.findFirstOrThrow({ where: { userId, id } })
      await sendMessage(profile, message)

      return { ok: true }
    }),

  sendByConfig: publicProcedure.input(OARobotSendByConfigZod).mutation(async ({ input }) => {
    const { type, accessToken, secret, extraAuthentication, ...message } = input
    await sendMessage({ type, accessToken, secret, extraAuthentication } as OARobotProfile, message)
  }),
})
