import { Tips } from '@/components/text/Tips'
import { OARobotType } from '@/models/enums'

export function SendMessageTipsMarkdown(type: OARobotType) {
  if (type === OARobotType.DINGTALK) {
    return (
      <Tips
        title="支持的 Markdown 格式"
        content={`基础格式：\n# 标题，**加粗**，*斜体*，> 引用，[链接](url)，- 无序列表，1. 有序列表。\n\n支持插入图片：\n![](图片URL)`}
      />
    )
  } else if (type === OARobotType.FEISHU) {
    return (
      <Tips
        type="warning"
        title="关于飞书富文本消息"
        content={`飞书原生不支持 Markdown 消息，自动转为富文本格式，提供的富文本消息仅支持超链接和“@用户”这两种语法。`}
      />
    )
  } else if (type === OARobotType.WXBIZ) {
    return (
      <>
        <Tips
          title="支持的 Markdown 格式"
          content={`基础格式：\n# 标题，**加粗**，[链接](url)，\`行内代码\`，> 引用\n\n支持颜色文字：\n<font color="info">文本</font>\n其中 color 取值 "info" 为绿色，取值 "comment" 为灰色，取值 "warning" 为橙红色。`}
        />

        <Tips
          type="warning"
          title="不支持的格式"
          content={`无法使用“@”功能；不支持任何形式的图片。`}
        />
      </>
    )
  } else {
    throw new Error('未知的 OA 机器人类型')
  }
}

export function SendMessageTipsImage(type: OARobotType) {
  if (type === OARobotType.DINGTALK) {
    return (
      <Tips
        title="关于发送图片"
        content={`钉钉机器人使用 Markdown 消息来实现发图，需提供 Markdown 标题，默认为“[图片]”；图片将从 PaperPlane.cc CDN 中转。`}
      />
    )
  } else if (type === OARobotType.FEISHU) {
    return (
      <Tips
        title="关于发送图片"
        content={`此功能需飞书平台应用开通相关权限，并正确配置 AppId 和 AppSecret。`}
      />
    )
  } else if (type === OARobotType.WXBIZ) {
    return (
      <Tips
        title="关于发送图片"
        content={`企业微信只支持 png、jpg 格式图片，图片文件不能超过 2MB，如果文件过大会自动压缩。。`}
      />
    )
  } else {
    throw new Error('未知的 OA 机器人类型')
  }
}
