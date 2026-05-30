'use client'

import { IconInfoCircle, IconMail, IconRobotFace } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/lib/trpc-client'
import { WLBSubscriptionType } from '@/models/enums'
import { cn } from '@/utils/style'

type NotificationRecordItem = {
  id: string
  ok: boolean
  createdAt: Date | string
  subscription: {
    id: string
    name: string
    type: WLBSubscriptionType
  } | null
}

export function WLBNotificationRecord({ recordId }: { recordId: string }) {
  const trpc = useTRPC()
  const {
    data: records = [],
    isPending,
    isError,
    error,
  } = useQuery({
    ...trpc.wlb.notification.listByRecord.queryOptions({ recordId }),
    enabled: Boolean(recordId),
  })

  if (isPending) {
    return <NotificationRecordSkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <IconInfoCircle aria-hidden />
        <AlertTitle>推送记录加载失败</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    )
  }

  if (records.length === 0) {
    return (
      <div className="border-input rounded-lg border border-dashed px-4 py-8 text-center">
        <p className="text-foreground text-sm font-medium">暂无推送记录</p>
        <p className="text-muted-foreground mt-2 text-sm">这条 WLB 记录还没有触发过消息推送</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {records.map(record => (
        <NotificationRecordListItem key={record.id} record={record} />
      ))}
    </div>
  )
}

function NotificationRecordListItem({ record }: { record: NotificationRecordItem }) {
  const subscription = record.subscription
  const TypeIcon = subscription?.type === WLBSubscriptionType.EMAIL ? IconMail : IconRobotFace

  return (
    <article className="border-input bg-background rounded-lg border px-3 py-3">
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        <div
          className={cn(
            'mt-1 shrink-0',
            subscription?.type === WLBSubscriptionType.EMAIL
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <TypeIcon className="size-4" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-foreground min-w-0 text-sm leading-6 font-medium wrap-break-word">
            {subscription?.name ?? '未知订阅'}
          </p>

          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-sm leading-5">
            <span
              className={cn(
                'inline-flex shrink-0 font-medium',
                record.ok ? 'text-success' : 'text-destructive'
              )}
            >
              <span>{record.ok ? '推送成功' : '推送失败'}</span>
            </span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{formatSubscriptionType(subscription?.type)}</span>
            <span aria-hidden>·</span>
            <time className="min-w-0" dateTime={formatDateTime(record.createdAt)}>
              {formatDateTime(record.createdAt)}
            </time>
          </div>
        </div>
      </div>
    </article>
  )
}

function NotificationRecordSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border-input rounded-lg border px-3 py-3">
          <div className="flex items-start gap-3">
            <Skeleton className="size-8" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatSubscriptionType(type?: WLBSubscriptionType) {
  if (type === WLBSubscriptionType.EMAIL) {
    return '邮件'
  }

  if (type === WLBSubscriptionType.OAROBOT) {
    return 'OA 机器人'
  }

  return '未知类型'
}

function formatDateTime(value: Date | string) {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '请稍后重试'
}
