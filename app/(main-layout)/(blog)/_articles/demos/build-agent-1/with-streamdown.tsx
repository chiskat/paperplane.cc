'use client'

import { useCompletion } from '@ai-sdk/react'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { Streamdown } from 'streamdown'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function WithStreamdown() {
  const { completion, complete, error, input, isLoading, setCompletion, setInput } = useCompletion({
    api: '/api/agent/demo/build-agent-1/text',
    streamProtocol: 'text',
    initialInput: '生成一段 docker-compose.yml 示例',
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

      <Streamdown
        controls={{ code: true, table: true }}
        isAnimating={isLoading}
        plugins={{ cjk, code }}
        animated
      >
        {completion}
      </Streamdown>
    </div>
  )
}
