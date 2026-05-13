import type z from 'zod'

import {
  OARobotMessageImage,
  OARobotMessageMarkdown,
  OARobotMessageText,
  OARobotMessageType,
  OARobotMessageZod,
} from '@/lib/zods/oa-robot'
import { OARobotProfile, OARobotType } from '@/models/client'
import { extractTitle, handleFeishuAt, handleFeishuMarkdown } from './format'
import { dingtalkRobotSign, feishuRobotSign } from './sign'
import { dingtalkUpload, feishuUpload, wxBizUpload } from './upload'

const wxbizRobotUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=`
const dintalkRobotUrl = `https://oapi.dingtalk.com/robot/send?access_token=`
const feishuRobotUrl = `https://open.feishu.cn/open-apis/bot/v2/hook/`

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`请求失败 [${res.status} ${res.statusText}]`)
  }

  return (await res.json()) as any
}

type OARobotMessage = z.infer<typeof OARobotMessageZod>

export async function sendMessage(auth: OARobotProfile, message: OARobotMessage) {
  const { type, accessToken, secret } = auth
  const { type: messageType } = message

  const messageBody =
    messageType === OARobotMessageType.TEXT
      ? await text(auth, message)
      : messageType === OARobotMessageType.MARKDOWN
        ? await markdown(auth, message)
        : messageType === OARobotMessageType.IMAGE
          ? await image(auth, message)
          : null

  if (messageBody === null) {
    throw new Error(`未知的消息类型`)
  }

  if (type === OARobotType.DINGTALK) {
    const { sign, timestamp } = dingtalkRobotSign(secret!)
    const res = await postJson(
      dintalkRobotUrl + accessToken + `&timestamp=${timestamp}&sign=${sign}`,
      messageBody
    )

    if (res.errcode !== 0) {
      throw new Error(`钉钉机器人调用出错 [${res.errmsg}]`)
    }

    return res
  } else if (type === OARobotType.FEISHU) {
    const { sign, timestamp } = feishuRobotSign(secret!)
    const res = await postJson(feishuRobotUrl + accessToken, {
      timestamp: String(timestamp),
      sign,
      ...messageBody,
    })

    if (res.code !== 0) {
      throw new Error(`飞书机器人调用出错 [${res.msg}]`)
    }

    return res
  } else if (type === OARobotType.WXBIZ) {
    const res = await postJson(wxbizRobotUrl + accessToken, messageBody)

    if (res.errcode !== 0) {
      throw new Error(`企微机器人调用出错 [${res.errmsg}]`)
    }

    return res
  } else {
    throw new Error('未知的机器人类型')
  }
}

async function text(auth: OARobotProfile, message: OARobotMessageText) {
  const { type: robotType } = auth
  const { text: rawText, atAll = false, atList = [] } = message

  let text = rawText

  if (robotType === OARobotType.DINGTALK) {
    return { msgtype: 'text', text: { content: text }, at: { atMobiles: atList, isAtAll: atAll } }
  } else if (robotType === OARobotType.FEISHU) {
    text = await handleFeishuAt(text, auth, message)

    return { msg_type: 'text', content: { text } }
  } else if (robotType === OARobotType.WXBIZ) {
    return {
      msgtype: 'text',
      text: { content: text, mentioned_mobile_list: atAll ? [...atList, '@all'] : atList },
    }
  } else {
    throw new Error('未知的机器人类型')
  }
}

async function markdown(auth: OARobotProfile, message: OARobotMessageMarkdown) {
  const { atAll = false, atList = [] } = message
  const { type: robotType } = auth

  let { markdown, title } = message

  title = title || extractTitle(markdown)

  if (robotType === OARobotType.DINGTALK) {
    if (atAll && !markdown.includes('@all')) {
      markdown = markdown + ' @all'
    } else if (atList.length > 0) {
      atList.forEach(mobile => {
        if (!markdown.includes(`@${mobile}`)) {
          markdown = markdown + ` @${mobile} `
        }
      })
    }

    return {
      msgtype: 'markdown',
      markdown: { text: markdown, title },
      at: { atMobiles: atList, isAtAll: atAll },
    }
  } else if (robotType === OARobotType.FEISHU) {
    markdown = await handleFeishuAt(markdown, auth, message)
    const content = handleFeishuMarkdown(message, auth)

    return { msg_type: 'post', content: { post: { zh_cn: { title, content } } } }
  } else if (robotType === OARobotType.WXBIZ) {
    return { msgtype: 'markdown', markdown: { content: markdown } }
  } else {
    throw new Error('未知的机器人类型')
  }
}

async function image(auth: OARobotProfile, message: OARobotMessageImage) {
  const { type } = auth
  const { feishuAppId, feishuAppSecret } = (auth.extraAuthentication || {}) as any
  const { title, image } = message

  if (type === OARobotType.FEISHU && (!feishuAppId || !feishuAppSecret)) {
    throw new Error('飞书机器人发送图片消息，需提供 AppId 与 AppSecret')
  }

  if (type === OARobotType.DINGTALK) {
    const imageURL = await dingtalkUpload(image)

    return { msgtype: 'markdown', markdown: { title: title || '[图片]', text: `![](${imageURL})` } }
  } else if (type === OARobotType.FEISHU) {
    const feishuImageKey = await feishuUpload(image, feishuAppId!, feishuAppSecret!)
    return { msg_type: 'image', content: { image_key: feishuImageKey } }
  } else if (type === OARobotType.WXBIZ) {
    return { msgtype: 'image', image: await wxBizUpload(image) }
  } else {
    throw new Error('未知的机器人类型')
  }
}
