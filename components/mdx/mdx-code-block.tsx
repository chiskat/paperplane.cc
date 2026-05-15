'use client'

import { isValidElement, useMemo, type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/utils/style'

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return ''
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children)
  }

  return ''
}

interface MdxCodeBlockProps extends ComponentPropsWithoutRef<'pre'> {
  children: ReactNode
}

export function MdxCodeBlock({ children, className, ...props }: MdxCodeBlockProps) {
  const value = useMemo(() => extractText(children), [children])

  return (
    <figure className="group relative my-6 overflow-hidden rounded-md bg-[#f5f2f0] shadow-xs">
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton
          value={value}
          size="sm"
          className="h-7 w-7 rounded border border-[#ddd] bg-[#f8f4f1]/95 text-[#555] shadow-[0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur transition-colors hover:bg-white hover:text-[#2f629d]"
        />
      </div>

      <pre
        {...props}
        className={cn(
          'm-0 overflow-x-auto px-4 py-3 pr-14 pb-2.5 text-[calc(1em-4px)] text-[#333] shadow-none [&_code]:not-italic! [&_em]:not-italic! [&_i]:not-italic! [&_span]:not-italic! [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:rounded-b-[3px] [&::-webkit-scrollbar]:bg-[#f5f5f5] [&::-webkit-scrollbar-thumb]:rounded-b-[3px] [&::-webkit-scrollbar-thumb]:bg-[rgba(131,128,128,0.3)] [&::-webkit-scrollbar-track]:rounded-b-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:shadow-[inset_0_0_3px_rgba(0,0,0,0.1)]',
          className
        )}
      >
        {children}
      </pre>
    </figure>
  )
}
