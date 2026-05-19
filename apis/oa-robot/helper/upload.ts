import crypto from 'crypto'
import { Client } from '@larksuiteoapi/node-sdk'
import sharp from 'sharp'

export async function feishuUpload(
  image: Buffer,
  appId: string,
  appSecret: string
): Promise<string> {
  const client = new Client({ appId, appSecret, disableTokenCache: false })
  const uploadResult = await client.im.image.create({
    data: { image_type: 'message', image },
  })

  if (!uploadResult?.image_key) {
    throw new Error('飞书图片上传失败: 未返回 image_key')
  }

  return uploadResult.image_key
}

async function defaultReduceSizeByFile(file: Buffer): Promise<Buffer> {
  let quality = 100
  let result = await sharp(file).jpeg({ quality }).toBuffer()

  while (result.length > 2 * 1024 * 1024 && quality > 10) {
    quality -= 10
    result = await sharp(file).jpeg({ quality }).toBuffer()
  }

  return result
}

export interface IHandleWXBizImageOption {
  /** 微信机器人文件不能大于 2M，默认提供了基于图片文件处理体积的流程，可在此处覆盖 */
  overrideReduceSizeByFileFn?: typeof defaultReduceSizeByFile
}

/** 微信机器人发送图片需要 base64 和 md5，且文件不能大于 2M，可用此方法处理 */
export async function wxBizUpload(
  image: Buffer,
  options?: IHandleWXBizImageOption
): Promise<{ base64: string; md5: string }> {
  const { overrideReduceSizeByFileFn: reduceSizeFn } = {
    overrideReduceSizeByFileFn: defaultReduceSizeByFile,
    ...options,
  }

  const file = await reduceSizeFn(image)

  const hash = crypto.createHash('md5')
  hash.update(file)
  const md5 = hash.digest('hex')

  const base64 = file.toString('base64')

  return { md5, base64 }
}
