'use client'

import { useQuery } from '@tanstack/react-query'
import { sleep } from 'omn'

import { cn } from '@/utils/style'

interface TodoItem {
  id: string
  title: string
  done: boolean
}

export interface TodoCardProps {
  id: string
}

async function fetchTodo(id: string): Promise<TodoItem> {
  await sleep(1500)
  return { id, title: '学习 React', done: false }
}

export default function TodoCard({ id }: TodoCardProps) {
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),

    // 以下代码用于恢复 @tanstack/react-query 的默认配置
    structuralSharing: true,
    staleTime: 0,
  })

  if (isLoading || !data) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-500">
        加载中...
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-500">待办事项</div>
          <div className="mt-1 text-lg font-medium text-zinc-900">{data.title}</div>
        </div>

        <div
          className={cn(
            'rounded-full px-2.5 py-1 text-sm font-medium',
            data.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          )}
        >
          {data.done ? '已完成' : '未完成'}
        </div>
      </div>

      {isRefetching ? <div className="mt-3 text-sm text-sky-600">获取最新数据...</div> : null}
    </div>
  )
}
