import type { StaticImageData } from 'next/image'

import DingTalkLogo from '@/assets/oa-robot-icons/logo-dingtalk.svg'
import FeishuLogo from '@/assets/oa-robot-icons/logo-feishu.svg'
import WxBizLogo from '@/assets/oa-robot-icons/logo-wxbiz.svg'
import { OARobotType } from '@/models/enums'

export type OARobotTypeIconMeta = {
  icon: StaticImageData
  alt: string
  label: string
}

export const oaRobotTypeIconMap: Record<OARobotType, OARobotTypeIconMeta> = {
  [OARobotType.DINGTALK]: { icon: DingTalkLogo, alt: '钉钉', label: '钉钉' },
  [OARobotType.WXBIZ]: { icon: WxBizLogo, alt: '企业微信', label: '企业微信' },
  [OARobotType.FEISHU]: { icon: FeishuLogo, alt: '飞书', label: '飞书' },
}

export const oaRobotTypeOptions = [
  {
    value: OARobotType.DINGTALK,
    ...oaRobotTypeIconMap[OARobotType.DINGTALK],
  },
  {
    value: OARobotType.WXBIZ,
    ...oaRobotTypeIconMap[OARobotType.WXBIZ],
  },
  {
    value: OARobotType.FEISHU,
    ...oaRobotTypeIconMap[OARobotType.FEISHU],
  },
] as const
