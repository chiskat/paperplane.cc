'use client'

import { IconExternalLink, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useCallback, useEffect, useRef, useState } from 'react'

import { Button, buttonVariants } from '@/components/animate-ui/components/buttons/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useTRPC } from '@/lib/trpc-client'
import { cn } from '@/utils/style'
import { AwesomeDetail, AwesomeDetailSkeleton } from '../../../awesome/AwesomeDetail'

const CLOSE_ANIMATION_MS = 160
const AWESOME_LIST_ROUTE = '/awesome'

export default function AwesomeDetailModalPage(props: PageProps<'/awesome/[id]'>) {
  const { id } = use(props.params)
  const router = useRouter()
  const trpc = useTRPC()
  const [isOpen, setIsOpen] = useState(true)
  const hasNavigatedRef = useRef(false)

  const { data: awesome, isPending } = useQuery(trpc.awesome.items.get.queryOptions({ id }))

  const navigateAfterClose = useCallback(() => {
    if (hasNavigatedRef.current) {
      return
    }

    hasNavigatedRef.current = true

    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push(AWESOME_LIST_ROUTE)
  }, [router])

  const requestClose = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (isOpen) {
      return
    }

    const timer = setTimeout(() => {
      navigateAfterClose()
    }, CLOSE_ANIMATION_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [isOpen, navigateAfterClose])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          requestClose()
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] gap-0 rounded-3xl border border-slate-200 bg-white p-0 shadow-[0_36px_90px_-35px_rgba(15,23,42,0.55)] sm:max-w-5xl"
      >
        <DialogTitle className="sr-only">Awesome 详情</DialogTitle>

        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[16px] text-slate-500">Awesome 详情</span>

            <div className="flex items-center gap-2">
              <Link
                href={`/awesome/${id}`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: 'sm', variant: 'outline' }),
                  'rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <IconExternalLink size={14} className="shrink-0" />
                <span className="whitespace-nowrap">新标签打开</span>
              </Link>

              <Button
                size="icon-sm"
                variant="outline"
                className="cursor-pointer rounded-full"
                onClick={requestClose}
                aria-label="关闭"
              >
                <IconX size={15} />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-4">
          {isPending ? <AwesomeDetailSkeleton mode="modal" /> : null}
          {awesome ? <AwesomeDetail awesome={awesome} mode="modal" /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
