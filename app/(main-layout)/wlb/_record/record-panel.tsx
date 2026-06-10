'use client'

import { IconPlus } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTable,
  CalendarTableDays,
  CalendarView,
  CalendarViewControl,
  CalendarViewDate,
  CalendarWeekDays,
  parseDate,
} from '@/components/ui/calendar'
import { DatePicker, DatePickerContent, DatePickerInput } from '@/components/ui/date-picker'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { WLBRecordListItem } from './record-list-item'
import { WLBPanelLoadingState } from '../_shared/panel-loading-state'

export function WLBRecordPanel({ profileId }: { profileId: string }) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const todayLabel = useMemo(() => dayjs(today).format('M月D日'), [today])

  const [selectedDate, setSelectedDate] = useState(today)
  const isSelectedToday = selectedDate === today
  const { data: records = [], isPending } = useQuery({
    ...trpc.wlb.record.listByProfileAndDate.queryOptions({ profileId, date: selectedDate }),
    enabled: Boolean(profileId),
  })

  const createMutation = useMutation({
    mutationFn: () => trpcClient.wlb.record.record.mutate({ profileId }),
    onSuccess: async () => {
      setSelectedDate(today)
      await queryClient.invalidateQueries({
        queryKey: trpc.wlb.record.listByProfileAndDate.queryKey({ profileId, date: today }),
      })
      toast.success({ title: '已完成', description: '成功生成 WLB 记录' })
    },
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <DatePicker
            className="w-44 *:data-[slot=date-picker-control]:w-full"
            locale="zh-CN"
            selectionMode="single"
            value={[parseDate(selectedDate)]}
            onValueChange={details => {
              const pickerVal = details.value[0] as
                | { year: number; month: number; day: number }
                | undefined

              if (!pickerVal) {
                return
              }

              setSelectedDate(formatPickerDate(pickerVal))
            }}
            disabled={!profileId}
          >
            <DatePickerInput size="sm" aria-label="记录日期" placeholder="选择日期" />
            <DatePickerContent>
              <CalendarView view="day">
                <CalendarViewControl>
                  <CalendarPrevTrigger />
                  <CalendarViewDate />
                  <CalendarNextTrigger />
                </CalendarViewControl>
                <CalendarTable>
                  <CalendarWeekDays />
                  <CalendarTableDays />
                </CalendarTable>
              </CalendarView>
            </DatePickerContent>
          </DatePicker>

          {!isSelectedToday ? (
            <Button
              type="button"
              size="xs"
              variant="link"
              className="px-2"
              disabled={!profileId}
              onClick={() => {
                setSelectedDate(today)
              }}
            >
              回到今天 ({todayLabel})
            </Button>
          ) : (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              仅包含当日消息推送情况
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="shrink-0"
          isLoading={createMutation.isPending}
          disabled={!profileId}
          onClick={() => {
            void createMutation.mutateAsync()
          }}
        >
          <IconPlus data-icon="inline-start" />
          {createMutation.isPending ? '生成中...' : '生成记录'}
        </Button>
      </div>

      {isPending ? (
        <WLBPanelLoadingState />
      ) : records.length === 0 ? (
        <EmptyState title="当天暂无记录" description="选择其他日期或生成当日 WLB 记录" />
      ) : (
        <ScrollArea className="min-h-0 flex-1 pr-1" scrollFade>
          <div className="flex flex-col gap-3">
            {records.map(record => (
              <WLBRecordListItem key={record.id} record={record} profileId={profileId} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function formatPickerDate(value: { year: number; month: number; day: number }) {
  return dayjs(new Date(value.year, value.month - 1, value.day)).format('YYYY-MM-DD')
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-input rounded-lg border border-dashed px-4 py-8 text-center">
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  )
}
