import dayjs, { type Dayjs } from 'dayjs'

import { SalaryDayType, WLBWeekendOffworkType } from '@/models/enums'
import { fetchMonthHolidayInfo } from './third-party'

export interface CalcDaysToSalaryDayOptions {
  salaryDate: number
  salaryDayOption: SalaryDayType
  weekendOption: WLBWeekendOffworkType
}

export interface WLBSalaryDayInfo {
  nextSalaryDate: string
  daysToSalaryDate: number
}

type HolidayInfoMap = Record<string, { holiday: boolean }>

function isWeekendWorkday(date: Dayjs, weekendOption: WLBWeekendOffworkType) {
  const day = date.day()

  if (day === 6) {
    return (
      weekendOption === WLBWeekendOffworkType.WORKDAY_SAT ||
      weekendOption === WLBWeekendOffworkType.WORKDAY_WEEKEND
    )
  }

  if (day === 0) {
    return (
      weekendOption === WLBWeekendOffworkType.WORKDAY_SUN ||
      weekendOption === WLBWeekendOffworkType.WORKDAY_WEEKEND
    )
  }

  return false
}

function isWorkday(
  date: Dayjs,
  holidayInfoMap: HolidayInfoMap,
  weekendOption: WLBWeekendOffworkType
) {
  const holidayInfo = holidayInfoMap[date.format('YYYY-MM-DD')]

  if (holidayInfo) {
    return !holidayInfo.holiday
  }

  if (date.day() >= 1 && date.day() <= 5) {
    return true
  }

  return isWeekendWorkday(date, weekendOption)
}

function getSalaryDateInMonth(month: Dayjs, salaryDate: number) {
  const endOfMonth = month.endOf('month')

  if (salaryDate < 0) {
    const dayFromEnd = Math.min(Math.abs(salaryDate), endOfMonth.date())

    return endOfMonth.subtract(dayFromEnd - 1, 'day')
  }

  const dayOfMonth = Math.max(1, Math.min(salaryDate, endOfMonth.date()))

  return endOfMonth.date(dayOfMonth)
}

function adjustSalaryDate(
  date: Dayjs,
  salaryDayOption: SalaryDayType,
  holidayInfoMap: HolidayInfoMap,
  weekendOption: WLBWeekendOffworkType
) {
  if (salaryDayOption === SalaryDayType.ANYDAY) {
    return date
  }

  const offset = salaryDayOption === SalaryDayType.LATER_TO_WORKDAY ? 1 : -1
  let result = date

  while (!isWorkday(result, holidayInfoMap, weekendOption)) {
    result = result.add(offset, 'day')
  }

  return result
}

function getNextSalaryDate(
  now: Dayjs,
  salaryDate: number,
  salaryDayOption: SalaryDayType,
  holidayInfoMap: HolidayInfoMap,
  weekendOption: WLBWeekendOffworkType
) {
  for (let monthOffset = 0; monthOffset <= 2; monthOffset += 1) {
    const date = adjustSalaryDate(
      getSalaryDateInMonth(now.add(monthOffset, 'month'), salaryDate),
      salaryDayOption,
      holidayInfoMap,
      weekendOption
    )

    if (!date.isBefore(now, 'day')) {
      return date
    }
  }

  return adjustSalaryDate(
    getSalaryDateInMonth(now.add(3, 'month'), salaryDate),
    salaryDayOption,
    holidayInfoMap,
    weekendOption
  )
}

/** 计算到发薪日的剩余天数 */
export async function calcDaysToSalaryDay({
  salaryDate,
  salaryDayOption,
  weekendOption,
}: CalcDaysToSalaryDayOptions): Promise<WLBSalaryDayInfo> {
  const now = dayjs()
  const monthHolidays = await Promise.all(
    Array.from({ length: 4 }, (_, monthOffset) =>
      fetchMonthHolidayInfo(now.add(monthOffset, 'month').format('YYYY-M'))
    )
  )

  const holidayInfoMap: HolidayInfoMap = {}
  monthHolidays.flat().forEach(item => {
    const list = item.list || []
    list.forEach((info: any) => {
      const k = dayjs(info.date).format('YYYY-MM-DD')
      const v = { holiday: Number(info.status) === 1 }
      holidayInfoMap[k] = v
    })
  })

  const date = getNextSalaryDate(now, salaryDate, salaryDayOption, holidayInfoMap, weekendOption)

  const restDays = date.diff(now, 'day')

  return { nextSalaryDate: date.format('YYYY-MM-DD'), daysToSalaryDate: restDays }
}
