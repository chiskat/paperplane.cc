'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithToolCalls,
  UIMessage,
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
    parts: [{ text: '你好，我是接入计算器 MCP 的机器人，可为你处理数学计算！', type: 'text' }],
    role: 'assistant',
  },
]

export function CalcAgent() {
  const { error, messages, sendMessage, status, stop } = useChat<UIMessage>({
    messages: chatHistory,
    transport: new DefaultChatTransport<UIMessage>({
      api: '/api/agent/demo/build-agent-5/agent-mcp-calc',
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

                  if (isToolUIPart(part)) {
                    return (
                      <Tool key={`${message.id}-${index}`}>
                        <ToolHeader
                          toolName={getToolName(part) as any}
                          state={part.state}
                          title="MCP 工具调用"
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

      <PromptInputProvider initialInput="计算 128 * 64，并告诉我结果">
        <PromptInput
          onSubmit={message => void sendMessage({ text: message.text.trim() })}
          className="mt-5"
        >
          <PromptInputBody>
            <PromptInputTextarea
              disabled={status !== 'ready'}
              placeholder="问问 AI 计算题目..."
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
