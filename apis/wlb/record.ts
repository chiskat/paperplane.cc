import z from 'zod'

import { prisma } from '@/lib/prisma'
import { loginProcedure, router } from '@/lib/trpc'
import { idZod } from '@/lib/zods/common'
import { wlbRecord } from './helper/recorder'

export const record = router({
  record: loginProcedure.input(z.object({ profileId: z.string() })).mutation(async ({ input }) => {
    const wlbProfile = await prisma.wLBProfile.findUniqueOrThrow({ where: { id: input.profileId } })
    const result = await wlbRecord(wlbProfile)

    return result
  }),

  listByProfileAndDate: loginProcedure
    .input(z.object({ profileId: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ input }) => {
      const records = await prisma.wLBDailyRecord.findMany({
        where: {
          profileId: input.profileId,
          date: input.date,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          date: true,
          workday: true,
          _count: {
            select: {
              wlbNotificationRecords: { where: { ok: true } },
            },
          },
        },
      })

      return records.map(({ _count, ...record }) => ({
        ...record,
        notified: _count.wlbNotificationRecords > 0,
      }))
    }),

  get: loginProcedure.input(idZod).query(async ({ input }) => {
    return prisma.wLBDailyRecord.findUniqueOrThrow({
      where: input,
      include: { profile: { select: { company: true } } },
    })
  }),

  delete: loginProcedure.input(idZod).mutation(async ({ input }) => {
    return prisma.wLBDailyRecord.delete({ where: input })
  }),
})
