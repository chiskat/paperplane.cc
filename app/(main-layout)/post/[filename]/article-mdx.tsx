import type { MDXComponents } from 'mdx/types'
import { cloneElement, isValidElement, type ComponentPropsWithoutRef } from 'react'

import { ArticleHR } from '@/components/ui/article-hr'
import { ArticlePreviewImage } from '@/components/ui/article-preview-image'
import { CodeGroup, CodeGroupItem } from '@/components/ui/code-group'
import { MdxTab, MdxTabs } from '@/components/ui/mdx-tabs'
import { cn } from '@/utils/style'

export function articleMDX(): MDXComponents {
  return {
    wrapper({ children }) {
      return <article className="font-content-serif text-[20px] leading-[1.7]">{children}</article>
    },
    CodeGroup,
    CodeGroupItem,
    MdxTabs,
    MdxTab,
    hr: ArticleHR,
    p({ children }: ComponentPropsWithoutRef<'p'>) {
      return <p className="my-3 whitespace-pre-line">{children}</p>
    },
    a(props: ComponentPropsWithoutRef<'a'>) {
      return (
        <a
          {...props}
          className="text-[#356daa] underline decoration-[#356daa]/40 underline-offset-[3px] transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60"
        />
      )
    },
    h1(props: ComponentPropsWithoutRef<'h1'>) {
      return (
        <h1
          {...props}
          className="group mt-12 mb-4 scroll-mt-32 text-center text-[36px] [&_a]:ml-4 [&_a]:inline-flex [&_a]:no-underline! [&_a]:opacity-0 [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-100"
        />
      )
    },
    h2(props: ComponentPropsWithoutRef<'h2'>) {
      return (
        <h2
          {...props}
          className="group mt-10 mb-4 scroll-mt-32 text-[32px] [&_a]:ml-4 [&_a]:inline-flex [&_a]:no-underline! [&_a]:opacity-0 [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-100"
        />
      )
    },
    h3(props: ComponentPropsWithoutRef<'h3'>) {
      return (
        <h3
          {...props}
          className="group mt-10 mb-4 scroll-mt-32 text-[26px] [&_a]:ml-4 [&_a]:inline-flex [&_a]:no-underline! [&_a]:opacity-0 [&_a]:transition-opacity [&_a]:duration-200 hover:[&_a]:opacity-100"
        />
      )
    },
    ul({ className, ...props }: ComponentPropsWithoutRef<'ul'>) {
      return (
        <ul
          {...props}
          className={cn(
            'mt-1 mb-5 list-disc pl-7 [&_li>p]:my-1 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-7 [&_ul]:my-2 [&_ul]:list-[circle] [&_ul]:pl-7 [&>li]:pl-0 [&>li]:marker:text-[1.08em] [&>li]:marker:text-[#356daa]',
            className
          )}
        />
      )
    },
    ol({ className, ...props }: ComponentPropsWithoutRef<'ol'>) {
      return (
        <ol
          {...props}
          className={cn(
            'mt-1 mb-5 list-decimal pl-7 [&_li>p]:my-1 [&_ol]:my-1 [&_ol]:list-[lower-alpha] [&_ol]:pl-7 [&_ul]:my-2 [&_ul]:list-[circle] [&_ul]:pl-7 [&>li]:marker:text-[#356daa]',
            className
          )}
        />
      )
    },
    li({ className, ...props }: ComponentPropsWithoutRef<'li'>) {
      return (
        <li
          {...props}
          className={cn('marker:font-title-serif my-1 pl-1 marker:font-semibold', className)}
        />
      )
    },
    pre({ children, className, ...props }: ComponentPropsWithoutRef<'pre'>) {
      const codeBlock = isValidElement(children)
        ? cloneElement<any>(children, {
            className: cn('code-block', (children as any).props.className),
          })
        : children

      return (
        <pre
          {...props}
          className={cn(
            'mt-2 mb-6 overflow-x-auto rounded-md bg-[#f5f2f0] px-4 py-3 text-[16px] text-[#333] shadow-xs **:data-highlighted-chars:rounded-[3px] **:data-highlighted-chars:bg-[rgba(53,109,170,0.15)] **:data-highlighted-chars:px-0.5 **:data-highlighted-chars:py-px **:data-highlighted-line:-mx-4 **:data-highlighted-line:inline-block **:data-highlighted-line:min-w-[calc(100%+2rem)] **:data-highlighted-line:bg-[rgba(53,109,170,0.1)] **:data-highlighted-line:px-4 [&_code]:not-italic! [&_em]:not-italic! [&_i]:not-italic! [&_span]:not-italic! [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:rounded-b-[3px] [&::-webkit-scrollbar]:bg-[#f5f5f5] [&::-webkit-scrollbar-thumb]:rounded-b-[3px] [&::-webkit-scrollbar-thumb]:bg-[rgba(131,128,128,0.3)] [&::-webkit-scrollbar-track]:rounded-b-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:shadow-[inset_0_0_3px_rgba(0,0,0,0.1)]',
            className
          )}
        >
          {codeBlock}
        </pre>
      )
    },
    code({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) {
      if (className?.includes('code-block')) {
        return <code>{children}</code>
      }

      return (
        <code
          {...props}
          className={cn(
            'rounded-sm bg-[#eee2da] px-1.5 py-px font-mono text-[calc(1em-2px)] [text-shadow:0_1px_#fff]',
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
            'my-6 rounded-[3px] border-l-[5px] border-[#356daa] bg-[#eee] px-4 py-2 text-[19px] text-[#4a5665] italic [&>p]:my-0 [&>p+p]:mt-2',
            className
          )}
        >
          {children}
        </blockquote>
      )
    },
    img(props) {
      return <ArticlePreviewImage {...props} />
    },
    table({ className, ...props }: ComponentPropsWithoutRef<'table'>) {
      return (
        <div className="my-6 overflow-x-auto">
          <table {...props} className={cn('w-full border-collapse text-[18px]', className)} />
        </div>
      )
    },
    thead({ className, ...props }: ComponentPropsWithoutRef<'thead'>) {
      return <thead {...props} className={cn('bg-[#f0ebe6]', className)} />
    },
    tr({ className, ...props }: ComponentPropsWithoutRef<'tr'>) {
      return (
        <tr {...props} className={cn('border-b border-[#d5ccc5] even:bg-[#faf8f6]', className)} />
      )
    },
    th({ className, ...props }: ComponentPropsWithoutRef<'th'>) {
      return (
        <th
          {...props}
          className={cn(
            'border border-[#c8bfb6] px-4 py-2 text-left font-semibold text-[#333]',
            className
          )}
        />
      )
    },
    td({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
      return (
        <td {...props} className={cn('border border-[#d5ccc5] px-4 py-2 text-[#444]', className)} />
      )
    },
  }
}
