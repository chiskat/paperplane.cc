import { Skeleton } from '@/components/ui/skeleton'

const TOC_ITEMS = [
  { width: 'w-[92%]', depth: 1 },
  { width: 'w-[84%]', depth: 2 },
  { width: 'w-[88%]', depth: 1 },
  { width: 'w-[76%]', depth: 2 },
  { width: 'w-[72%]', depth: 2 },
  { width: 'w-[82%]', depth: 1 },
]

const ARTICLE_LINES = ['w-[96%]', 'w-[90%]', 'w-[92%]', 'w-[85%]', 'w-[88%]', 'w-[80%]']

export default function PostLoading() {
  return (
    <div id="article-top" className="relative my-8 scroll-mt-40" aria-busy>
      <aside className="mb-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:w-68">
        <div className="relative overflow-hidden rounded-sm px-4 py-3 shadow-[0px_0px_3px_1px_#eee] lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col">
          <Skeleton className="mb-4 h-7 w-5/6" />

          <div className="space-y-1.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            {TOC_ITEMS.map((item, index) => (
              <div
                key={`toc-item-${index}`}
                className={item.depth === 2 ? 'ml-2 py-px pr-2 pl-2' : 'py-px pr-2 pl-2'}
              >
                <Skeleton className={`h-4 ${item.width}`} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="lg:mr-75">
        <div className="overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(74,86,101,0.06)] outline-1 -outline-offset-1 outline-[#e8edf3]">
          <div className="relative px-7.5 py-5">
            <Skeleton className="absolute top-2 right-4 h-28 w-28 rounded-full opacity-35" />

            <Skeleton className="mt-2.5 mb-7.5 h-12 w-[76%]" />

            <div className="mb-7.5 flex flex-wrap items-center gap-7 py-1.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-28" />
            </div>

            <article className="space-y-7">
              <section className="space-y-3">
                {ARTICLE_LINES.slice(0, 3).map((line, index) => (
                  <Skeleton key={`article-line-a-${index}`} className={`h-6 ${line}`} />
                ))}
              </section>

              <section className="space-y-3">
                <Skeleton className="h-10 w-2/5" />
                {ARTICLE_LINES.slice(2).map((line, index) => (
                  <Skeleton key={`article-line-b-${index}`} className={`h-6 ${line}`} />
                ))}
              </section>

              <section className="space-y-3">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-40 w-full rounded-md" />
              </section>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
