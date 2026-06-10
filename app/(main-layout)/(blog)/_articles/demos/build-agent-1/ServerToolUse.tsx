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
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool'

const chatHistory: UIMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是一个支持全世界不同时区的报时机器人！', type: 'text' }],
    role: 'assistant',
  },
]

export default function ServerTool({
  multipleSteps,
  autoResend,
}: {
  multipleSteps: boolean
  autoResend: boolean
}) {
  const { error, messages, sendMessage, status, stop } = useChat<UIMessage>({
    messages: chatHistory,
    transport: new DefaultChatTransport<UIMessage>({
      api: multipleSteps
        ? '/api/agent/demo/build-agent-1/server-tool-steps'
        : '/api/agent/demo/build-agent-1/server-tool',
    }),
    sendAutomaticallyWhen: autoResend ? lastAssistantMessageIsCompleteWithToolCalls : undefined,
  })

  return (
    <div>
      <Conversation>
        <ConversationContent>
          {messages.map(message => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <MessageResponse
                          isAnimating={message.role === 'assistant' && status === 'streaming'}
                          key={`${message.id}-${index}`}
                        >
                          {part.text}
                        </MessageResponse>
                      )

                    case 'tool-getCurrentTimeByTimeZone':
                      return (
                        <Tool key={`${message.id}-${index}`}>
                          <ToolHeader
                            state={part.state}
                            title="获取指定时区的当前时间"
                            type={part.type}
                          />

                          <ToolContent>
                            <ToolInput input={part.input || ''} />
                            <ToolOutput errorText={part.errorText} output={part.output || ''} />
                          </ToolContent>
                        </Tool>
                      )

                    default:
                      return null
                  }
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInputProvider initialInput="美国现在的时间是？">
        <PromptInput
          onSubmit={message => void sendMessage({ text: message.text.trim() })}
          className="mt-5"
        >
          <PromptInputBody>
            <PromptInputTextarea
              disabled={status !== 'ready'}
              placeholder="问问 AI 当前时间..."
              rows={2}
            />
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
