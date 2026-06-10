'use client'

import { useQuery } from '@tanstack/react-query'
import { sleep } from 'omn'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/style'

interface TodoItem {
  id: string
  title: string
  done: boolean

  meta: {
    createAt: string
    createBy: string
  }
}

export interface TodoCardProps {
  id: string
}

let title = '学习 React'
let createBy = 'chiskat'

async function fetchTodo(id: string): Promise<TodoItem> {
  await sleep(500)

  return {
    id,
    title,
    done: false,
    meta: {
      createAt: '2025-01-01',
      createBy,
    },
  }
}

export function TodoCardDeep({ id }: TodoCardProps) {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),

    // 以下代码用于恢复 @tanstack/react-query 的默认配置
    structuralSharing: true,
    staleTime: 0,
  })
  const meta = data?.meta

  const [todoUpdates, setTodoUpdates] = useState(0)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data) setTodoUpdates(t => t + 1)
  }, [data])

  const [metaUpdates, setMetaUpdates] = useState(0)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (meta) setMetaUpdates(t => t + 1)
  }, [meta])

  if (isLoading || !data) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-500">
        请求中...
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-zinc-500">待办事项 (版本 {todoUpdates})</div>
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

        <div className="mt-4 inline-block space-y-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          <div>详情 (版本 {metaUpdates})</div>

          <div>
            <span className="text-zinc-400">创建人：</span>
            <span className="font-medium text-zinc-700">{meta?.createBy}</span>
          </div>

          <div>
            <span className="text-zinc-400">创建时间：</span>
            <span className="font-medium text-zinc-700">{meta?.createAt}</span>
          </div>
        </div>

        {isRefetching ? <div className="mt-3 text-sm text-sky-600">获取最新数据...</div> : null}
      </div>

      <div className="mt-3 space-x-3">
        <Button
          variant="outline"
          onClick={() => {
            title += '1'
            refetch()
          }}
        >
          更新 Todo
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            createBy += '1'
            refetch()
          }}
        >
          更新 Todo.Meta
        </Button>
      </div>
    </div>
  )
}
