'use client'

import {
  IconCheck,
  IconEdit,
  IconMail,
  IconRobotFace,
  IconSend,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import type { WLBProfile, WLBSubscription } from '@/models/browser'
import { WLBSubscriptionType } from '@/models/enums'
import { cn } from '@/utils/style'
import { WLBSubscriptionDeleteButton } from './subscription-delete-button'
import { WLBSubscriptionEditButton } from './subscription-edit-button'

export interface WLBSubscriptionListItemProps {
  subscription: Pick<WLBSubscription, 'id' | 'name' | 'enable' | 'type' | 'timeOffset'>
  profile: WLBProfile
  todayRecordId: string | null
  todayRecordReady: boolean
}

export function WLBSubscriptionListItem({
  subscription,
  profile,
  todayRecordId,
  todayRecordReady,
}: WLBSubscriptionListItemProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const { id, name, enable, type, timeOffset } = subscription

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const TypeIcon = type === WLBSubscriptionType.EMAIL ? IconMail : IconRobotFace

  const sendDisabledTitle = !enable
    ? '订阅已停用，暂不可推送'
    : !todayRecordReady
      ? '今日记录未完成，暂不可推送'
      : undefined
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!todayRecordId) {
        throw new Error('今日记录未完成，暂不可推送')
      }

      return trpcClient.wlb.notification.subscriptionSend.mutate({
        recordId: todayRecordId,
        subscriptionId: id,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.wlb.record.listByProfileAndDate.queryKey({
            profileId: profile.id,
            date: today,
          }),
        }),
        todayRecordId
          ? queryClient.invalidateQueries({
              queryKey: trpc.wlb.notification.listByRecord.queryKey({ recordId: todayRecordId }),
            })
          : undefined,
      ])
      toast.success({ title: '推送成功', description: `已向“${name}”推送今日 WLB 消息` })
    },
    onError: error => {
      toast.error({ title: '推送失败', description: getErrorMessage(error) })
    },
  })

  return (
    <div className="border-input bg-background rounded-lg border px-3 py-3">
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        <div className="flex size-6 shrink-0 items-center justify-center">
          <TypeIcon className="text-primary" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-foreground min-w-0 text-base leading-6 font-medium wrap-break-word"
            title={name}
          >
            {name}
          </p>

          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1 text-sm leading-5">
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 font-medium',
                enable ? 'text-success' : 'text-destructive'
              )}
            >
              {enable ? <IconCheck className="size-3.5 shrink-0" aria-hidden /> : null}
              <span>{enable ? '已启用' : '已停用'}</span>
            </span>
            <span aria-hidden>·</span>
            <span className="wrap-break-word">
              {type === WLBSubscriptionType.EMAIL ? '邮件' : 'OA 机器人'}
            </span>
            <span aria-hidden>·</span>
            <span className="wrap-break-word">
              {formatSubscriptionTime(profile.offworkTime, timeOffset)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
            disabled={!enable || !todayRecordReady}
            isLoading={sendMutation.isPending}
            aria-label={`向 ${name} 推送今日 WLB 消息`}
            title={sendDisabledTitle ?? `向 ${name} 推送今日 WLB 消息`}
            onClick={() => {
              void sendMutation.mutateAsync()
            }}
          >
            <IconSend data-icon="inline-start" aria-hidden />
            {sendMutation.isPending ? '推送中...' : '推送消息'}
          </Button>

          <WLBSubscriptionEditButton
            profile={profile}
            subscriptionId={id}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
            aria-label={`编辑 ${name}`}
          >
            <IconEdit aria-hidden />
            编辑
          </WLBSubscriptionEditButton>

          <WLBSubscriptionDeleteButton
            profileId={profile.id}
            subscriptionId={id}
            subscriptionName={name}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive data-[state=open]:bg-destructive/10 data-[state=open]:text-destructive"
            aria-label={`删除 ${name}`}
          >
            <IconTrash aria-hidden />
          </WLBSubscriptionDeleteButton>
        </div>
      </div>
    </div>
  )
}

function formatSubscriptionTime(offworkTime: number, timeOffset: number) {
  const triggerTime = dayjs()
    .startOf('day')
    .add(offworkTime + timeOffset, 'millisecond')
    .format('HH:mm')

  if (timeOffset === 0) {
    return `每日 ${triggerTime} 触发，准时`
  }

  const absMinutes = Math.abs(Math.round(timeOffset / 60000))
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  const label =
    hours > 0
      ? [`${hours} 小时`, minutes > 0 ? `${minutes} 分钟` : null].filter(Boolean).join(' ')
      : `${minutes} 分钟`

  return timeOffset < 0
    ? `每日 ${triggerTime} 触发，提前 ${label}`
    : `每日 ${triggerTime} 触发，延后 ${label}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '请稍后重试'
}
