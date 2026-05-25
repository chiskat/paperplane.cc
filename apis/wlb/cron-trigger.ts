import dayjs from 'dayjs'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'
import { wlbRecord } from './helper/recorder'
import { sendSubscriptionNotification } from './notification'

const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000

const cronTriggerInputZod = z
  .object({ interval: z.int().min(0).default(DEFAULT_TOLERANCE_MS) })
  .optional()
  .default({ interval: DEFAULT_TOLERANCE_MS })

export const cronTrigger = router({
  trigger: loginProcedure
    .meta({ openapi: { method: 'POST', path: '/wlb/cron-trigger', protect: true } })
    .input(cronTriggerInputZod)
    .output(z.object({ ok: z.literal(true) }))
    .mutation(async ({ input }) => {
      const now = dayjs()
      const end = now.add(input.interval, 'millisecond')

      const subscriptions = await prisma.wLBSubscription.findMany({
        where: { enable: true },
        include: { profile: true },
        orderBy: { createdAt: 'asc' },
      })

      const matchedSubscriptions = subscriptions
        .map(subscription => {
          const triggerAt = now
            .startOf('day')
            .add(subscription.profile.offworkTime + subscription.timeOffset, 'millisecond')

          return { subscription, triggerAt }
        })
        .filter(({ triggerAt }) => !triggerAt.isBefore(now) && !triggerAt.isAfter(end))

      for (const { subscription } of matchedSubscriptions) {
        try {
          const record = await wlbRecord(subscription.profile)

          if (!record.workday) {
            continue
          }

          await sendSubscriptionNotification(record.id, subscription)
        } catch (error) {
          console.error(error)
        }
      }

      return { ok: true }
    }),
})
