import { MDXComponents } from 'mdx/types'
import { type ComponentPropsWithoutRef } from 'react'

import { cn } from '@/utils/style'
import articleMDX from './article'
import { Separator } from '../ui/separator'

export default function demoMDX(): MDXComponents {
  const base = articleMDX()

  const Pre = base.pre
  const Code = base.code

  return {
    ...base,
    wrapper({ children }) {
      return <article className="font-sans text-[16px] leading-normal">{children}</article>
    },
    hr: () => (
      <Separator className="border-foreground/50 my-8 border-t border-dashed bg-transparent data-horizontal:h-0" />
    ),
    pre({ children, className, ...props }: ComponentPropsWithoutRef<'pre'>) {
      if (typeof Pre === 'function') {
        return (
          <Pre {...props} className={cn(className, 'text-[16px]')}>
            {children}
          </Pre>
        )
      }

      return (
        <pre {...props} className={cn(className, 'text-[16px]')}>
          {children}
        </pre>
      )
    },
    code({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) {
      if (typeof Code === 'function') {
        return (
          <Code {...props} className={cn(className, 'text-[16px]')}>
            {children}
          </Code>
        )
      }

      return (
        <code {...props} className={cn(className, 'text-[16px]')}>
          {children}
        </code>
      )
    },
  }
}
