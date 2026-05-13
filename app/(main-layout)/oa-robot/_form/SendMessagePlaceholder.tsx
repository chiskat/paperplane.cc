import { IconMessageCircle, IconSparkles } from '@tabler/icons-react'

export function SendMessagePlaceholder() {
  return (
    <div className="flex min-h-112 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative flex size-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <IconMessageCircle className="size-9 text-sky-600" stroke={1.8} />
          <span className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-4 ring-slate-50">
            <IconSparkles className="size-4" stroke={2} />
          </span>
        </div>

        <h2 className="mt-6 text-xl font-semibold text-slate-900">选择一个 OA 机器人</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          从左侧列表选择一项，如果左侧列表为空，可点击上方“添加”按钮
        </p>
      </div>
    </div>
  )
}
