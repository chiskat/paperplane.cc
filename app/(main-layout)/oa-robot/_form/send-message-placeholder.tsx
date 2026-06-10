import { IconRobotFace } from '@tabler/icons-react'

export function SendMessagePlaceholder() {
  return (
    <div className="flex min-h-112 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <IconRobotFace className="size-16 text-sky-600" stroke={1.5} />

        <h2 className="mt-6 text-xl font-semibold text-slate-900">未选择 OA 机器人</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          从左侧列表选择一项，如果左侧列表为空，可点击上方“添加”按钮
        </p>
      </div>
    </div>
  )
}
