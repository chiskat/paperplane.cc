'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { use } from 'react'

import { useTRPC } from '@/lib/trpc-client'
import { AwesomeDetail, AwesomeDetailSkeleton } from '../_item/AwesomeDetail'

export default function AwesomeDetailPage(props: PageProps<'/awesome/[id]'>) {
  const { id } = use(props.params)
  const trpc = useTRPC()

  const { data: awesome, isPending } = useQuery(trpc.awesome.items.get.queryOptions({ id }))

  return (
    <div className="pb-12">
      <div className="sticky top-28 z-20 mb-3 py-2">
        <Link
          href="/awesome"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-2 pr-4 text-sm text-slate-500 shadow-[0_0_0_1px_rgba(255,255,255,0.72),0_0_26px_8px_rgba(255,255,255,0.55)] backdrop-blur transition-colors hover:text-slate-800"
        >
          <IconChevronLeft size={15} />
          <span>返回 Awesome</span>
        </Link>
      </div>

      {isPending ? <AwesomeDetailSkeleton mode="page" /> : null}

      {awesome ? <AwesomeDetail awesome={awesome} mode="page" /> : null}
    </div>
  )
}
