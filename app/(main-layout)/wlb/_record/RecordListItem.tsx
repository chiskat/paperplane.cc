'use client'

import {
  IconArmchair,
  IconBellCheck,
  IconBellOff,
  IconBriefcase,
  IconCalendarEvent,
  IconListDetails,
  IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'

import { cn } from '@/utils/style'
import { WLBRecordDeleteButton } from './RecordDeleteButton'
import { WLBRecordDetailButton } from './RecordDetailButton'

export type WLBRecordListItemData = {
  id: string
  date: string
  workday: boolean
  notified: boolean
}

export interface WLBRecordListItemProps {
  record: WLBRecordListItemData
  profileId: string
}

export function WLBRecordListItem({ record, profileId }: WLBRecordListItemProps) {
  const formattedDate = formatDate(record.date)

  return (
    <article className="border-input bg-background rounded-lg border px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="[&>*+*]:before:text-muted-foreground/50 flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2 [&>*+*]:before:pointer-events-none [&>*+*]:before:mr-2 [&>*+*]:before:content-['•'] [&>*+*]:before:select-none">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-primary flex size-5 shrink-0 items-center justify-center">
              <IconCalendarEvent aria-hidden />
            </span>
            <time className="text-foreground truncate text-sm font-medium" dateTime={record.date}>
              {formattedDate}
            </time>
          </div>

          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium',
              record.workday ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {record.workday ? (
              <IconBriefcase className="size-4" aria-hidden />
            ) : (
              <IconArmchair className="size-4" aria-hidden />
            )}
            {record.workday ? '工作日' : '休息日'}
          </span>

          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium',
              record.notified ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {record.notified ? (
              <IconBellCheck className="size-4" aria-hidden />
            ) : (
              <IconBellOff className="size-4" aria-hidden />
            )}
            {record.notified ? '已通知' : '未通知'}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <WLBRecordDetailButton
            id={record.id}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <IconListDetails data-icon="inline-start" aria-hidden />
            查看详情
          </WLBRecordDetailButton>

          <WLBRecordDeleteButton
            profileId={profileId}
            recordId={record.id}
            recordDate={formattedDate}
            recordQueryDate={record.date}
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive data-[state=open]:bg-destructive/10 data-[state=open]:text-destructive"
            aria-label={`删除 ${formattedDate} 的 WLB 记录`}
          >
            <IconTrash aria-hidden />
          </WLBRecordDeleteButton>
        </div>
      </div>
    </article>
  )
}

function formatDate(value: string) {
  return dayjs(value).format('YYYY 年 M 月 D 日')
}
