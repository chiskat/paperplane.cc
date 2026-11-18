'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useState } from 'react'

import { defaultSkills, type AgentSkills } from '@/app/api/agent/demo/build-agent-3/skills-meeting'
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
import { AgentSkill } from './agent-skill'
import { ToolCallReadSkill } from './tool-call-read-skill'

const chatHistory: UIMessage[] = [
  {
    id: 'welcome',
    parts: [{ text: '你好，我是 AI 工作助理，工作安排等问题尽管问我！', type: 'text' }],
    role: 'assistant',
  },
]

const transport = new DefaultChatTransport({ api: '/api/agent/demo/build-agent-3/agent-skill' })

export function AgentSkillChat() {
  const [skills, setSkills] = useState<AgentSkills[]>(defaultSkills)

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

                    case 'tool-read_skill':
                      return <ToolCallReadSkill key={`${message.id}-${index}`} part={part} />

                    default:
                      return null
                  }
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInputProvider initialInput="编写一份每日会议通知示例，内容可以自行发挥">
        <PromptInput
          onSubmit={message =>
            void sendMessage({ text: message.text.trim() }, { body: { skills } })
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

      <AgentSkill value={skills} onChange={setSkills} className="mt-4" />
    </div>
  )
}
