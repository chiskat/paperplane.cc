'use client'

import { ApiDoc, ApiDocProps } from '@/components/data/api-doc'

const apiDoc: ApiDocProps = {
  metadata: {
    url: '/api/short',
    method: 'POST',
    contentType: 'application/json',
    requireAuth: true,
    authHeaderKey: 'X-API-KEY',
    authHeaderValue: '******',
  },
  request: {
    description: '短链接创建完成后无法修改，只能删除重建，请确保参数无误。',
    fields: [
      {
        name: 'url',
        type: 'string',
        required: true,
        description: '目标 URL，必须是合法地址',
      },
      {
        name: 'key',
        type: 'string',
        description:
          '如果需要自定义短链接码，则提供此参数，留空则由系统随机生成\n短链接码只能由 2~10 位大小写字母和数字组成',
      },
      {
        name: 'tag',
        type: 'string',
        description: '提供一段标签文本用于备注',
      },
      {
        name: 'redirectType',
        type: 'Enum',
        required: true,
        defaultValue: '"PERMANENTLY"',
        description:
          '重定向方式，取值：\n"PERMANENTLY": 301 永久重定向，不可指定过期时间\n"TEMPORARY": 302 临时重定向\n"JAVASCRIPT": 落地到本站一个空白页面由 JavaScript 代码进行跳转',
      },
      {
        name: 'expiredAt',
        type: 'ISODateString',
        description:
          '如果短链接有有效期，提供此参数，否则留空表示永久可用\n永久重定向 (301) 的短链接不可设置过期时间',
      },
      {
        name: 'public',
        type: 'boolean',
        defaultValue: 'false',
        description: '短链接是否在列表中公开\n已登录用户始终可以看到所有短链接',
      },
      {
        name: 'reuse',
        type: 'boolean',
        defaultValue: 'false',
        description: '如果有匹配所有参数的短链接，则直接复用',
      },
    ],
  },
  response: {
    fields: [
      { name: 'id', type: 'string', description: 'ID' },
      { name: 'url', type: 'string', description: '原始目标地址' },
      { name: 'key', type: 'string', description: '短链接码' },
      { name: 'tag', type: 'string', description: '标签文本' },
      {
        name: 'redirectType',
        type: 'Enum',
        description: '重定向方式',
      },
      { name: 'expiredAt', type: 'Date', description: '过期时间' },
      { name: 'public', type: 'boolean', description: '是否公开可见' },
      {
        name: '$reuse',
        type: 'boolean',
        description: '本次创建短链接，是否复用了现有的记录项',
      },
      { name: '$full', type: 'string', description: '完整的短链 URL' },
    ],
  },
}

export function APIDoc() {
  return <ApiDoc {...apiDoc} />
}
