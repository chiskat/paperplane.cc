import { z } from 'zod'

import { compatFormData } from './common'

export const awesomeItemZod = z.object({
  id: z.string().optional(),

  label: z.string('Awesome 名称是必须的').min(2, '名称至少需要 2 个字符'),
  homepage: z.url('主页地址格式不正确'),
  source: z.url('源代码仓库地址格式不正确').or(z.literal('')).nullish().default(''),
  registry: z.url('制品地址格式不正确').or(z.literal('')).nullish().default(''),
  desc: z.string().nullish().default(''),
  stars: z.number().min(0).max(5).nullish(),

  catelogId: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
})

export const awesomeCatelogZod = z.object({
  id: z.string().optional(),

  name: z.string('类别名称是必须的').min(2, '类别名称至少需要 2 个字符'),
  desc: z.string().nullish().default(''),

  parentId: z.string().nullish(),
})

export const awesomeTagZod = compatFormData(
  z.object({
    id: z.string().optional(),

    label: z.string('标签名称是必须的').min(2, '标签名称至少需要 2 个字符'),
    desc: z.string().nullish().default(''),
    color: z
      .string()
      .regex(/^(#[0-9A-F]{6})?$/i, '颜色格式不正确')
      .nullish()
      .default(''),
    icon: z.string().nullish(),

    iconFile: z.instanceof(File).nullish(),
  })
)
