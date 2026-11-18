'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, getToolName, isToolUIPart, type UIMessage } from 'ai'
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
import { ToolCallMcp } from './tool-call-mcp'
import { McpConfig, type McpServerConfig } from '../build-agent-5/mcp-config'

const calcV1Config: McpServerConfig[] = [
  {
    name: 'mcp-calc-http-v1',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/demo/build-agent-5/mcp-calc-sdk-v1`,
    transportType: 'http',
  },
]

export function McpV1Config() {
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(calcV1Config)

  return <McpConfig value={mcpServers} onChange={setMcpServers} />
}

const chatHistory: UIMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是支持 MCP 的 AI 助理，当前已连接了一些 MCP 服务器！', type: 'text' }],
    role: 'assistant',
  },
]

const transport = new DefaultChatTransport({ api: '/api/agent/demo/build-agent-5/agent-mcp' })

interface McpAgentProps {
  config: McpServerConfig[]
}

function McpAgent({ config }: McpAgentProps) {
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(config)

  const { error, messages, sendMessage, status, stop } = useChat({
    messages: chatHistory,
    transport,
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

                  if (isToolUIPart(part) && getToolName(part).startsWith('mcp__')) {
                    return <ToolCallMcp key={`${message.id}-${index}`} part={part} />
                  }

                  return null
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInputProvider initialInput="为我生成一个 100 ~ 1000 之间的随机数">
        <PromptInput
          onSubmit={message =>
            void sendMessage({ text: message.text.trim() }, { body: { mcpServers } })
          }
          className="mt-5"
        >
          <PromptInputBody>
            <PromptInputTextarea
              disabled={status !== 'ready'}
              placeholder="和 AI 说点什么..."
              rows={2}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <span>{error?.message ?? (status === 'submitted' ? '等待响应...' : '')}</span>

            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>

      <McpConfig value={mcpServers} onChange={setMcpServers} className="mt-4" />
    </div>
  )
}

const mcpServersConfig: McpServerConfig[] = [
  {
    name: 'mcp-calc',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/demo/build-agent-5/mcp-calc-next`,
    transportType: 'http',
  },
  {
    name: 'mcp-random',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/demo/build-agent-5/mcp-random`,
    transportType: 'http',
  },
]

export function McpServersAgent() {
  return <McpAgent config={mcpServersConfig} />
}
