import { Skeleton } from '@/components/ui/skeleton'

const SIDEBAR_WIDTHS = [
  'w-[72%]',
  'w-[64%]',
  'w-[78%]',
  'w-[70%]',
  'w-[74%]',
  'w-[68%]',
  'w-[76%]',
  'w-[62%]',
]

const KV_LABEL_WIDTHS = ['w-14', 'w-16', 'w-14', 'w-10', 'w-14']
const KV_CONTENT_WIDTHS = ['w-[58%]', 'w-[46%]', 'w-[52%]', 'w-32', 'w-[42%]']
const ARTICLE_LINES = [
  'w-[96%]',
  'w-[90%]',
  'w-[94%]',
  'w-[82%]',
  'w-[91%]',
  'w-[87%]',
  'w-[79%]',
  'w-[93%]',
]

export default function OpenLoading() {
  return (
    <section className="relative pb-16" aria-busy>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-linear-to-br from-sky-200/35 via-orange-100/30 to-transparent blur-3xl"
      />

      <div className="grid gap-6 md:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="min-w-0 md:sticky md:top-28 md:h-[calc(100dvh-11rem)]">
          <div className="flex flex-col gap-1 rounded-3xl pr-1">
            {SIDEBAR_WIDTHS.map((width, index) => (
              <div
                key={`open-sidebar-${index}`}
                className="inline-flex max-w-full self-start rounded-2xl px-1 py-1"
              >
                <Skeleton className={`h-8 ${width}`} />
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 pb-4">
          <Skeleton className="mb-5 h-10 w-56" />

          <div className="divide-y divide-[#e8e0d9] overflow-hidden rounded-xl border border-[#ddd] bg-white/85 shadow-[0_8px_25px_-20px_rgba(0,0,0,0.45)]">
            {KV_LABEL_WIDTHS.map((labelWidth, index) => (
              <div
                key={`open-kv-${index}`}
                className="grid grid-cols-[2.75rem_6.5rem_minmax(0,1fr)] items-stretch text-[16px]"
              >
                <div className="flex h-full items-start justify-center self-stretch bg-[#f7f2ee] py-2 text-[#4a5665]">
                  <Skeleton className="mt-1 h-4 w-4 rounded-sm" />
                </div>

                <div className="m-0 flex items-start gap-1 self-stretch bg-[#f7f2ee] py-2 text-left leading-6 text-[#4a5665]">
                  <Skeleton className={`h-6 ${labelWidth}`} />
                </div>

                <div className="m-0 min-w-0 px-4 py-2 leading-6 text-[#3f4a59]">
                  {index === 4 ? (
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  ) : (
                    <Skeleton className={`h-6 ${KV_CONTENT_WIDTHS[index]}`} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <Skeleton className="h-8 w-40" />

            <div className="space-y-3">
              {ARTICLE_LINES.slice(0, 4).map((line, index) => (
                <Skeleton key={`open-article-a-${index}`} className={`h-6 ${line}`} />
              ))}
            </div>

            <Skeleton className="mt-6 h-8 w-48" />

            <div className="space-y-3">
              {ARTICLE_LINES.slice(4).map((line, index) => (
                <Skeleton key={`open-article-b-${index}`} className={`h-6 ${line}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
