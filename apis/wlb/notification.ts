import { TRPCError } from '@trpc/server'
import z from 'zod'

import { sendByEmail, sendByOARobot } from '@/apis/wlb/helper/notification'
import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'
import { wlbSubscriptionZod } from '@/lib/zods/wlb'
import { WLBSubscriptionType } from '@/models/enums'

export const notification = router({
  listByRecord: loginProcedure
    .input(z.object({ recordId: z.string() }))
    .query(async ({ input }) => {
      return prisma.wLBNotificationRecord.findMany({
        where: { dailyRecordId: input.recordId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          ok: true,
          createdAt: true,
          subscription: { select: { id: true, name: true, type: true } },
        },
      })
    }),

  profileSendAll: loginProcedure
    .input(z.object({ recordId: z.string() }))
    .output(z.object({ ok: z.literal(true) }))
    .mutation(async ({ input }) => {
      const dailyRecord = await prisma.wLBDailyRecord.findUniqueOrThrow({
        where: { id: input.recordId },
      })
      const subscriptions = await prisma.wLBSubscription.findMany({
        where: { profileId: dailyRecord.profileId, enable: true },
      })

      const results = await Promise.all(
        subscriptions.map(subscription =>
          sendSubscriptionNotification(dailyRecord.id, subscription)
        )
      )

      if (results.some(ok => !ok)) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '部分通知发送失败' })
      }

      return { ok: true }
    }),

  subscriptionSend: loginProcedure
    .input(z.object({ recordId: z.string(), subscriptionId: z.string() }))
    .output(z.object({ ok: z.literal(true) }))
    .mutation(async ({ input }) => {
      const dailyRecord = await prisma.wLBDailyRecord.findUniqueOrThrow({
        where: { id: input.recordId },
      })
      const subscription = await prisma.wLBSubscription.findFirstOrThrow({
        where: { id: input.subscriptionId, profileId: dailyRecord.profileId, enable: true },
      })

      const ok = await sendSubscriptionNotification(dailyRecord.id, subscription)

      if (!ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '通知发送失败' })
      }

      return { ok: true }
    }),
})

export async function sendSubscriptionNotification(
  dailyRecordId: string,
  subscription: Awaited<ReturnType<typeof prisma.wLBSubscription.findFirstOrThrow>>
) {
  try {
    const dailyRecord = await prisma.wLBDailyRecord.findUniqueOrThrow({
      where: { id: dailyRecordId },
    })
    const parsedSubscription = wlbSubscriptionZod.parse(subscription)

    if (parsedSubscription.type === WLBSubscriptionType.OAROBOT) {
      await sendByOARobot(dailyRecord, parsedSubscription)
    } else {
      await sendByEmail(dailyRecord, parsedSubscription)
    }

    await prisma.wLBNotificationRecord.create({
      data: { ok: true, dailyRecordId, wlbSubscriptionId: subscription.id },
    })

    return true
  } catch {
    await prisma.wLBNotificationRecord.create({
      data: { ok: false, dailyRecordId, wlbSubscriptionId: subscription.id },
    })

    return false
  }
}
