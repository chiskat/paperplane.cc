'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from 'ai'

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import { ToolCallWebSearch } from './tool-call-web-search'

const chatHistory: UIMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是 AI 智能助理，有问题尽管问我！', type: 'text' }],
    role: 'assistant',
  },
]

export function SimpleWebSearch() {
  const { error, messages, sendMessage, status, stop } = useChat<UIMessage>({
    messages: chatHistory,
    transport: new DefaultChatTransport<UIMessage>({
      api: '/api/agent/demo/build-agent-4/simple-web-search',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

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
                        <MessageResponse
                          isAnimating={
                            message.role === 'assistant' &&
                            status === 'streaming' &&
                            messageIndex === messages.length - 1 &&
                            index === message.parts.length - 1
                          }
                          key={`${message.id}-${index}`}
                        >
                          {part.text}
                        </MessageResponse>
                      )

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

      <PromptInputProvider initialInput="最近一个月，体育界有什么新闻？">
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
