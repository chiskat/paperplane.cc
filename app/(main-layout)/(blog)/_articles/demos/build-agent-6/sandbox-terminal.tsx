'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  isDataUIPart,
  isStaticToolUIPart,
  lastAssistantMessageIsCompleteWithToolCalls,
  UIMessage,
} from 'ai'
import { useState } from 'react'

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
import { Terminal } from '@/components/ai-elements/terminal'
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool'

const chatHistory: UIMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是智能 AI 助手，有什么可以帮到你？', type: 'text' }],
    role: 'assistant',
  },
]

interface CommandStreamState {
  output: string
}

interface CommandToolProps {
  output: unknown
  state: string
  terminalState?: CommandStreamState
}

function CommandTool({ output, state, terminalState }: CommandToolProps) {
  const terminalOutput =
    terminalState?.output ||
    (typeof output === 'object' && output && 'stdout' in output && typeof output.stdout === 'string'
      ? output.stdout
      : '')

  const isStreaming = state !== 'output-available' && state !== 'output-error'

  return <Terminal isStreaming={isStreaming} output={terminalOutput} />
}

export function SandboxTerminal() {
  const [commandStreams, setCommandStreams] = useState<Record<string, CommandStreamState>>({})

  const { error, messages, sendMessage, status, stop } = useChat<UIMessage>({
    messages: chatHistory,
    transport: new DefaultChatTransport<UIMessage>({
      api: '/api/agent/demo/build-agent-6/sandbox-terminal',
    }),
    onData: part => {
      if (!isDataUIPart(part) || part.type !== 'data-terminal-stream') {
        return
      }

      const nextOutput =
        part.data && typeof part.data === 'object' && 'text' in part.data ? part.data.text : ''
      const toolCallId =
        part.data && typeof part.data === 'object' && 'toolCallId' in part.data
          ? part.data.toolCallId
          : undefined

      if (typeof toolCallId !== 'string' || typeof nextOutput !== 'string') {
        return
      }

      setCommandStreams(current => ({
        ...current,
        [toolCallId]: { output: `${current[toolCallId]?.output ?? ''}${nextOutput}` },
      }))
    },
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
                    if (part.type === 'tool-command') {
                      return (
                        <CommandTool
                          key={`${message.id}-${index}`}
                          output={part.output}
                          state={part.state}
                          terminalState={commandStreams[part.toolCallId]}
                        />
                      )
                    }

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

      <PromptInputProvider initialInput="尝试运行 npm view react">
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
