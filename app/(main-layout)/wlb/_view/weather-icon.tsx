import Image, { type ImageProps, type StaticImageData } from 'next/image'

import daxueIcon from '@/assets/wlb-weather-icons/daxue.png'
import dayuIcon from '@/assets/wlb-weather-icons/dayu.png'
import duoyunIcon from '@/assets/wlb-weather-icons/duoyun.png'
import leiIcon from '@/assets/wlb-weather-icons/lei.png'
import leibaoIcon from '@/assets/wlb-weather-icons/leibao.png'
import leizhenyuIcon from '@/assets/wlb-weather-icons/leizhenyu.png'
import qingIcon from '@/assets/wlb-weather-icons/qing.png'
import taifengIcon from '@/assets/wlb-weather-icons/taifeng.png'
import unknownIcon from '@/assets/wlb-weather-icons/unknown.png'
import wumaiIcon from '@/assets/wlb-weather-icons/wumai.png'
import xiaoxueIcon from '@/assets/wlb-weather-icons/xiaoxue.png'
import xiaoyuIcon from '@/assets/wlb-weather-icons/xiaoyu.png'
import yinIcon from '@/assets/wlb-weather-icons/yin.png'
import zhenyuIcon from '@/assets/wlb-weather-icons/zhenyu.png'
import zhongxueIcon from '@/assets/wlb-weather-icons/zhongxue.png'
import zhongyuIcon from '@/assets/wlb-weather-icons/zhongyu.png'

export interface WeatherIconProps extends Omit<ImageProps, 'alt' | 'src'> {
  mid: string | number
  weatherName?: string
  alt?: string
}

const weatherIconMap: Record<string, StaticImageData> = {
  daxue: daxueIcon,
  dayu: dayuIcon,
  duoyun: duoyunIcon,
  lei: leiIcon,
  leibao: leibaoIcon,
  leizhenyu: leizhenyuIcon,
  qing: qingIcon,
  taifeng: taifengIcon,
  unknown: unknownIcon,
  wumai: wumaiIcon,
  xiaoxue: xiaoxueIcon,
  xiaoyu: xiaoyuIcon,
  yin: yinIcon,
  zhenyu: zhenyuIcon,
  zhongxue: zhongxueIcon,
  zhongyu: zhongyuIcon,
}

export default function WeatherIcon(props: WeatherIconProps) {
  const { mid, weatherName, alt = '', ...imageProps } = props
  const iconName = getWeatherIconName(mid, weatherName)
  const icon = weatherIconMap[iconName] ?? unknownIcon

  return <Image {...imageProps} src={icon} alt={alt} />
}

function getWeatherIconName(mid: string | number, weatherName?: string) {
  const numericMid = Number(mid)

  // 存在例如“阴转小雨”的情况且 wid 仍为 0~2，此时应优先展示含有“雨”的图标
  if ([0, 1, 2].includes(numericMid) && weatherName?.includes('雨')) {
    if (weatherName?.includes('小雨')) return 'xiaoyu'
    if (weatherName?.includes('中雨')) return 'zhongyu'
    if (weatherName?.includes('大雨')) return 'dayu'
    return 'xiaoyu'
  }

  if ([0, 1, 2].includes(numericMid) && weatherName?.includes('雪')) {
    if (weatherName?.includes('小雪')) return 'xiaoxue'
    if (weatherName?.includes('中雪')) return 'zhongxue'
    if (weatherName?.includes('大雪')) return 'daxue'
    return 'xiaoxue'
  }

  if (0 === numericMid) return 'qing'
  if (1 === numericMid) return 'duoyun'
  if (2 === numericMid) return 'yin'
  if (3 === numericMid) return 'zhenyu'
  if ([4, 5].includes(numericMid)) return 'leizhenyu'
  if ([6, 19].includes(numericMid)) return 'xiaoxue'
  if ([7, 21].includes(numericMid)) return 'xiaoyu'
  if ([8, 9, 22].includes(numericMid)) return 'zhongyu'
  if ([9, 10, 11, 12, 23, 24, 25].includes(numericMid)) return 'dayu'
  if ([13, 14, 26].includes(numericMid)) return 'xiaoxue'
  if ([15, 27].includes(numericMid)) return 'zhongxue'
  if ([16, 17, 28].includes(numericMid)) return 'daxue'
  if ([18, 20, 29, 30, 53].includes(numericMid)) return 'wumai'
  if (31 === numericMid) return 'taifeng'

  return 'unknown'
}
