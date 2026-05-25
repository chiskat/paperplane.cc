'use client'

import {
  IconBellRinging,
  IconBriefcase,
  IconCalendarEvent,
  IconChartLine,
  IconCloud,
  IconExternalLink,
  IconEye,
  IconGasStation,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { ComponentProps, ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTRPC } from '@/lib/trpc-client'
import type { WLBDailyRecord } from '@/models/browser'
import { cn } from '@/utils/style'
import { WLBNotificationRecord } from './NotificationRecord'

type WLBRecordDetail = WLBDailyRecord & {
  profile?: {
    company: string
  } | null
}

export interface WLBRecordDetailButtonProps extends Omit<ComponentProps<typeof Button>, 'id'> {
  id: string
  children?: ReactNode
}

type DetailItem = {
  label: string
  value: ReactNode
  href?: string
}

type DetailSection = {
  title: string
  icon: typeof IconInfoCircle
  items: DetailItem[]
}

export function WLBRecordDetailButton({
  id,
  children,
  variant = 'ghost',
  size = 'icon-sm',
  className,
  disabled,
  ...restProps
}: WLBRecordDetailButtonProps) {
  const trpc = useTRPC()
  const { data, isPending, isError, error, refetch } = useQuery({
    ...trpc.wlb.record.get.queryOptions({ id }),
    enabled: false,
  })
  const record = data as WLBRecordDetail | undefined

  return (
    <Dialog
      onOpenChange={({ open }) => {
        if (open) {
          void refetch()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
          aria-label="查看 WLB 记录详情"
          {...restProps}
        >
          {children ?? <IconEye aria-hidden />}
        </Button>
      </DialogTrigger>

      <DialogContent
        size="3xl"
        className="max-h-[min(92svh,760px)] max-w-[min(94vw,920px)] overflow-hidden sm:max-w-[min(94vw,920px)]"
      >
        <DialogHeader title="WLB 记录" />

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden p-(--space) pt-0"
          data-slot="dialog-body"
        >
          {isPending ? (
            <RecordDetailSkeleton />
          ) : isError ? (
            <Alert variant="destructive">
              <IconInfoCircle aria-hidden />
              <AlertTitle>记录加载失败</AlertTitle>
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          ) : record ? (
            <Tabs defaultValue="fields" className="min-h-105 flex-1 gap-4 overflow-hidden">
              <TabsList
                variant="underline"
                className="[&::-webkit-scrollbar]:display-none max-w-full shrink-0 overflow-x-auto [scrollbar-width:none]"
              >
                <TabsTrigger value="fields">
                  <IconInfoCircle aria-hidden />
                  每日生活资讯
                </TabsTrigger>
                <TabsTrigger value="traffic">
                  <IconPhoto aria-hidden />
                  交通状况（快照）
                </TabsTrigger>
                <TabsTrigger value="notification-records">
                  <IconBellRinging aria-hidden />
                  推送记录
                </TabsTrigger>
              </TabsList>

              <ScrollableTabsContent value="fields">
                <RecordFields record={record} />
              </ScrollableTabsContent>

              <ScrollableTabsContent value="traffic">
                <TrafficSnapshot record={record} />
              </ScrollableTabsContent>

              <ScrollableTabsContent value="notification-records">
                <WLBNotificationRecord recordId={record.id} />
              </ScrollableTabsContent>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ScrollableTabsContent({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent className={cn('min-h-0 overflow-hidden', className)} {...props}>
      <ScrollArea className="min-h-0 pr-1" scrollFade>
        <div className="pb-4">{children}</div>
      </ScrollArea>
    </TabsContent>
  )
}

function RecordFields({ record }: { record: WLBRecordDetail }) {
  const sections: DetailSection[] = [
    {
      title: '基础信息',
      icon: IconCalendarEvent,
      items: [
        { label: '公司', value: record.profile?.company || '未记录' },
        { label: '日期', value: formatDate(record.date) },
        { label: '类型', value: record.workday ? '工作日' : '休息日' },
      ],
    },
    {
      title: '天气',
      icon: IconCloud,
      items: [
        { label: '今天', value: `${record.todayWeather} ${record.todayTemperature}` },
        { label: '明天', value: `${record.tomorrowWeather} ${record.tomorrowTemperature}` },
      ],
    },
    {
      title: '通勤',
      icon: IconMapPin,
      items: [{ label: '附近路况', value: record.traffic }],
    },
    {
      title: '发薪日',
      icon: IconBriefcase,
      items: [
        { label: '下次发薪日', value: record.nextSalaryDate },
        { label: '剩余天数', value: formatSalaryDays(record.daysToSalaryDate) },
      ],
    },
    {
      title: '当地油价',
      icon: IconGasStation,
      items: [
        { label: '92#', value: formatPrice(record.h92) },
        { label: '95#', value: formatPrice(record.h95) },
        { label: '98#', value: formatPrice(record.h98) },
      ],
    },
    {
      title: '公司股价',
      icon: IconChartLine,
      items: [
        { label: '今日股价', value: formatNullableNumber(record.todayStock) },
        { label: '昨日股价', value: formatNullableNumber(record.yesterdayStock) },
        { label: '涨跌额', value: formatStockDelta(record.stockDelta) },
      ],
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {sections.map(section => (
        <DetailSection key={section.title} section={section} />
      ))}
    </div>
  )
}

function DetailSection({ section }: { section: DetailSection }) {
  const Icon = section.icon

  return (
    <section className="border-input bg-background rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-md">
          <Icon aria-hidden />
        </span>
        <h3 className="text-foreground text-sm font-semibold">{section.title}</h3>
      </div>

      <dl className="flex flex-col gap-2">
        {section.items.map(item => (
          <div key={item.label} className="grid min-w-0 gap-1 sm:grid-cols-[92px_minmax(0,1fr)]">
            <dt className="text-muted-foreground text-xs leading-6">{item.label}</dt>
            <dd className="text-foreground min-w-0 text-sm leading-6 wrap-break-word">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex min-w-0 items-center gap-1 hover:underline"
                >
                  <span className="truncate">{item.value}</span>
                  <IconExternalLink aria-hidden />
                </a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function TrafficSnapshot({ record }: { record: WLBRecordDetail }) {
  if (!record.trafficImageURL) {
    return (
      <div className="border-input bg-muted text-muted-foreground flex min-h-64 items-center justify-center rounded-lg border border-dashed text-sm">
        暂无交通状况快照
      </div>
    )
  }

  return (
    <a href={record.trafficImageURL} target="_blank" rel="noreferrer" className="block">
      <img
        src={record.trafficImageURL}
        alt={`${formatDate(record.date)} 交通状况快照`}
        className="bg-muted max-h-[70vh] w-full rounded-lg object-contain"
      />
    </a>
  )
}

function RecordDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border-input rounded-lg border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="size-8" />
              <Skeleton className="h-4 w-24" />
            </div>
            <SkeletonText lines={4} />
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return dayjs(value).format('YYYY 年 M 月 D 日')
}

function formatSalaryDays(value: number) {
  return value > 0 ? `${value} 天` : '今天'
}

function formatPrice(value: number) {
  return `￥${value}`
}

function formatNullableNumber(value?: number | null) {
  return typeof value === 'number' ? value : '未记录'
}

function formatStockDelta(value?: number | null) {
  if (typeof value !== 'number') {
    return '未记录'
  }

  return value > 0 ? `+${value}` : value
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '请稍后重试'
}
