'use client'

import {
  IconArmchair,
  IconBuilding,
  IconCalendarDollar,
  IconClock,
  IconMapPin,
  IconTrendingUp,
  type IconProps,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

import { useTRPC } from '@/lib/trpc-client'
import type { WLBProfile } from '@/models/browser'
import { WLBWeekendOffworkType } from '@/models/enums'
import { WLBPanelLoadingState } from '../_shared/panel-loading-state'

const TIME_FORMAT = 'HH:mm'

const weekendOptionLabelMap: Record<WLBWeekendOffworkType, string> = {
  [WLBWeekendOffworkType.DEFAULT]: '双休',
  [WLBWeekendOffworkType.WORKDAY_SAT]: '周日单休',
  [WLBWeekendOffworkType.WORKDAY_SUN]: '周六单休',
  [WLBWeekendOffworkType.WORKDAY_WEEKEND]: '无休息日',
}

type ProfileDetailItem = {
  Icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
  label: string
  value: string
}

export function WLBProfilePanel({ profileId }: { profileId: string }) {
  const trpc = useTRPC()
  const { data: profile, isPending } = useQuery({
    ...trpc.wlb.profile.get.queryOptions({ id: profileId }),
    enabled: Boolean(profileId),
  })

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {isPending ? <WLBPanelLoadingState /> : profile ? <ProfileDetail profile={profile} /> : null}
    </div>
  )
}

function ProfileDetail({ profile }: { profile: WLBProfile }) {
  const items: ProfileDetailItem[] = [
    {
      Icon: IconBuilding,
      label: '公司',
      value: profile.company,
    },
    {
      Icon: IconMapPin,
      label: '城市',
      value: `${profile.province} ${profile.city}`,
    },
    {
      Icon: IconClock,
      label: '下班时间',
      value: formatOffworkTime(profile.offworkTime),
    },
    {
      Icon: IconCalendarDollar,
      label: '发薪日',
      value: formatSalaryDate(profile.salaryDate),
    },
    {
      Icon: IconArmchair,
      label: '休息日',
      value: weekendOptionLabelMap[profile.weekendOption],
    },
    {
      Icon: IconTrendingUp,
      label: '股票代码',
      value: profile.stockCode || '-',
    },
  ]

  return (
    <div className="bg-background/72 border-border/60 grid gap-1.5 rounded-lg border p-1.5 shadow-xs sm:grid-cols-2">
      {items.map(({ Icon, label, value }) => (
        <InfoRow key={label} icon={<Icon aria-hidden />} label={label} value={value} />
      ))}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md px-2.5 py-2">
      <div className="bg-primary/8 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
        {icon}
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground truncate text-sm font-medium" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

function formatOffworkTime(value: number) {
  return dayjs().startOf('day').add(value, 'millisecond').format(TIME_FORMAT)
}

function formatSalaryDate(value: number) {
  if (value > 0) return `每月 ${value} 日`
  if (value === -1) return '每月最后一天'
  return `每月倒数第 ${Math.abs(value)} 天`
}
