'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type ToolUIPart,
  type UIMessage,
} from 'ai'
import { useMemo } from 'react'

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { MessageResponseWebSearch } from '@/components/ai-elements/message-web-search'
import type { WebSearchCitation } from '@/components/ai-elements/message-web-search'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { ToolCallWebExtract } from './tool-call-web-extract'
import { ToolCallWebSearch } from './tool-call-web-search'

function getSearchCitations(messages: UIMessage[], currentMessageIndex: number) {
  let turnStartIndex = currentMessageIndex

  while (turnStartIndex > 0 && messages[turnStartIndex - 1]?.role !== 'user') {
    turnStartIndex -= 1
  }

  const citations: Record<string, WebSearchCitation> = {}

  for (const message of messages.slice(turnStartIndex, currentMessageIndex + 1)) {
    for (const part of message.parts) {
      if (part.type !== 'tool-web_search') continue

      const output = (part as ToolUIPart).output
      if (!output || typeof output !== 'object' || !('results' in output)) continue

      const results = output.results
      if (!Array.isArray(results)) continue

      for (const item of results) {
        if (!item || typeof item !== 'object') continue

        const result = item as Record<string, unknown>
        if (typeof result.id !== 'string' || typeof result.url !== 'string') continue

        citations[result.id] = {
          favicon: typeof result.favicon === 'string' ? result.favicon : undefined,
          id: result.id,
          title: typeof result.title === 'string' ? result.title : undefined,
          url: result.url,
        }
      }
    }
  }

  return citations
}

const getCitationNumbers = (message: UIMessage, citations: Record<string, WebSearchCitation>) => {
  const numbers: Record<string, number> = {}
  let nextNumber = 1

  for (const part of message.parts) {
    if (part.type !== 'text') continue

    for (const match of part.text.matchAll(/\[cite:([a-zA-Z0-9_-]+)\]/g)) {
      const id = match[1]
      if (citations[id] && numbers[id] === undefined) {
        numbers[id] = nextNumber
        nextNumber += 1
      }
    }
  }

  return numbers
}

const chatHistory: UIMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是 AI 智能助理，有问题尽管问我！', type: 'text' }],
    role: 'assistant',
  },
]

export function WebSearchWithReferences() {
  const { error, messages, sendMessage, status, stop } = useChat<UIMessage>({
    messages: chatHistory,
    transport: new DefaultChatTransport<UIMessage>({
      api: '/api/agent/demo/build-agent-4/web-search-with-references',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

  const citationsByMessage = useMemo(
    () =>
      messages.map((message, index) => {
        const citations = getSearchCitations(messages, index)
        return { citations, numbers: getCitationNumbers(message, citations) }
      }),
    [messages]
  )

  return (
    <div>
      <Conversation>
        <ConversationContent>
          {messages.map((message, messageIndex) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <MessageResponseWebSearch
                          citationNumbers={citationsByMessage[messageIndex].numbers}
                          citations={citationsByMessage[messageIndex].citations}
                          isAnimating={
                            message.role === 'assistant' &&
                            status === 'streaming' &&
                            messageIndex === messages.length - 1 &&
                            index === message.parts.length - 1
                          }
                          key={`${message.id}-${index}`}
                        >
                          {part.text}
                        </MessageResponseWebSearch>
                      )

                    case 'tool-web_extract':
                      return <ToolCallWebExtract key={`${message.id}-${index}`} part={part} />

                    case 'tool-web_search':
                      return <ToolCallWebSearch key={`${message.id}-${index}`} part={part} />

                    default:
                      return null
                  }
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInputProvider initialInput="提供 3 ~ 5 条近期的体育界新闻">
        <PromptInput
          onSubmit={message => void sendMessage({ text: message.text.trim() })}
          className="mt-5"
        >
          <PromptInputBody>
            <PromptInputTextarea disabled={status !== 'ready'} placeholder="问问 AI ..." rows={2} />
          </PromptInputBody>

          <PromptInputFooter>
            <span>{error?.message ?? (status === 'submitted' ? '等待响应...' : '')}</span>

            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  )
}
