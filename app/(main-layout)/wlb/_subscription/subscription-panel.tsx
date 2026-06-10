'use client'

import { IconPlus, IconSend2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { cn } from '@/utils/style'
import { WLBSubscriptionEditButton } from './subscription-edit-button'
import { WLBSubscriptionListItem } from './subscription-list-item'
import { WLBPanelLoadingState } from '../_shared/panel-loading-state'

export function WLBSubscriptionPanel({ profileId }: { profileId: string }) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  const { data: profile, isPending: profilePending } = useQuery({
    ...trpc.wlb.profile.get.queryOptions({ id: profileId }),
    enabled: Boolean(profileId),
  })

  const { data: subscriptions = [], isPending: subscriptionsPending } = useQuery({
    ...trpc.wlb.subscription.listByProfile.queryOptions({ profileId }),
    enabled: Boolean(profileId),
  })

  const { data: records = [], isPending: recordsPending } = useQuery({
    ...trpc.wlb.record.listByProfileAndDate.queryOptions({ profileId, date: today }),
    enabled: Boolean(profileId),
  })

  const todayRecord = records.find(record => record.date === today)
  const todayRecordId = todayRecord?.id ?? null
  const todayRecordReady = Boolean(todayRecordId)
  const enabledSubscriptionCount = subscriptions.filter(subscription => subscription.enable).length
  const loading = profilePending || subscriptionsPending || recordsPending
  const sendAllMutation = useMutation({
    mutationFn: async () => {
      if (!todayRecordId) {
        throw new Error('今日记录未完成，暂不可推送')
      }

      return trpcClient.wlb.notification.profileSendAll.mutate({ recordId: todayRecordId })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.wlb.record.listByProfileAndDate.queryKey({ profileId, date: today }),
        }),
        todayRecordId
          ? queryClient.invalidateQueries({
              queryKey: trpc.wlb.notification.listByRecord.queryKey({ recordId: todayRecordId }),
            })
          : undefined,
      ])
      toast.success({ title: '推送成功', description: '已向全部启用订阅推送今日 WLB 消息' })
    },
    onError: error => {
      toast.error({ title: '推送失败', description: getErrorMessage(error) })
    },
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <RecordStatus isPending={recordsPending} ready={todayRecordReady} today={today} />

        {profile ? (
          <div className="flex shrink-0 items-center gap-3">
            <Button
              size="sm"
              className="shrink-0"
              disabled={!todayRecordReady || enabledSubscriptionCount === 0}
              isLoading={sendAllMutation.isPending}
              onClick={() => {
                void sendAllMutation.mutateAsync()
              }}
            >
              <IconSend2 data-icon="inline-start" />
              {sendAllMutation.isPending ? '推送中...' : '全部推送'}
            </Button>

            <WLBSubscriptionEditButton profile={profile} size="sm" className="shrink-0">
              <IconPlus data-icon="inline-start" />
              添加订阅
            </WLBSubscriptionEditButton>
          </div>
        ) : null}
      </div>

      {loading ? (
        <WLBPanelLoadingState />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="暂无订阅消息"
          description="点击“添加订阅”即可通过电子邮件或 OA 机器人接受每日消息"
        />
      ) : profile ? (
        <ScrollArea className="min-h-0 flex-1 pr-1" scrollFade>
          <div className="flex flex-col gap-3">
            {subscriptions.map(subscription => (
              <WLBSubscriptionListItem
                key={subscription.id}
                subscription={subscription}
                profile={profile}
                todayRecordId={todayRecordId}
                todayRecordReady={todayRecordReady}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  )
}

function RecordStatus({
  isPending,
  ready,
  today,
}: {
  isPending: boolean
  ready: boolean
  today: string
}) {
  const dateLabel = dayjs(today).format('M月D日')

  return (
    <div
      className={cn('text-muted-foreground flex min-w-0 items-center gap-2 text-sm font-medium')}
    >
      <span className="truncate">
        {isPending
          ? `正在检查今日(${dateLabel})记录...`
          : ready
            ? `今日（${dateLabel}）记录已生成，可推送消息`
            : `今日（${dateLabel}）无 WLB 记录未生成，请生成`}
      </span>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '请稍后重试'
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-input rounded-lg border border-dashed px-4 py-8 text-center">
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  )
}
