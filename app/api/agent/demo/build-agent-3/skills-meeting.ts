import { tagTemplate } from 'omn'
import { z } from 'zod'

export const agentSkillReferenceZod = z.object({
  path: z.string().trim().min(1),
  content: z.string().trim(),
})

export const agentSkillZod = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim(),
  content: z.string().trim(),
  references: z.array(agentSkillReferenceZod).optional(),
})

export const agentSkillsZod = z.array(agentSkillZod)

export type AgentSkills = z.infer<typeof agentSkillZod>
export type AgentSkillsReference = z.infer<typeof agentSkillReferenceZod>

export const emptySkill: AgentSkills = { name: '', description: '', content: '' }
export const emptySkillReference: AgentSkillsReference = { path: '', content: '' }

const meetingNotice: AgentSkills = {
  name: 'meeting-notice',
  description: '会议通知的格式规范，必须严格遵守',
  content: tagTemplate`
    会议通知必须是 Markdown 格式，以下是它的格式要求，必须严格遵守：

    \`\`\`markdown
    # 会议主题

    ## 基本信息

    **会议时间：** XXXX年 XX月 XX日 XX时 XX分
    **会议地点：** XX楼 XX室
    **主持人：** XXX
    **参会人：** XXX XXX XXX XXX ...

    ## 会议议程

    1. XXX
    2. XXX
    3. XXX

    ## 备注

    1. XXX
    2. XXX
    3. XXX
    \`\`\`
    `,
}

export const defaultSimpleSkills: AgentSkills[] = [meetingNotice]

const meetingNoticeFull: AgentSkills = {
  name: 'meeting-notice',
  description: '会议通知的格式规范，必须严格遵守',
  content: tagTemplate`
  会议通知必须是 Markdown 格式，且必须严格遵守格式规范。

  不同类型的会议，会议通知的格式规范也不同，具体如下：

  - [每日会议规范](references/daily.md)
  - [项目会议规范](references/project.md)
  - [年度会议规范](references/yearly.md)
  `,
  references: [
    {
      path: 'references/daily.md',
      content: tagTemplate`
      \`\`\`markdown
      # XXXX年 XX月 XX日 · 日会通知

      ## 基本信息

      **会议地点：** XX楼 XX室
      **开会团队**： XXX 团队

      ## 今日任务分配

      1. XXX
      2. XXX
      3. XXX
      \`\`\`
      `,
    },
    {
      path: 'references/project.md',
      content: tagTemplate`
      \`\`\`markdown
      # 会议主题

      ## 基本信息

      **会议时间：** XXXX年 XX月 XX日 XX时 XX分
      **会议地点：** XX楼 XX室
      **项目组：** XXX
      **主持人：** XXX
      **参会人：** XXX XXX XXX XXX ...

      ## 会议议程

      1. XXX
      2. XXX
      3. XXX

      ## 备注

      1. XXX
      2. XXX
      3. XXX
      \`\`\`
      `,
    },
    {
      path: 'references/yearly.md',
      content: tagTemplate`
      \`\`\`markdown
      # XXXX年 XX团队 年度会议

      ## 基本信息

      **会议时间：** XXXX年 XX月 XX日 XX时 XX分
      **会议地点：** XX楼 XX室
      **主持人：** XXX
      **参会人：** XXX XXX XXX XXX ...

      ## 年度成果

      1. XXX
      2. XXX
      3. XXX

      ## 下年度目标

      1. XXX
      2. XXX
      3. XXX
      \`\`\`
      `,
    },
  ],
}

export const defaultSkills: AgentSkills[] = [meetingNoticeFull]
