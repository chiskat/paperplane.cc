import { MDXComponents } from 'mdx/types'
import { type ComponentPropsWithoutRef } from 'react'

import baseMDX from '@/components/mdx/base-render'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utils/style'

export default function snippetMDX(): MDXComponents {
  const base = baseMDX()

  const Pre = base.pre
  const Code = base.code

  return {
    ...base,
    wrapper({ children }) {
      return <article className="font-sans text-[16px] leading-[1.6]">{children}</article>
    },
    hr: () => (
      <Separator className="border-foreground/50 my-8 border-t border-dashed bg-transparent data-horizontal:h-0" />
    ),
    h1({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
      return (
        <h1 {...props} className="font-title-serif mt-4 mb-4 text-[24px] [&_a]:hidden!">
          {children}
        </h1>
      )
    },
    h2({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
      return (
        <h2 {...props} className="font-title-serif mt-4 mb-4 text-[20px] [&_a]:hidden!">
          {children}
        </h2>
      )
    },
    h3({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
      return (
        <h3 {...props} className="font-title-serif mt-4 mb-4 text-[18px] [&_a]:hidden!">
          {children}
        </h3>
      )
    },
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
