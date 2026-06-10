'use client'

import { useCompletion } from '@ai-sdk/react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function StreamText() {
  const { completion, complete, error, input, isLoading, setCompletion, setInput } = useCompletion({
    api: '/api/agent/demo/build-agent-1/text',
    streamProtocol: 'text',
    initialInput: '单词 “zebra” 的中文意思是？',
  })

  function handleSend() {
    setCompletion('')
    setInput('')
    complete(input.trim())
  }

  return (
    <div className="not-prose space-y-3 rounded-lg text-sm text-zinc-900 dark:text-zinc-100">
      <Textarea
        disabled={isLoading}
        onChange={event => setInput(event.target.value)}
        placeholder="和 AI 说点什么..."
        rows={2}
        value={input}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="min-h-5 text-base text-zinc-500 dark:text-zinc-400" role="status">
          {error?.message ?? (isLoading ? '生成中...' : '')}
        </p>

        <Button disabled={!input.trim() || isLoading} isLoading={isLoading} onClick={handleSend}>
          发送
        </Button>
      </div>

      {completion ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 leading-7 whitespace-pre-wrap text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100"
        >
          {completion}
        </div>
      ) : null}
    </div>
  )
}
