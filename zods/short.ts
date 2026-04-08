import z from 'zod'

import { ShortRedirectType } from '@/models/enums'

export const shortURLPrefix =
  process.env.NEXT_PUBLIC_EXTERNAL_SHORT_URL_PREFIX || `${process.env.NEXT_PUBLIC_BASE_URL}/s/`

export const shortItemZod = z.object({
  id: z.string().optional(),

  url: z.httpUrl('请提供一个合法的 URL，注意它需要以 https:// 开头'),
  key: z
    .string('请输入短链接码')
    .regex(/[a-zA-Z0-9]{2,10}/, '此短链接码不合法，它只能由 2~10 位由大小写英文字母以及数字所组成')
    .optional(),
  tag: z.string().nullish(),
  redirectType: z.enum(ShortRedirectType).optional().default(ShortRedirectType.PERMANENTLY),
  expiredAt: z.coerce.date().min(new Date(), '过期时间不能早于当前时间').nullish().default(null),
  public: z.boolean().optional().default(false),
})

export const addShortItemZod = shortItemZod.extend({
  reuse: z.boolean().optional().default(false),
})

export const shortItemReturn = shortItemZod.extend({
  $reuse: z.boolean(),
  $full: z.string(),
})
