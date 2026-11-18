import type { ToolUIPart } from 'ai'
import {
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  FileTextIcon,
  LinkIcon,
  XCircleIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

export interface ToolCallWebExtractProps {
  part: ToolUIPart
}

const statusLabels: Record<ToolUIPart['state'], string> = {
  'approval-requested': '等待批准',
  'approval-responded': '已批准',
  'input-available': '运行中',
  'input-streaming': '输出中',
  'output-available': '已完成',
  'output-denied': '已拒绝',
  'output-error': '错误',
}

function getStatusIcon(state: ToolUIPart['state']): ReactNode {
  if (state === 'approval-requested' || state === 'input-available') {
    return <ClockIcon className="size-3.5" />
  }

  if (state === 'input-streaming') {
    return <CircleIcon className="size-3.5" />
  }

  if (state === 'output-error' || state === 'output-denied') {
    return <XCircleIcon className="size-3.5" />
  }

  return <CheckCircleIcon className="size-3.5" />
}

function getStatusClassName(state: ToolUIPart['state']) {
  if (state === 'output-error') return 'text-destructive'
  if (state === 'output-denied') return 'text-orange-600'
  if (state === 'output-available') return 'text-green-600'
  if (state === 'approval-responded') return 'text-blue-600'
  if (state === 'approval-requested') return 'text-yellow-600'
  return 'text-muted-foreground'
}

export function ToolCallWebExtract({ part }: ToolCallWebExtractProps) {
  const input =
    part.input && typeof part.input === 'object' ? (part.input as Record<string, unknown>) : {}
  const output =
    part.output && typeof part.output === 'object' ? (part.output as Record<string, unknown>) : {}
  const urls = Array.isArray(input.urls)
    ? input.urls.filter((url): url is string => typeof url === 'string')
    : []
  const results = Array.isArray(output.results) ? output.results : []
  const failedResults = Array.isArray(output.failedResults) ? output.failedResults : []
  const outputError = typeof output.error === 'string' ? output.error : ''
  const extractedResults = results.flatMap(item => {
    if (!item || typeof item !== 'object') return []

    const result = item as Record<string, unknown>
    const url = typeof result.url === 'string' ? result.url : ''
    if (!url) return []

    return [
      {
        title: typeof result.title === 'string' && result.title ? result.title : url,
        url,
      },
    ]
  })

  const isPending = part.state === 'input-streaming' || part.state === 'input-available'

  return (
    <div className="not-prose bg-card text-card-foreground w-fit max-w-full overflow-hidden rounded-md border">
      <div className="flex items-center justify-between gap-4 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate text-sm font-medium">
            {urls.length > 0 ? `读取 ${urls.length} 个网页` : '提取网页内容'}
          </span>
        </div>
        <div
          className={`bg-muted flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${getStatusClassName(part.state)}`}
        >
          {getStatusIcon(part.state)}
          <span>{statusLabels[part.state]}</span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {isPending && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <FileTextIcon className="size-4" />
            正在读取网页内容...
          </div>
        )}

        {part.errorText && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {part.errorText}
          </div>
        )}

        {outputError && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {outputError}
          </div>
        )}

        {extractedResults.length > 0 && (
          <ul className="divide-border/60 -mx-4 -my-4 divide-y">
            {extractedResults.map((result, resultIndex) => (
              <li
                className="hover:bg-muted/50 flex items-start gap-3 px-3 py-2.5 transition-colors"
                key={`${result.url}-${resultIndex}`}
              >
                <LinkIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <a
                  className="hover:text-primary min-w-0 text-sm font-medium wrap-break-word hover:underline"
                  href={result.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        {failedResults.map((item, resultIndex) => {
          const result = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
          const url = typeof result.url === 'string' ? result.url : ''
          const error = typeof result.error === 'string' ? result.error : '提取失败'

          return (
            <div
              className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
              key={`${url}-${resultIndex}`}
            >
              {url ? `${url}：${error}` : error}
            </div>
          )
        })}

        {part.state === 'output-available' &&
          extractedResults.length === 0 &&
          failedResults.length === 0 &&
          !outputError && <div className="text-muted-foreground text-sm">没有提取到网页内容。</div>}
      </div>
    </div>
  )
}
