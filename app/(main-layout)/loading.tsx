import { Skeleton } from '@/components/ui/skeleton'

const CARD_TITLE_WIDTHS = ['w-[72%]', 'w-[64%]', 'w-[78%]', 'w-[69%]']
const CARD_LINE_WIDTHS = ['w-[96%]', 'w-[88%]', 'w-[83%]']
const SIDEBAR_LINE_WIDTHS = ['w-[86%]', 'w-[72%]', 'w-[78%]', 'w-[65%]']

export default function MainLayoutLoading() {
  return (
    <div className="my-6 space-y-6" aria-busy>
      <section className="space-y-3 rounded-lg border border-[#edf0f4] bg-white/80 p-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden space-y-3 rounded-lg border border-[#edf0f4] bg-white/80 p-4 lg:block">
          <Skeleton className="h-5 w-2/3" />
          {SIDEBAR_LINE_WIDTHS.map((width, index) => (
            <Skeleton key={`side-${index}`} className={`h-4 ${width}`} />
          ))}
        </aside>

        <section className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={`card-${index}`}
              className={`space-y-3 rounded-lg border border-[#edf0f4] bg-white/80 p-4 shadow-[0_1px_2px_rgba(74,86,101,0.05)] ${
                index === 2 ? 'hidden xl:block' : ''
              }`}
            >
              <Skeleton className={`h-6 ${CARD_TITLE_WIDTHS[index % CARD_TITLE_WIDTHS.length]}`} />

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-18 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>

              <div className="space-y-2">
                {CARD_LINE_WIDTHS.map((width, lineIndex) => (
                  <Skeleton key={`line-${index}-${lineIndex}`} className={`h-4 ${width}`} />
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
