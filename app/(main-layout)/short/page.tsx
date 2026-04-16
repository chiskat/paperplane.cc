'use client'

import { IconExternalLink, IconLink, IconPlus } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import z from 'zod'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { ShortRedirectType } from '@/models/enums'

const PAGE_SIZE = 10

const redirectTypeLabelMap: Record<ShortRedirectType, string> = {
  [ShortRedirectType.PERMANENTLY]: '永久重定向 (301)',
  [ShortRedirectType.TEMPORARY]: '临时重定向 (302)',
  [ShortRedirectType.JAVASCRIPT]: 'JavaScript 跳转',
}

const redirectTypeStyleMap: Record<ShortRedirectType, string> = {
  [ShortRedirectType.PERMANENTLY]: 'border-emerald-300/80 bg-emerald-50 text-emerald-700',
  [ShortRedirectType.TEMPORARY]: 'border-amber-300/80 bg-amber-50 text-amber-700',
  [ShortRedirectType.JAVASCRIPT]: 'border-slate-300/80 bg-slate-50 text-slate-700',
}

const shortFormSchema = z.object({
  url: z.string().url('请提供合法的 URL，必须包含协议（如 https://）'),
  key: z
    .string()
    .regex(/[a-zA-Z0-9]{2,10}/, '短链接码只能由 2~10 位大小写字母和数字组成')
    .or(z.literal('')),
  tag: z.string().max(48, '标签最多 48 个字符').or(z.literal('')),
  redirectType: z.enum(ShortRedirectType),
  expiredAt: z.string().or(z.literal('')),
  public: z.boolean(),
  reuse: z.boolean(),
})

type ShortFormValue = z.infer<typeof shortFormSchema>

export default function ShortPage() {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeCreateTab, setActiveCreateTab] = useState<'form' | 'api'>('form')
  const [lastResult, setLastResult] = useState<string | null>(null)
  const queryInput = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      keyword: keyword.trim() || undefined,
    }),
    [keyword, page]
  )
  const listQueryOptions = trpc.short.items.list.queryOptions(queryInput)

  const { data, isPending, isFetching } = useQuery({
    ...listQueryOptions,
    placeholderData: previous => previous,
  })

  const createMutation = useMutation({
    mutationFn: async (value: ShortFormValue) => {
      const payload = {
        url: value.url,
        key: value.key || undefined,
        tag: value.tag || null,
        redirectType: value.redirectType,
        expiredAt: value.expiredAt ? new Date(value.expiredAt) : null,
        public: value.public,
        reuse: value.reuse,
      }

      return await trpcClient.short.items.add.mutate(payload)
    },
    onSuccess: async result => {
      setLastResult(result.$full)
      setDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  return (
    <section className="space-y-6 pb-10">
      <header className="space-y-2">
        <h1 className="font-title-serif text-[30px] text-[#2d394a]">短网址系统</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          在这里统一管理短网址记录，支持永久/临时/JS 跳转、有效期控制以及公开可见性。
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="block min-w-60 flex-1">
          <span className="mb-1 block text-xs tracking-wide text-slate-500 uppercase">
            搜索短网址
          </span>
          <input
            value={keyword}
            onChange={event => {
              setPage(1)
              setKeyword(event.target.value)
            }}
            placeholder="支持按 key、目标 URL、标签过滤"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-1.5">
              <IconPlus />
              新建短网址
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[min(92vw,920px)] p-0 sm:max-w-[min(92vw,920px)]">
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <DialogHeader className="mb-4">
                <DialogTitle>创建短网址</DialogTitle>
                <DialogDescription>
                  你可以通过表单创建，也可以查看 API 说明后在自己的系统中调用接口创建。
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={activeCreateTab}
                onValueChange={value => setActiveCreateTab(value as any)}
              >
                <TabsList>
                  <TabsTrigger value="form">表单创建</TabsTrigger>
                  <TabsTrigger value="api">API 说明</TabsTrigger>
                </TabsList>
                <TabsContent value="form" className="pt-4">
                  <CreateShortForm
                    pending={createMutation.isPending}
                    submitError={createMutation.error?.message ?? null}
                    onSubmit={async value => {
                      await createMutation.mutateAsync(value)
                    }}
                  />
                </TabsContent>
                <TabsContent value="api" className="pt-4">
                  <ShortApiDoc />
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lastResult ? (
        <Card size="sm" className="border-emerald-200/80 bg-emerald-50/70">
          <CardContent className="flex flex-wrap items-center gap-2 py-1 text-xs text-emerald-700">
            <span>创建成功：</span>
            <a
              href={lastResult}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-3"
            >
              {lastResult}
            </a>
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden border-slate-200/80">
        <CardHeader className="border-b border-slate-200/80 pb-3">
          <CardTitle>短网址列表</CardTitle>
          <CardDescription>
            {isPending ? '正在加载列表...' : `共 ${data?.total ?? 0} 条记录`}
            {isFetching && !isPending ? '，刷新中' : ''}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <ShortTable data={data?.list ?? []} loading={isPending} />
        </CardContent>

        <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3">
          <p className="text-xs text-slate-500">
            第 {data?.page ?? page} / {Math.max(data?.totalPage ?? 1, 1)} 页
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(data?.page ?? page) <= 1}
              onClick={() => setPage(current => Math.max(current - 1, 1))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(data?.page ?? page) >= (data?.totalPage ?? 1)}
              onClick={() => setPage(current => Math.min(current + 1, data?.totalPage ?? current))}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}

function CreateShortForm({
  pending,
  submitError,
  onSubmit,
}: {
  pending: boolean
  submitError: string | null
  onSubmit: (value: ShortFormValue) => Promise<void>
}) {
  const defaultValues: ShortFormValue = {
    url: '',
    key: '',
    tag: '',
    redirectType: ShortRedirectType.PERMANENTLY,
    expiredAt: '',
    public: false,
    reuse: true,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: shortFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={event => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="url">
          {field => (
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs text-slate-600">目标 URL</span>
              <input
                type="url"
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://example.com/docs"
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              {field.state.meta.errors[0] ? (
                <span className="block text-xs text-rose-600">
                  {String(field.state.meta.errors[0])}
                </span>
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field name="key">
          {field => (
            <label className="space-y-1.5">
              <span className="text-xs text-slate-600">短链接码（可选）</span>
              <input
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="如: docs1"
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              {field.state.meta.errors[0] ? (
                <span className="block text-xs text-rose-600">
                  {String(field.state.meta.errors[0])}
                </span>
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field name="tag">
          {field => (
            <label className="space-y-1.5">
              <span className="text-xs text-slate-600">标签（可选）</span>
              <input
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="如: 文档、活动页"
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              {field.state.meta.errors[0] ? (
                <span className="block text-xs text-rose-600">
                  {String(field.state.meta.errors[0])}
                </span>
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field name="redirectType">
          {field => (
            <label className="space-y-1.5">
              <span className="text-xs text-slate-600">跳转类型</span>
              <select
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value as ShortRedirectType)}
                onBlur={field.handleBlur}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {Object.values(ShortRedirectType).map(type => (
                  <option key={type} value={type}>
                    {redirectTypeLabelMap[type]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </form.Field>

        <form.Field name="expiredAt">
          {field => (
            <label className="space-y-1.5">
              <span className="text-xs text-slate-600">过期时间（可选）</span>
              <input
                type="datetime-local"
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              {field.state.meta.errors[0] ? (
                <span className="block text-xs text-rose-600">
                  {String(field.state.meta.errors[0])}
                </span>
              ) : null}
            </label>
          )}
        </form.Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <form.Field name="public">
          {field => (
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={event => field.handleChange(event.target.checked)}
                onBlur={field.handleBlur}
                className="size-4 rounded border-slate-300"
              />
              公开可见
            </label>
          )}
        </form.Field>

        <form.Field name="reuse">
          {field => (
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={event => field.handleChange(event.target.checked)}
                onBlur={field.handleBlur}
                className="size-4 rounded border-slate-300"
              />
              允许复用相同配置
            </label>
          )}
        </form.Field>
      </div>

      {submitError ? (
        <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {submitError}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? '创建中...' : '创建短网址'}
        </Button>
      </div>
    </form>
  )
}

function ShortTable({
  data,
  loading,
}: {
  data: Array<{
    id: string
    key: string
    url: string
    tag: string | null
    redirectType: ShortRedirectType
    expiredAt: Date | null
    public: boolean
    createdAt: Date
  }>
  loading: boolean
}) {
  if (loading) {
    return <p className="px-4 py-6 text-sm text-slate-500">正在加载...</p>
  }

  if (data.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-500">暂无短网址记录</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-245 border-collapse text-left text-xs">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2.5 font-medium">短网址</th>
            <th className="px-4 py-2.5 font-medium">目标地址</th>
            <th className="px-4 py-2.5 font-medium">标签</th>
            <th className="px-4 py-2.5 font-medium">跳转类型</th>
            <th className="px-4 py-2.5 font-medium">有效期</th>
            <th className="px-4 py-2.5 font-medium">公开</th>
            <th className="px-4 py-2.5 font-medium">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} className="border-t border-slate-200/70 align-top text-slate-700">
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 font-medium">
                  <IconLink size={14} />/{item.key}
                </span>
              </td>
              <td className="px-4 py-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-90 items-center gap-1 truncate text-sky-700 underline underline-offset-3"
                >
                  {item.url}
                  <IconExternalLink size={13} />
                </a>
              </td>
              <td className="px-4 py-3">{item.tag || '-'}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 ${redirectTypeStyleMap[item.redirectType]}`}
                >
                  {redirectTypeLabelMap[item.redirectType]}
                </span>
              </td>
              <td className="px-4 py-3">
                {item.expiredAt ? formatTime(item.expiredAt) : '永久有效'}
              </td>
              <td className="px-4 py-3">{item.public ? '是' : '否'}</td>
              <td className="px-4 py-3">{formatTime(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ShortApiDoc() {
  return (
    <div className="space-y-4 text-xs/relaxed text-slate-700">
      <Card size="sm" className="border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle>接口元数据</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>
            <strong>接口：</strong>
            <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5">POST /api/openapi/short</code>
          </p>
          <p>
            <strong>鉴权：</strong>需要登录态（Cookie Session）
          </p>
          <p>
            <strong>说明：</strong>
            与当前页面“新建短网址”使用同一后端逻辑，支持复用策略与自定义短码。
          </p>
        </CardContent>
      </Card>

      <Card size="sm" className="border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle>请求参数</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-155 border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2.5 py-2 font-medium">字段</th>
                <th className="px-2.5 py-2 font-medium">类型</th>
                <th className="px-2.5 py-2 font-medium">必填</th>
                <th className="px-2.5 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['url', 'string', '是', '目标 URL，必须是合法地址'],
                ['key', 'string', '否', '短链接码，2~10 位字母/数字'],
                ['tag', 'string|null', '否', '标签'],
                ['redirectType', 'PERMANENTLY | TEMPORARY | JAVASCRIPT', '否', '重定向方式'],
                ['expiredAt', 'Date|null', '否', '过期时间，不填则永久有效'],
                ['public', 'boolean', '否', '是否公开可见'],
                ['reuse', 'boolean', '否', '是否复用已有相同配置'],
              ].map(row => (
                <tr key={row[0]} className="border-t border-slate-200/70">
                  <td className="px-2.5 py-2">
                    <code>{row[0]}</code>
                  </td>
                  <td className="px-2.5 py-2">{row[1]}</td>
                  <td className="px-2.5 py-2">{row[2]}</td>
                  <td className="px-2.5 py-2">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card size="sm" className="border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle>返回值示例</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-slate-900/95 p-3 text-[11px] text-slate-100">
            {`{
  "id": "cm...",
  "url": "https://example.com/docs",
  "key": "docs1",
  "tag": "文档",
  "redirectType": "PERMANENTLY",
  "expiredAt": null,
  "public": false,
  "$reuse": false,
  "$full": "https://your-domain/s/docs1"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
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
