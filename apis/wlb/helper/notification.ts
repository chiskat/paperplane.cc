import type z from 'zod'

import { sendMessage } from '@/apis/oa-robot/helper/sender'
import { sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { OARobotMessageType } from '@/lib/zods/oa-robot'
import { type subConfigEmailZod, type subConfigOARobotZod } from '@/lib/zods/wlb'
import { WLBDailyRecord, WLBSubscriptionMessage } from '@/models/client'

export async function sendByOARobot(
  wlbRecord: WLBDailyRecord,
  wlbSubscription: z.infer<typeof subConfigOARobotZod>
) {
  const oaRobotProfile = await prisma.oARobotProfile.findUniqueOrThrow({
    where: { id: wlbSubscription.config.robotId },
  })
  const { message } = wlbSubscription
  const { imageURL } = wlbRecord

  if (message === WLBSubscriptionMessage.IMAGE) {
    await sendMessage(oaRobotProfile, {
      message: OARobotMessageType.IMAGE,
      title: '下班了',
      imageURL: imageURL,
    })
    return
  }

  if (message === WLBSubscriptionMessage.TEXT) {
    await sendMessage(oaRobotProfile, {
      message: OARobotMessageType.TEXT,
      text: textMessage(wlbRecord),
    })
    return
  }

  await sendMessage(oaRobotProfile, {
    message: OARobotMessageType.MARKDOWN,
    title: '下班了',
    markdown: `${textMessage(wlbRecord)}\n![](${imageURL})`,
  })
  return
}

export async function sendByEmail(
  wlbRecord: WLBDailyRecord,
  wlbSubscription: z.infer<typeof subConfigEmailZod>
) {
  const { message, config } = wlbSubscription
  const { date, imageURL } = wlbRecord

  if (message === WLBSubscriptionMessage.IMAGE) {
    await sendMail({
      to: config.email,
      subject: `${date} Work Life Balance (by PaperPlane.cc)`,
      html: `<img alt="" src="${imageURL}" />`,
    })
    return
  }

  if (message === WLBSubscriptionMessage.TEXT) {
    await sendMail({
      to: config.email,
      subject: `${date} Work Life Balance (by PaperPlane.cc)`,
      html: textMessage(wlbRecord).replaceAll('\n', '<br />'),
    })
    return
  }

  await sendMail({
    to: config.email,
    subject: `${date} Work Life Balance (by PaperPlane.cc)`,
    html: `<img alt="" src="${imageURL}" />\n${textMessage(wlbRecord)}`.replaceAll('\n', '<br />'),
  })
  return
}

function textMessage(wlbRecord: WLBDailyRecord) {
  const {
    todayWeather,
    todayTemperature,
    tomorrowWeather,
    tomorrowTemperature,
    h92,
    h95,
    h98,
    todayStock,
    yesterdayStock,
    stockDelta,
    traffic,
    daysToSalaryDate,
    nextSalaryDate,
  } = wlbRecord

  let text = `下班时间到了，磨刀不误砍柴工，劳逸结合，不要太辛苦~\n\n`
  text += `※ 天气：${todayWeather} ${todayTemperature}；明天：${tomorrowWeather} ${tomorrowTemperature}\n`
  text += `※ 油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#\n`

  if (todayStock) {
    const signText = stockDelta ? (stockDelta > 0 ? '+' : '') : ''
    const stockText = todayStock && stockDelta ? ` (${signText}${stockDelta})` : undefined
    text += `※ 公司股价：今日 ${todayStock}，昨日 ${yesterdayStock}${stockText}`
  }

  text += `※ 附近路况： ${traffic}\n\n`

  if (daysToSalaryDate > 0) {
    text += `下次发薪日是 ${nextSalaryDate}，还有 ${daysToSalaryDate} 天，加油！\n`
  } else {
    text += `今天是发薪日，加油！\n`
  }

  return text
}
