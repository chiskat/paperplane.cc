import dayjs from 'dayjs'
import { get, round, split } from 'lodash-es'

import { withRedisCache } from '@/lib/with-redis-cache'

export interface AreaInfo {
  province: string
  city: string
}

export interface WLBStockInfo {
  today: number
  yesterday: number
  delta?: number
}

/** 拉取股价 API */
export async function fetchStockByCode(code: string): Promise<WLBStockInfo> {
  const response = await fetch(`https://hq.sinajs.cn/list=${code}`, {
    headers: { Referer: 'https://finance.sina.com.cn' },
  })
  const res = await response.text()
  const dataArray = split(res.match(/"([^"]+)"/)?.[1] || '', ',')

  return {
    today: round(Number(dataArray[3]), 2),
    yesterday: round(Number(dataArray[2]), 2),
    delta: round(Number(dataArray[3]) - Number(dataArray[2]), 2),
  }
}

export interface WLBOilpriceInfo {
  h92: number
  h95: number
  h98: number
  h0: number
}

/** 拉取油价 API */
export async function fetchOilpriceByProvince({ province }: AreaInfo): Promise<WLBOilpriceInfo> {
  return withRedisCache(
    async () => {
      const response = await fetch(
        `https://apis.juhe.cn/gnyj/query?key=${process.env.JUHE_OIL_PRICE_API_KEY}`
      )
      const res = await response.json()
      const result = get(res, 'result', [])
      const cityResult = result.find((t: any) => province.includes(t.city))

      return {
        h92: Number(cityResult['92h']),
        h95: Number(cityResult['95h']),
        h98: Number(cityResult['98h']),
        h0: Number(cityResult['0h']),
      }
    },
    { cacheKey: `oilprice:${province}`, ttl: 3600 }
  )
}

/** 拉取交通状况 */
export async function fetchTrafficByPosition(
  lat: string,
  lon: string,
  radius: number = 1000
): Promise<string> {
  const response = await fetch(
    `https://api.map.baidu.com/traffic/v1/around?ak=${process.env.BAIDU_MAP_KEY}&center=${lat},${lon}&radius=${radius}&coord_type_input=gcj02&coord_type_output=gcj02`
  )
  const res = await response.json()
  const trafficMsg = get(res, 'description').replace(/,/g, '，')

  return trafficMsg
}

/** 拉取天气 API */
export async function fetchWeatherByCity({ province, city }: AreaInfo): Promise<WLBWeatherInfo> {
  const cityName = ['北京市', '天津市', '上海市', '重庆市'].includes(province) ? province : city

  return withRedisCache(
    async () => {
      const response = await fetch(
        `https://apis.juhe.cn/simpleWeather/query?city=${encodeURIComponent(cityName)}&key=${process.env.JUHE_WEATHER_API_KEY}`
      )
      const res = await response.json()
      const weatherInfo = get(res, 'result')

      const todayWeather = get(weatherInfo, 'realtime')
      todayWeather.temperature = todayWeather.temperature + '℃'
      todayWeather.weather = todayWeather.info

      const tomorrowWeather = get(weatherInfo, 'future[0]')
      tomorrowWeather.temperature = tomorrowWeather.temperature.replace('/', '~')
      tomorrowWeather.wid = get(tomorrowWeather, 'wid.day')

      return { today: todayWeather, tomorrow: tomorrowWeather }
    },
    { cacheKey: `weather:${cityName}`, ttl: 3600 }
  )
}

/** 拉取某月节假日 */
export async function fetchMonthHolidayInfo(yyyym: string = dayjs().format('YYYY-M')) {
  return withRedisCache(
    () =>
      fetch(
        `https://v.juhe.cn/calendar/month?key=${process.env.JUHE_HOLIDAY_API_KEY}&year-month=${yyyym}`
      )
        .then(response => response.json())
        .then(res => get(res, 'result.data.holiday_array', [])),
    { cacheKey: `holiday:${yyyym}`, ttl: 60 * 24 * 3600 }
  )
}

/** 拉取某日工作日状态 API */
export async function fetchWorkdayInfo(yyyymmdd: string = dayjs().format('YYYY-MM-DD')): Promise<{
  isWorkDay: boolean
  isNormalWeekend: boolean
}> {
  return withRedisCache(
    async () => {
      const response = await fetch(
        `https://apis.juhe.cn/fapig/calendar/day?key=${process.env.JUHE_WORKDAY_API_KEY}&date=${yyyymmdd}`
      )
      const res = await response.json()
      const workdayApiResult = get(res, 'result')

      return {
        isWorkDay: workdayApiResult.statusDesc === '工作日',
        isNormalWeekend: workdayApiResult.statusDesc === '周末',
      }
    },
    { cacheKey: `workday:${yyyymmdd}`, ttl: 60 * 24 * 3600 }
  )
}

export interface WLBWeatherInfo {
  today: {
    /** 气温，格式如 `"24"` */
    temperature: string
    /** 湿度 */
    humidity: string
    /** 天气，格式如 `"多云转小雨"` */
    info: string
    /** 天气，格式如 `"多云转小雨"` */
    weather: string
    /** 天气标识 ID */
    wid: string
    /** 风向，格式如 `"西北风"` */
    direct: string
    /** 风力，格式如 `"4级"` */
    power: string
    /** 空气质量，格式如 `"50"` */
    aqi: string
  }
  tomorrow: {
    date: string
    /** 气温，格式如 `9/17℃` */
    temperature: string
    /** 天气，格式如 `"多云转小雨"` */
    weather: string
    /** 天气标识 ID */
    wid: string
    /** 风向，格式如 `"西北风"` */
    direct: string
  }
}
