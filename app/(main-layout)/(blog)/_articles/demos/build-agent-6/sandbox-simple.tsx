'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  isStaticToolUIPart,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from 'ai'

import { FileTool } from '@/app/(main-layout)/(blog)/_articles/demos/build-agent-6/file-tool'
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
    parts: [{ text: '你好，我是智能 AI 助手，有什么可以帮到你？', type: 'text' }],
    role: 'assistant',
  },
]

export function SandboxSimple() {
  const { error, messages, sendMessage, status, stop } = useChat<UIMessage>({
    messages: chatHistory,
    transport: new DefaultChatTransport<UIMessage>({
      api: '/api/agent/demo/build-agent-6/sandbox-simple',
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
                  if (part.type === 'text') {
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
                  }

                  if (isStaticToolUIPart(part)) {
                    if (
                      part.type === 'tool-read_file' ||
                      part.type === 'tool-write_file' ||
                      part.type === 'tool-edit_file'
                    ) {
                      return <FileTool key={`${message.id}-${index}`} part={part} />
                    }

                    return (
                      <Tool key={`${message.id}-${index}`}>
                        <ToolHeader
                          state={part.state}
                          title={part.type.slice(5)}
                          type={part.type}
                        />

                        <ToolContent>
                          <ToolInput input={part.input || ''} />
                          <ToolOutput errorText={part.errorText} output={part.output || ''} />
                        </ToolContent>
                      </Tool>
                    )
                  }

                  return null
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInputProvider initialInput="react 的最新版本号是？">
        <PromptInput
          onSubmit={message => void sendMessage({ text: message.text.trim() })}
          className="mt-5"
        >
          <PromptInputBody>
            <PromptInputTextarea disabled={status !== 'ready'} placeholder="问问 AI..." rows={2} />
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
