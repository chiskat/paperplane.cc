'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useState } from 'react'

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
import {
  ToolClarifyingRequirement,
  type ClarifyingRequirementOutput,
  type ClientToolUseMessage,
} from './ToolClarifyingRequirement'

const chatHistory: ClientToolUseMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是你的 AI 助理。', type: 'text' }],
    role: 'assistant',
  },
]

const transport = new DefaultChatTransport<ClientToolUseMessage>({
  api: '/api/agent/demo/build-agent-1/client-tool',
})

export default function ClientToolUse() {
  const [customTextByToolCallId, setCustomTextByToolCallId] = useState<Record<string, string>>({})

  const { addToolOutput, error, messages, sendMessage, status, stop } =
    useChat<ClientToolUseMessage>({
      messages: chatHistory,
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      transport,
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

                    case 'tool-clarifyingRequirement':
                      return (
                        <ToolClarifyingRequirement
                          customText={customTextByToolCallId[part.toolCallId] ?? ''}
                          key={`${message.id}-${index}`}
                          onCustomTextChange={(toolCallId: string, value: string) => {
                            setCustomTextByToolCallId(prev => ({ ...prev, [toolCallId]: value }))
                          }}
                          onSubmit={(toolCallId: string, output: ClarifyingRequirementOutput) => {
                            addToolOutput({ output, tool: 'clarifyingRequirement', toolCallId })
                          }}
                          part={part}
                        />
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

      <PromptInputProvider initialInput="帮我想一个品牌名">
        <PromptInput
          onSubmit={message => void sendMessage({ text: message.text.trim() })}
          className="mt-5"
        >
          <PromptInputBody>
            <PromptInputTextarea
              disabled={status !== 'ready'}
              placeholder="提出一个可能需要确认细节的需求..."
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
