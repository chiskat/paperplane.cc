'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/utils/style'

interface MdxCollapseProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  title?: ReactNode
}

export function MdxCollapse({ title, children, className, ...props }: MdxCollapseProps) {
  return (
    <div
      {...props}
      className={cn('my-6 rounded-md border border-[#d1d5db] bg-[#f3f4f6] px-4', className)}
    >
      <Accordion collapsible defaultValue={[]}>
        <AccordionItem value="mdx-collapse-item" className="border-b-0">
          <AccordionTrigger className="cursor-pointer py-3 text-[18px] font-semibold">
            {title || '展开查看'}
          </AccordionTrigger>
          <AccordionContent className="text-[20px] leading-[1.7] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
