import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

import { MdxAlert } from '@/components/mdx/mdx-alert'
import { MdxCodeBlock } from '@/components/mdx/mdx-code-block'
import { MdxCollapse } from '@/components/mdx/mdx-collapse'
import { MdxHr } from '@/components/mdx/mdx-hr'
import { MdxPreviewImage } from '@/components/mdx/mdx-preview-image'
import { MdxTab, MdxTabs } from '@/components/mdx/mdx-tabs'
import { CodeGroup, CodeGroupItem } from '@/components/ui/code-group'
import { cn } from '@/utils/style'
import { Highlighter } from '../ui/highlighter'

function UnorderedList({ className, ...props }: ComponentPropsWithoutRef<'ul'>) {
  return (
    <ul
      {...props}
      className={cn(
        'mdx-ul -mt-1 mb-5 list-disc pl-7 [&_li>p]:my-1 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-7 [&_ul]:my-2 [&_ul]:list-[circle] [&_ul]:pl-7 [&>li]:pl-0 [&>li]:marker:text-[1.08em] [&>li]:marker:text-[#2f629d]',
        className
      )}
    />
  )
}

function OrderedList({ className, ...props }: ComponentPropsWithoutRef<'ol'>) {
  return (
    <ol
      {...props}
      className={cn(
        'mdx-ol -mt-1 mb-5 list-decimal pl-7 [&_li>p]:my-1 [&_ol]:my-1 [&_ol]:list-[lower-alpha] [&_ol]:pl-7 [&_ul]:my-2 [&_ul]:list-[circle] [&_ul]:pl-7 [&>li]:marker:text-[#2f629d]',
        className
      )}
    />
  )
}

function isListElement(child: ReactNode) {
  return isValidElement(child) && (child.type === UnorderedList || child.type === OrderedList)
}

function stripListBoundaryWhitespace(children: ReactNode) {
  const childArray = Children.toArray(children)
  let hasChanged = false

  const nextChildren = childArray.filter((child, index) => {
    if (typeof child !== 'string' || child.trim() !== '') {
      return true
    }

    const isAroundNestedList =
      isListElement(childArray[index - 1]) || isListElement(childArray[index + 1])

    if (isAroundNestedList) {
      hasChanged = true
      return false
    }

    return true
  })

  return hasChanged ? nextChildren : children
}

function ListItem({ children, className, ...props }: ComponentPropsWithoutRef<'li'>) {
  return (
    <li
      {...props}
      className={cn(
        'mdx-li marker:font-title-serif my-1 pl-1 whitespace-pre-line marker:font-semibold [&>ol]:whitespace-normal [&>ul]:whitespace-normal',
        className
      )}
    >
      {stripListBoundaryWhitespace(children)}
    </li>
  )
}

export default function baseMDX(): MDXComponents {
  return {
    wrapper({ children, className }) {
      return (
        <article
          className={cn('mdx-article font-content-serif text-[20px] leading-[1.7]', className)}
        >
          {children}
        </article>
      )
    },
    CodeGroup,
    CodeGroupItem,
    MdxTabs,
    MdxTab,
    MdxAlert,
    MdxCollapse,
    hr: MdxHr,
    p({ children, className, ...props }: ComponentPropsWithoutRef<'p'>) {
      return (
        <p {...props} className={cn('mdx-p my-4 whitespace-pre-line', className)}>
          {children}
        </p>
      )
    },
    a({ href, target, rel, className, ...props }: ComponentPropsWithoutRef<'a'>) {
      const isHashLink = typeof href === 'string' && href.startsWith('#')
      const finalTarget = target ?? (isHashLink ? undefined : '_blank')
      const finalRel = finalTarget === '_blank' ? (rel ?? 'noopener noreferrer') : rel

      if (!href) {
        return (
          <a
            {...props}
            className={cn(
              'mdx-a text-[#2f629d] underline decoration-[#2f629d]/40 underline-offset-[3px] transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60',
              className
            )}
          />
        )
      }

      return (
        <Link
          href={href}
          target={finalTarget}
          rel={finalRel}
          {...props}
          className={cn(
            'mdx-a text-[#2f629d] underline decoration-[#2f629d]/40 underline-offset-[3px] transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60',
            className
          )}
        />
      )
    },
    h1({ children, className, ...props }: ComponentPropsWithoutRef<'h1'>) {
      return (
        <h1
          {...props}
          className={cn(
            'mdx-h1 group relative mt-16 mb-10 scroll-mt-32 text-center text-[36px] [&_a]:absolute [&_a]:ml-4 [&_a]:inline-flex [&_a]:no-underline! [&_a]:opacity-0 [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-100',
            className
          )}
        >
          {children}
        </h1>
      )
    },
    h2({ children, className, ...props }: ComponentPropsWithoutRef<'h2'>) {
      return (
        <h2
          {...props}
          className={cn(
            'mdx-h2 group relative mt-16 mb-8 scroll-mt-32 text-[32px] [&_a]:absolute [&_a]:ml-4 [&_a]:inline-flex [&_a]:no-underline! [&_a]:opacity-0 [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-100',
            className
          )}
        >
          <Highlighter action="underline" iterations={2} color="var(--primary)" padding={0}>
            {children}
          </Highlighter>
        </h2>
      )
    },
    h3({ children, className, ...props }: ComponentPropsWithoutRef<'h3'>) {
      return (
        <h3
          {...props}
          className={cn(
            'mdx-h3 group relative mt-16 mb-8 scroll-mt-32 text-[28px] [&_a]:absolute [&_a]:ml-4 [&_a]:inline-flex [&_a]:no-underline! [&_a]:opacity-0 [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-100',
            className
          )}
        >
          <Highlighter action="underline" iterations={2} color="var(--primary)" padding={0}>
            {children}
          </Highlighter>
        </h3>
      )
    },
    ul: UnorderedList,
    ol: OrderedList,
    li: ListItem,
    pre({ children, className, ...props }: ComponentPropsWithoutRef<'pre'>) {
      const codeBlock = isValidElement(children)
        ? cloneElement<any>(children, {
            className: cn('mdx-code-block-code code-block', (children as any).props.className),
          })
        : children

      return (
        <MdxCodeBlock
          {...props}
          className={cn(
            'mdx-pre **:data-highlighted-chars:rounded-[3px] **:data-highlighted-chars:bg-[rgba(47,98,157,0.13)] **:data-highlighted-chars:px-0.5 **:data-highlighted-chars:py-px **:data-highlighted-line:bg-[rgba(47,98,157,0.08)]',
            className
          )}
        >
          {codeBlock}
        </MdxCodeBlock>
      )
    },
    code({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) {
      if (className?.includes('code-block')) {
        return (
          <code {...props} className={cn('mdx-code-block-code', className)}>
            {children}
          </code>
        )
      }

      return (
        <code
          {...props}
          className={cn(
            'mdx-code rounded-sm bg-[#eee2da] px-1.5 py-px font-mono text-[calc(1em-2px)] [text-shadow:0_1px_#fff]',
            className
          )}
        >
          {children}
        </code>
      )
    },
    blockquote({ children, className, ...props }: ComponentPropsWithoutRef<'blockquote'>) {
      return (
        <blockquote
          {...props}
          className={cn(
            'mdx-blockquote my-6 rounded-[3px] border-l-[5px] border-[#2f629d] bg-[#eee] px-4 py-2 text-[#4a5665] italic [&>p]:my-0 [&>p+p]:mt-2',
            className
          )}
        >
          {children}
        </blockquote>
      )
    },
    img(props) {
      return <MdxPreviewImage className="mdx-img my-8" {...(props as any)} />
    },
    table({ className, ...props }: ComponentPropsWithoutRef<'table'>) {
      return (
        <div className="mdx-table-wrapper my-6 overflow-x-auto">
          <table
            {...props}
            className={cn('mdx-table w-full border-collapse text-[18px]', className)}
          />
        </div>
      )
    },
    thead({ className, ...props }: ComponentPropsWithoutRef<'thead'>) {
      return <thead {...props} className={cn('mdx-thead bg-[#f0ebe6]', className)} />
    },
    tr({ className, ...props }: ComponentPropsWithoutRef<'tr'>) {
      return (
        <tr
          {...props}
          className={cn('mdx-tr border-b border-[#d5ccc5] even:bg-[#faf8f6]', className)}
        />
      )
    },
    th({ className, ...props }: ComponentPropsWithoutRef<'th'>) {
      return (
        <th
          {...props}
          className={cn(
            'mdx-th border border-[#c8bfb6] px-4 py-2 text-left font-semibold text-[#333]',
            className
          )}
        />
      )
    },
    td({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
      return (
        <td
          {...props}
          className={cn('mdx-td border border-[#d5ccc5] px-4 py-2 text-[#444]', className)}
        />
      )
    },
  }
}
