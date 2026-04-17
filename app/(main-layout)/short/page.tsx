'use client'

import { IconPlus } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Highlight } from '@/components/text/Highlight'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { addShortItemZod, type ShortItemReturn } from '@/zods/short'
import { APIDoc } from './APIDoc'
import { Form, type FormValue } from './Form'
import { List } from './List'

const linkColorClassName =
  'text-[#2f629d] decoration-[#2f629d]/40 transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60'

export default function ShortPage() {
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  通过 API 创建
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-[min(92vw,920px)] p-0 sm:max-w-[min(92vw,920px)]">
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">通过 API 创建短链接</DialogTitle>
                    <DialogDescription className="text-base">
                      在外部系统通过 API 快速创建短链接。
                    </DialogDescription>
                  </DialogHeader>
                  <APIDoc />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-1.5">
                  <IconPlus />
                  新建短链接
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-[min(92vw,920px)] p-0 sm:max-w-[min(92vw,920px)]">
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">创建短链接</DialogTitle>
                    <DialogDescription className="text-base">
                      通过表单填写信息并创建短链接。
                    </DialogDescription>
                  </DialogHeader>
                  <Form
                    pending={createMutation.isPending}
                    submitError={createMutation.error?.message ?? null}
                    onSubmit={async value => {
                      await createMutation.mutateAsync(value)
                    }}
                  />
                </div>
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
