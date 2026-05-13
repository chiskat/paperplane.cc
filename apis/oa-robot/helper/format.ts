import { Client } from '@larksuiteoapi/node-sdk'

import { OARobotMessageMarkdown } from '@/lib/zods/oa-robot'
import { OARobotProfile, OARobotType } from '@/models/client'

export function extractTitle(markdown: string): string {
  let result = markdown.length > 6 ? markdown : markdown.substring(5) + '…'

  const match = markdown.match(/^#{1,6} (\S+)/)
  if (match?.[1]) {
    result = match[1]
  }

  return result
}

export function handleFeishuMarkdown(message: OARobotMessageMarkdown, auth: OARobotProfile) {
  let { markdown } = message
  const { type } = auth

  const tagText = (t: string) => ({ tag: 'text', text: t })
  const tagA = (t: string, href: string) => ({ tag: 'a', text: t, href })
  const tagAt = (user_id: string) => ({ tag: 'at', user_id })

  // 自动提取标题的场合，此时不需要再写一遍标题，因此截去头部
  const mdTitle = markdown.match(/^#{1,6}(.+)\r?\n/)?.[1]
  if (type === OARobotType.FEISHU && !message.title && mdTitle) {
    markdown = markdown.replace(/^.+\r?\n/, '')
  }

  let pieces: any[] = [markdown]

  pieces = pieces
    .map(t => (typeof t === 'string' ? t.split(/( ?<at user_id="[a-zA-Z0-9_-]+"><\/at> ?)/) : t))
    .flat()
  pieces = pieces.map(t => {
    if (typeof t !== 'string') {
      return t
    }

    const atMatched = t.match(/ ?<at user_id="([a-zA-Z0-9_-]+)"><\/at>/)?.[1]

    return atMatched ? tagAt(atMatched) : t
  })

  pieces = pieces
    .map(t => (typeof t === 'string' ? t.split(/( ?\[[^\]]+\]\([^)]+\) ?)/) : t))
    .flat()
  pieces = pieces.map(t => {
    if (typeof t !== 'string') {
      return t
    }

    const aMatched = t.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (!aMatched) {
      return t
    }

    return tagA(aMatched[1], aMatched[2])
  })

  const result = [pieces.map(t => (typeof t === 'string' ? tagText(t) : t))]

  return result
}

export async function handleFeishuAt(
  input: string,
  auth: OARobotProfile,
  at: { atAll?: boolean; atList?: string[] }
) {
  const { feishuAppId, feishuAppSecret } = (auth.extraAuthentication || {}) as any
  const { atList = [], atAll = false } = at

  if (atList.length > 0 && feishuAppId && feishuAppSecret) {
    const queryResult = await feishuQueryUserIdsByMobiles(atList, feishuAppId, feishuAppSecret)

    atList.forEach(mobile => {
      const userId = queryResult.moblieMap[mobile]

      if (input.includes(`@${mobile}`)) {
        input = input.replace(`@${mobile}`, `<at user_id="${userId}"></at>`)
      } else {
        input = input + ` <at user_id="${userId}"></at>`
      }
    })
  }
  if (atAll) {
    if (input.includes('@all')) {
      input = input.replace('@all', `<at user_id="all"></at>`)
    } else {
      input = input + ` <at user_id="all"></at>`
    }
  }

  return input
}

export async function feishuQueryUserIdsByMobiles(
  mobiles: string[],
  appId: string,
  appSecret: string
) {
  const client = new Client({ appId, appSecret, disableTokenCache: false })

  const clientResult = await client.contact.v3.user
    .batchGetId({
      params: { user_id_type: 'user_id' },
      data: { emails: [], mobiles, include_resigned: false },
    })
    .then(res => res.data?.user_list || [])

  const moblieMap: Record<string, string> = {}
  clientResult.forEach(t => {
    if (t.mobile && t.user_id) {
      moblieMap[t.mobile] = t.user_id
    }
  })

  return {
    userIdList: clientResult.map(t => t.user_id).filter((id): id is string => Boolean(id)),
    moblieMap,
  }
}
