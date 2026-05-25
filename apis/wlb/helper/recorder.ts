import { createId } from '@paralleldrive/cuid2'
import dayjs from 'dayjs'
import puppeteer from 'puppeteer'

import { createShortURL } from '@/apis/short/create-short-url'
import { prisma } from '@/lib/prisma'
import { publicUpload } from '@/lib/s3'
import { Prisma, WLBProfile } from '@/models/client'
import {
  fetchOilpriceByProvince,
  fetchStockByCode,
  fetchTrafficByPosition,
  fetchWeatherByCity,
  fetchWorkdayInfo,
} from './third-party'
import { calcDaysToSalaryDay } from './workday'

export async function wlbRecord(wlbProfile: WLBProfile) {
  const {
    id: profileId,
    province,
    city,
    latitude,
    longitude,
    stockCode,
    salaryDate,
    weekendOption,
    salaryDayOption,
  } = wlbProfile
  const now = dayjs()

  const workday = await fetchWorkdayInfo()
  const { nextSalaryDate, daysToSalaryDate } = await calcDaysToSalaryDay({
    salaryDate,
    weekendOption,
    salaryDayOption,
  })
  const weatherInfo = await fetchWeatherByCity({ province, city })
  const { h92, h95, h98 } = await fetchOilpriceByProvince({ province, city })
  const trafficInfo = await fetchTrafficByPosition(latitude, longitude)

  const id = createId()
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/wlb/record/${id}`

  const { $full: shortURL } = await createShortURL(
    { url, tag: 'wlb', reuse: true },
    wlbProfile.userId
  )

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  try {
    const trafficPage = await browser.newPage()
    await trafficPage.setViewport({ width: 650 + 100, height: 650 + 100, deviceScaleFactor: 2 })
    await trafficPage.goto(`http://localhost:3000/wlb/traffic/${profileId}`, {
      waitUntil: 'networkidle0',
    })
    const trafficSnapshot = Buffer.from(
      await trafficPage.screenshot({ clip: { x: 0, y: 0, width: 650, height: 650 } })
    )
    await trafficPage.close()

    const trafficId = createId()
    const { fileUrl: trafficImageURL } = await publicUpload(
      `/offwork-traffic-image/${trafficId}.png`,
      trafficSnapshot
    )

    const data: Prisma.WLBDailyRecordUncheckedCreateInput = {
      id,
      date: now.format('YYYY-MM-DD'),
      workday: workday.isWorkDay,
      url,
      shortURL,
      imageURL: '',
      todayWeather: weatherInfo.today.weather,
      todayTemperature: weatherInfo.today.temperature,
      todayWid: weatherInfo.today.wid,
      tomorrowWeather: weatherInfo.tomorrow.weather,
      tomorrowTemperature: weatherInfo.tomorrow.temperature,
      tomorrowWid: weatherInfo.tomorrow.wid,
      h92,
      h95,
      h98,
      traffic: trafficInfo,
      trafficImageURL,
      nextSalaryDate,
      daysToSalaryDate,

      profileId: profileId,
    }

    if (stockCode) {
      const stockInfo = await fetchStockByCode(stockCode)

      data.todayStock = stockInfo.today
      data.yesterdayStock = stockInfo.yesterday
      data.stockDelta = stockInfo.delta
    }

    const record = await prisma.wLBDailyRecord.create({ data: data })
    const viewPage = await browser.newPage()
    await viewPage.setViewport({ width: 1500 + 100, height: 800 + 100, deviceScaleFactor: 2 })
    await viewPage.goto(`http://localhost:3000/wlb/record/${id}`, {
      waitUntil: 'networkidle2',
    })
    const viewSnapshot = Buffer.from(
      await viewPage.screenshot({ clip: { x: 0, y: 0, width: 1500, height: 800 } })
    )
    await viewPage.close()

    const { fileUrl: imageURL } = await publicUpload(
      `/offwork-image/${record.id}.png`,
      viewSnapshot
    )
    const result = await prisma.wLBDailyRecord.update({
      where: { id: record.id },
      data: { imageURL },
    })

    return result
  } finally {
    await browser.close()
  }
}
