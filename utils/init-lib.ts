import dayjs from 'dayjs'

import 'dayjs/locale/zh-cn'

import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import * as z from 'zod'
import { zhCN } from 'zod/locales'

dayjs.locale('zh-cn')

dayjs.extend(customParseFormat)
dayjs.extend(dayOfYear)
dayjs.extend(duration)
dayjs.extend(relativeTime)

z.config(zhCN())
