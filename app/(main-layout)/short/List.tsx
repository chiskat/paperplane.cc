'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, type ReactNode } from 'react'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTRPC } from '@/lib/trpc-client'
import { ShortRedirectType } from '@/models/enums'
import { shortURLPrefix } from '@/zods/short'

const PAGE_SIZE = 10

const redirectTypeLabelMap: Record<ShortRedirectType, string> = {
  [ShortRedirectType.PERMANENTLY]: '永久重定向 (301)',
  [ShortRedirectType.TEMPORARY]: '临时重定向 (302)',
  [ShortRedirectType.JAVASCRIPT]: 'JavaScript 跳转',
}

const linkColorClassName =
  'text-[#2f629d] decoration-[#2f629d]/40 transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60'

type ShortListItem = {
  id: string
  key: string
  url: string
  tag: string | null
  redirectType: ShortRedirectType
  expiredAt: Date | null
  public: boolean
  createdAt: Date
}

export function List({ actions, banner }: { actions?: ReactNode; banner?: ReactNode }) {
  const trpc = useTRPC()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const queryInput = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      keyword: keyword.trim() || undefined,
    }),
    [keyword, page]
  )

  const { data, isPending, isFetching } = useQuery({
    ...trpc.short.items.list.queryOptions(queryInput),
    placeholderData: previous => previous,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/90 py-2 backdrop-blur">
        <label className="block w-full sm:w-[18rem] md:w-[20rem] lg:w-88">
          <span className="mb-2 block text-xs tracking-wide text-slate-500 uppercase">
            搜索短链接
          </span>
          <Input
            size="lg"
            value={keyword}
            onChange={event => {
              setPage(1)
              setKeyword(event.target.value)
            }}
            placeholder="支持按 key、目标 URL、标签过滤"
            className="h-10 rounded-xl bg-white px-4"
          />
        </label>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      {banner}

      <div>
        <ShortTable data={data?.list ?? []} loading={isPending} />

        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            第 {data?.page ?? page} / {Math.max(data?.totalPage ?? 1, 1)} 页，共 {data?.total ?? 0}{' '}
            条记录
            {isFetching && !isPending ? '，刷新中' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-3 text-sm"
              disabled={(data?.page ?? page) <= 1}
              onClick={() => setPage(current => Math.max(current - 1, 1))}
            >
              <IconChevronLeft size={14} />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-3 text-sm"
              disabled={(data?.page ?? page) >= (data?.totalPage ?? 1)}
              onClick={() => setPage(current => Math.min(current + 1, data?.totalPage ?? current))}
            >
              下一页
              <IconChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShortTable({ data, loading }: { data: ShortListItem[]; loading: boolean }) {
  if (loading) {
    return <p className="px-4 py-6 text-sm text-slate-500">正在加载...</p>
  }

  if (data.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-500">暂无短链接记录</p>
  }

  return (
    <Table className="w-max min-w-full table-fixed">
      <colgroup>
        <col style={{ width: '10rem' }} />
        <col style={{ width: '24rem' }} />
        <col style={{ width: '8rem' }} />
        <col style={{ width: '10rem' }} />
        <col style={{ width: '10rem' }} />
        <col style={{ width: '5rem' }} />
        <col style={{ width: '10rem' }} />
      </colgroup>

      <TableHeader>
        <TableRow>
          <TableHead>短链接</TableHead>
          <TableHead>目标地址</TableHead>
          <TableHead>标签</TableHead>
          <TableHead>跳转类型</TableHead>
          <TableHead>有效期</TableHead>
          <TableHead>公开</TableHead>
          <TableHead>创建时间</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="inline-flex max-w-full items-center gap-1.5">
                <span className="truncate font-mono text-slate-800" title={item.key}>
                  {item.key}
                </span>
                <CopyButton
                  value={`${shortURLPrefix}${item.key}`}
                  size="sm"
                  className="ml-1 h-6 w-6 shrink-0 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                />
              </div>
            </TableCell>

            <TableCell className="w-[24rem] max-w-[24rem]">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`block w-full min-w-0 truncate underline underline-offset-[3px] ${linkColorClassName}`}
                title={item.url}
              >
                {item.url}
              </a>
            </TableCell>

            <TableCell>
              <span className="block truncate" title={item.tag || '-'}>
                {item.tag || '-'}
              </span>
            </TableCell>

            <TableCell>{redirectTypeLabelMap[item.redirectType]}</TableCell>

            <TableCell>{item.expiredAt ? formatTime(item.expiredAt) : '永久有效'}</TableCell>

            <TableCell>{item.public ? '是' : '否'}</TableCell>

            <TableCell>{formatTime(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatTime(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
