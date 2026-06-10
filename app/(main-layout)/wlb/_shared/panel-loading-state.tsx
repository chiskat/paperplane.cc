'use client'

import { IconLoader2 } from '@tabler/icons-react'

export function WLBPanelLoadingState({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <IconLoader2 className="text-muted-foreground/60 size-8 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </div>
  )
}
