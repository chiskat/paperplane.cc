import dayjs from 'dayjs'

import { WLBDailyRecord, WLBProfile } from '@/models/browser'
import backgroundImages from './background-image'
import WeatherIcon from './weather-icon'

export interface RecordViewProps {
  record: WLBDailyRecord
  profile: Pick<WLBProfile, 'company'>
}

export function RecordView({ record, profile }: RecordViewProps) {
  const {
    daysToSalaryDate,
    todayWeather,
    todayTemperature,
    tomorrowWeather,
    tomorrowTemperature,
    h92,
    h95,
    h98,
    date,
    shortURL,
    trafficImageURL,
    todayStock,
    stockDelta,
  } = record
  const { company } = profile

  const signText = stockDelta ? (stockDelta > 0 ? '+' : '') : ''
  const stockText =
    todayStock && stockDelta ? `${todayStock} (${signText}${stockDelta})` : undefined

  const backgroundIndex = (dayjs().dayOfYear() - 1) % backgroundImages.length
  const backgroundImage = `url("${backgroundImages[backgroundIndex].src}")`

  const displayURL = shortURL.replace('https://', '')

  return (
    <div
      className="font-title-serif relative h-200 w-375 rounded-[6px] bg-cover bg-center bg-no-repeat p-10 text-white [text-shadow:0_0.06em_0.06em_var(--ts)]"
      style={{ backgroundImage }}
    >
      <div className="text-[130px]">下班了</div>

      {daysToSalaryDate <= 0 ? (
        <div className="text-[50px]">今天是发薪日🥳</div>
      ) : (
        <div className="text-[50px]">发薪倒计时 {daysToSalaryDate} 天</div>
      )}

      <div className="mt-12">
        <div className="mr-10 inline-flex flex-col items-center text-center align-top">
          <div className="border-b-2 border-white pb-2 text-[50px]">天气</div>
          <div className="mt-5 text-[40px]">{todayWeather}</div>
          <WeatherIcon
            mid={record.todayWid}
            weatherName={todayWeather}
            alt=""
            aria-hidden
            width={100}
            height={100}
            className="mt-2 size-30 object-contain"
          />
          <div className="mt-2 text-[40px]">{todayTemperature}</div>
        </div>

        <div className="mr-10 inline-flex flex-col items-center text-center align-top">
          <div className="border-b-2 border-white pb-2 text-[50px]">明天</div>
          <div className="mt-5 text-[40px]">{tomorrowWeather}</div>
          <WeatherIcon
            mid={record.tomorrowWid}
            weatherName={tomorrowWeather}
            alt=""
            aria-hidden
            width={100}
            height={100}
            className="mt-2 size-30 object-contain"
          />
          <div className="mt-2 text-[40px]">{tomorrowTemperature}</div>
        </div>

        <div className="inline-flex flex-col align-top">
          <div className="border-b-2 border-white pb-2 text-[50px]">油价</div>

          <div className="mt-5">
            <div className="mb-2 flex">
              <div className="text-[40px]">92#</div>
              <div className="ml-5 text-[40px]">￥{h92}</div>
            </div>

            <div className="mb-2 flex">
              <div className="text-[40px]">95#</div>
              <div className="ml-5 text-[40px]">￥{h95}</div>
            </div>

            <div className="mb-2 flex">
              <div className="text-[40px]">98#</div>
              <div className="ml-5 text-[40px]">￥{h98}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 font-mono text-[28px]">
          <span>{date}</span> · <span>{displayURL}</span>
        </div>
      </div>

      <img
        className="absolute right-10 bottom-10 h-162 w-162 rounded-[20px] opacity-80"
        alt=""
        src={trafficImageURL}
      />

      <div className="absolute top-35 right-17 z-2 inline-block rounded-[10px] bg-[rgba(0,0,0,0.3)] px-5 pt-2.5 pb-1 text-right text-[50px]">
        交通拥堵状况
      </div>

      <div className="absolute top-6 right-10 text-right text-[50px]">
        {company}
        {todayStock ? <span> / 股价：{stockText}</span> : null}
      </div>
    </div>
  )
}
