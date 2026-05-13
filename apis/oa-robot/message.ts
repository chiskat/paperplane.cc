import { prisma } from '@/lib/prisma'
import { loginProcedure, publicProcedure, router } from '@/lib/trpc'
import { OARobotSendByConfigZod, OARobotSendByIdZod } from '@/lib/zods/oa-robot'
import { OARobotProfile } from '@/models/client'
import { sendMessage } from './helper/sender'

export const messages = router({
  sendById: loginProcedure.input(OARobotSendByIdZod).mutation(async ({ input, ctx }) => {
    const session = await ctx.getSession()
    const { robotId: id, message } = input
    const userId = session!.user.id

    const profile = await prisma.oARobotProfile.findFirstOrThrow({ where: { userId, id } })
    const result = await sendMessage(profile, message)

    return result
  }),

  sendByConfig: publicProcedure.input(OARobotSendByConfigZod).mutation(async ({ input }) => {
    const { message, ...profile } = input
    const result = await sendMessage(profile as OARobotProfile, message)

    return result
  }),
})
