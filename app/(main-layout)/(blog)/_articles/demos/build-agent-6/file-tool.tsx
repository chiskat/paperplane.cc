'use client'

import type { ToolUIPart } from 'ai'

import { Tool, ToolContent, ToolHeader } from '@/components/ai-elements/tool'
import { cn } from '@/utils/style'

interface FileToolProps {
  part: ToolUIPart
  className?: string
}

function getFileToolText(part: ToolUIPart) {
  const input = typeof part.input === 'object' && part.input ? part.input : null
  const output = typeof part.output === 'object' && part.output ? part.output : null
  const path = input && 'path' in input && typeof input.path === 'string' ? input.path : ''
  const error =
    part.errorText ||
    (output && 'error' in output && typeof output.error === 'string' ? output.error : undefined)

  if (part.type === 'tool-read_file') {
    const content =
      output && 'content' in output && typeof output.content === 'string' ? output.content : ''
    const truncated =
      output && 'truncated' in output && typeof output.truncated === 'boolean'
        ? output.truncated
        : false

    return {
      content,
      error,
      hint: error
        ? `读取文件 ${path} 失败。`
        : truncated
          ? `已读取文件 ${path}，内容过长，当前只展示截断后的内容。`
          : `已读取文件 ${path} 的内容。`,
      path,
    }
  }

  if (part.type === 'tool-write_file') {
    const content =
      input && 'content' in input && typeof input.content === 'string' ? input.content : ''

    return {
      content,
      error,
      hint: error ? `写入文件 ${path} 失败。` : `准备写入文件 ${path} 的内容如下。`,
      path,
    }
  }

  const content =
    input && 'newText' in input && typeof input.newText === 'string' ? input.newText : ''
  const replaceAll =
    input && 'replaceAll' in input && typeof input.replaceAll === 'boolean'
      ? input.replaceAll
      : false
  const replacements =
    output && 'replacements' in output && typeof output.replacements === 'number'
      ? output.replacements
      : undefined

  return {
    content,
    error,
    hint: error
      ? `编辑文件 ${path} 失败。`
      : `准备将 ${path} ${replaceAll ? '中所有匹配内容' : '中的匹配内容'}替换为以下文本${typeof replacements === 'number' ? `，共替换 ${replacements} 处` : ''}。`,
    path,
  }
}

export function FileTool({ part, className }: FileToolProps) {
  const { content, error, hint, path } = getFileToolText(part)

  return (
    <Tool className={className}>
      <ToolHeader state={part.state} title={part.type.slice(5)} type={part.type} />

      <ToolContent className="space-y-3">
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {hint}
        </p>

        {error ? (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        ) : null}

        <div className="bg-muted/30 overflow-hidden rounded-md border">
          <div className="text-muted-foreground border-b px-3 py-2 text-xs">
            <span className="font-mono">{path || '未命名文件'}</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm whitespace-pre-wrap">
            {content || '（无内容）'}
          </pre>
        </div>
      </ToolContent>
    </Tool>
  )
}
