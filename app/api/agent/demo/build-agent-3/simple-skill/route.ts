import 'server-only'

import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import { z } from 'zod'

import { agentSkillsZod, type AgentSkills } from '@/app/api/agent/demo/build-agent-3/skills-meeting'
import { mainModel } from '@/lib/agent/models'

interface MessageWithSkills {
  messages: UIMessage[]
  skills: AgentSkills[]
}

export async function POST(request: Request) {
  const { messages, skills } = (await request.json()) as MessageWithSkills
  const parsedSkills = agentSkillsZod.parse(skills)
  const modelMessage = await convertToModelMessages(messages)

  const read_skill = tool({
    description: '读取指定 Skill 的完整内容。当用户的需求匹配列表中的某个 Skill 时使用。',
    inputSchema: z.object({
      name: z
        .string()
        .describe('需要读取的 Skill 名称，必须与已加载 Skill 列表中的 name 完全一致。'),
    }),
    execute: async ({ name }) => {
      const skill = parsedSkills.find(skill => skill.name === name)

      if (!skill) {
        return {
          error: `未找到名为 ${name} 的 Skill。`,
          availableSkills: parsedSkills.map(skill => ({
            name: skill.name,
            description: skill.description,
          })),
        }
      }

      return skill.content
    },
  })

  let system = undefined
  if (parsedSkills.length > 0) {
    system = `你可以使用以下已加载的 Skills。先根据用户需求判断是否需要某个 Skill；需要时调用 \`read_skill\` 工具读取完整内容，并严格遵守 Skill 内容中的要求。\n\n`

    system += parsedSkills.map(skill => `- ${skill.name}: ${skill.description}`).join('\n')
  }

  const result = streamText({
    model: mainModel,
    system,
    messages: modelMessage,
    tools: { read_skill },
    stopWhen: stepCountIs(10),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
