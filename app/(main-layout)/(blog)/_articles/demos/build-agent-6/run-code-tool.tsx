'use client'

import type { ToolUIPart } from 'ai'
import { CodeIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { CodeBlock } from '@/components/ai-elements/code-block'
import { getStatusBadge } from '@/components/ai-elements/tool'
import { cn } from '@/utils/style'

interface RunCodeToolProps {
  part: ToolUIPart
  className?: string
}

interface RunCodeArtifact {
  type?: string
  data?: string
}

interface RunCodeResult {
  artifacts?: RunCodeArtifact[] | null
  error?: string | { name?: string; value?: string; traceback?: string }
  executionCount?: number | null
  stderr?: string | null
  stdout?: string | null
}

function getRunCodePayload(part: ToolUIPart) {
  const input = typeof part.input === 'object' && part.input ? part.input : null
  const output =
    typeof part.output === 'object' && part.output ? (part.output as RunCodeResult) : null
  const code = input && 'code' in input && typeof input.code === 'string' ? input.code : ''
  const artifacts = Array.isArray(output?.artifacts) ? output.artifacts.filter(Boolean) : []

  return {
    artifacts,
    code,
    error: part.errorText || output?.error || null,
    executionCount: output?.executionCount ?? null,
    stderr: output?.stderr ?? null,
    stdout: output?.stdout ?? null,
  }
}

function renderArtifact(artifact: RunCodeArtifact, index: number) {
  if (!artifact.type || !artifact.data) {
    return null
  }

  if (artifact.type === 'image/png') {
    return (
      <div className="overflow-hidden rounded-sm border bg-white" key={`artifact-${index}`}>
        <img
          alt={`执行结果图片 ${index + 1}`}
          className="max-h-96 w-full rounded-lg object-contain"
          src={`data:image/png;base64,${artifact.data}`}
        />
      </div>
    )
  }

  if (artifact.type === 'image/svg+xml') {
    return (
      <div className="overflow-hidden rounded-sm border bg-white" key={`artifact-${index}`}>
        <img
          alt={`执行结果矢量图 ${index + 1}`}
          className="max-h-96 w-full rounded-lg object-contain"
          src={`data:image/svg+xml;utf8,${encodeURIComponent(artifact.data)}`}
        />
      </div>
    )
  }

  if (artifact.type === 'text/html') {
    return (
      <div className="overflow-hidden rounded-xl border" key={`artifact-${index}`}>
        <iframe
          className="h-80 w-full bg-white"
          sandbox=""
          srcDoc={artifact.data}
          title={`执行结果 HTML ${index + 1}`}
        />
      </div>
    )
  }

  if (artifact.type === 'application/json') {
    return <CodeBlock code={artifact.data} key={`artifact-${index}`} language="json" />
  }

  return (
    <div
      className="bg-muted/30 text-foreground overflow-auto rounded-sm border px-2 py-1 font-mono text-sm whitespace-pre-wrap"
      key={`artifact-${index}`}
    >
      {artifact.data}
    </div>
  )
}

function renderPlainText(content: string) {
  return (
    <div className="bg-muted/30 text-foreground overflow-auto rounded-sm border px-2 py-1 font-mono text-sm whitespace-pre-wrap">
      {content}
    </div>
  )
}

function OutputSection({
  children,
  className,
  title,
}: {
  children: ReactNode
  className?: string
  title: string
}) {
  return (
    <section className={cn('space-y-2', className)}>
      <h4 className="text-muted-foreground">{title}</h4>
      {children}
    </section>
  )
}

export function RunCodeTool({ part, className }: RunCodeToolProps) {
  const payload = getRunCodePayload(part)
  const title = payload.executionCount ? `Python 执行 #${payload.executionCount}` : 'Python 执行'

  return (
    <section className={cn('not-prose overflow-hidden rounded-md border', className)}>
      <header className="flex items-center justify-between gap-4 border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <CodeIcon className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">{title}</span>
          {getStatusBadge(part.state)}
        </div>
      </header>

      <div className="space-y-4 p-4">
        <section className="bg-muted/20 overflow-hidden rounded-md border">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">执行代码</h3>
          </div>
          <div className="p-4">
            <CodeBlock code={payload.code || '# 无代码输入'} language="python" showLineNumbers />
          </div>
        </section>

        <section className="overflow-hidden rounded-md border">
          <div className="bg-muted/20 border-b px-4 py-3">
            <h3 className="text-sm font-medium">运行产物</h3>
          </div>
          <div className="space-y-4 p-4 text-sm">
            {payload.error ? (
              <OutputSection title="执行错误">
                <div className="bg-destructive/8 border-destructive/20 text-destructive rounded-sm border px-4 py-3 text-sm whitespace-pre-wrap">
                  {typeof payload.error === 'string'
                    ? payload.error
                    : [payload.error.name, payload.error.value, payload.error.traceback]
                        .filter(Boolean)
                        .join('\n\n')}
                </div>
              </OutputSection>
            ) : null}

            {payload.artifacts.length > 0 ? (
              <OutputSection title="富媒体产物">
                <div className="space-y-3">
                  {payload.artifacts.map((artifact, index) => renderArtifact(artifact, index))}
                </div>
              </OutputSection>
            ) : null}

            {payload.stdout ? (
              <OutputSection title="标准输出">{renderPlainText(payload.stdout)}</OutputSection>
            ) : null}

            {payload.stderr ? (
              <OutputSection title="标准错误">{renderPlainText(payload.stderr)}</OutputSection>
            ) : null}

            {!payload.error &&
            payload.artifacts.length === 0 &&
            !payload.stdout &&
            !payload.stderr &&
            part.state === 'output-available' ? (
              <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-6">
                本次执行没有返回可展示的产物。
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  )
}
