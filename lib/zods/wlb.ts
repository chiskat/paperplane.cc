import z from 'zod'

import {
  SalaryDayType,
  WLBSubscriptionMessage,
  WLBSubscriptionType,
  WLBWeekendOffworkType,
} from '@/models/enums'

const OFFWORK_TIME_MIN = 17 * 60 * 60 * 1000
const OFFWORK_TIME_MAX = 21 * 60 * 60 * 1000

export const wlbOffworkTimeZod = z
  .int()
  .min(OFFWORK_TIME_MIN, '下班时间不能早于 17:00')
  .max(OFFWORK_TIME_MAX, '下班时间不能晚于 21:00')

export const wlbProfileZod = z.object({
  id: z.string().optional(),

  name: z.string('必须指定名称'),
  company: z.string('必须填写公司名称'),
  stockCode: z.string().nullish(),
  salaryDate: z
    .int()
    .refine(value => (value >= 1 && value <= 30) || (value >= -30 && value <= -1), {
      message: '发薪日只能为 1~30 或 -30~-1 的整数',
    }),
  offworkTime: wlbOffworkTimeZod,
  weekendOption: z
    .enum([
      WLBWeekendOffworkType.DEFAULT,
      WLBWeekendOffworkType.WORKDAY_SAT,
      WLBWeekendOffworkType.WORKDAY_SUN,
      WLBWeekendOffworkType.WORKDAY_WEEKEND,
    ])
    .default(WLBWeekendOffworkType.DEFAULT),
  salaryDayOption: z
    .enum([SalaryDayType.EARLY_TO_WORKDAY, SalaryDayType.LATER_TO_WORKDAY, SalaryDayType.ANYDAY])
    .default(SalaryDayType.EARLY_TO_WORKDAY),
  province: z.string('必须提供省份'),
  city: z.string('必须提供城市'),
  latitude: z.string('必须提供地理纬度'),
  longitude: z.string('必须提供地理经度'),
})

const wlbSubscriptionBaseZod = z.object({
  id: z.string().optional(),

  name: z.string(),
  enable: z.boolean().default(true),
  timeOffset: z.int().default(0),
  message: z
    .enum([WLBSubscriptionMessage.IMAGE, WLBSubscriptionMessage.TEXT, WLBSubscriptionMessage.ALL])
    .default(WLBSubscriptionMessage.IMAGE),
})

export const subConfigEmailZod = wlbSubscriptionBaseZod.extend({
  type: z.literal(WLBSubscriptionType.EMAIL),
  config: z.object({
    email: z.email(),
  }),
})

export const subConfigOARobotZod = wlbSubscriptionBaseZod.extend({
  type: z.literal(WLBSubscriptionType.OAROBOT),
  config: z.object({
    robotId: z.string(),
  }),
})

export const wlbSubscriptionZod = z.discriminatedUnion('type', [
  subConfigEmailZod,
  subConfigOARobotZod,
])
