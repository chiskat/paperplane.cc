'use client'

import { IconApi, IconPlus } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Highlight } from '@/components/text/Highlight'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSession } from '@/lib/auth-client'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { addShortItemZod, type ShortItemReturn } from '@/lib/zods/short'
import { APIDoc } from './APIDoc'
import { Form, type FormValue } from './Form'
import { List } from './List'

const linkColorClassName =
  'text-[#2f629d] decoration-[#2f629d]/40 transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60'

export default function ShortPage() {
  const { user } = useSession()
  const canCreateShortLink = Boolean(user)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lastResult, setLastResult] = useState<ShortItemReturn | null>(null)

  const createMutation = useMutation({
    mutationFn: async (value: FormValue) => {
      const payload = addShortItemZod.parse(value)
      return await trpcClient.short.items.add.mutate(payload)
    },
    onSuccess: async result => {
      setLastResult(result)
      setDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: trpc.short.items.list.pathKey() })
    },
  })

  return (
    <section className="space-y-6 pb-10">
      <List
        actions={
          <>
            <Dialog closeOnInteractOutside={false}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-10 gap-1.5 px-4 text-sm">
                  <IconApi />
                  通过 API 创建
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-[min(92vw,920px)] p-0 sm:max-w-[min(92vw,920px)]">
                <DialogHeader
                  title="通过 API 创建短链接"
                  description="在外部系统通过 API 快速创建短链接。"
                />
                <DialogBody>
                  <APIDoc />
                </DialogBody>
              </DialogContent>
            </Dialog>

            <Dialog
              closeOnInteractOutside={false}
              open={dialogOpen}
              onOpenChange={({ open }) => setDialogOpen(open)}
            >
              {canCreateShortLink ? (
                <DialogTrigger asChild>
                  <Button size="lg" className="h-10 gap-1.5 px-4 text-sm">
                    <IconPlus />
                    新建短链接
                  </Button>
                </DialogTrigger>
              ) : (
                <Tooltip openDelay={150}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button size="lg" className="h-10 gap-1.5 px-4 text-sm" disabled>
                        <IconPlus />
                        新建短链接
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>登录后可用</TooltipContent>
                </Tooltip>
              )}

              <DialogContent className="max-w-[min(92vw,920px)] p-0 sm:max-w-[min(92vw,920px)]">
                <DialogHeader title="创建短链接" description="通过表单填写信息并创建短链接。" />
                <DialogBody>
                  <Form
                    pending={createMutation.isPending}
                    submitError={createMutation.error?.message ?? null}
                    onSubmit={async value => {
                      await createMutation.mutateAsync(value)
                    }}
                  />
                </DialogBody>
              </DialogContent>
            </Dialog>
          </>
        }
        banner={
          lastResult ? (
            <Card size="sm" className="border-emerald-200/80 bg-emerald-50/70">
              <CardContent className="flex flex-wrap items-center gap-2 px-2 py-1 text-sm text-emerald-700 sm:text-base">
                <span className="font-medium">创建成功：</span>
                <a
                  href={lastResult.$full}
                  target="_blank"
                  rel="noreferrer"
                  className={`font-mono break-all underline underline-offset-[3px] ${linkColorClassName}`}
                >
                  <Highlight keywords={lastResult.key}>{lastResult.$full}</Highlight>
                </a>
                {lastResult.$reuse ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 sm:text-sm">
                    复用已有短链接
                  </span>
                ) : null}
              </CardContent>
            </Card>
          ) : null
        }
      />
    </section>
  )
}
