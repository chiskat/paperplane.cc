import 'server-only'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { trimStart } from 'lodash-es'
import mimeLib from 'mime'

export const publicS3Client = new S3Client({
  region: process.env.PUBLIC_S3_REGION!,
  endpoint: process.env.PUBLIC_S3_ENDPOINT!,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
})

export interface IUploadFileOption {
  /** 自定义文件的 mime */
  mime?: string
}

export interface IUploadFileResult {
  /** 对象存储中的文件 url */
  fileUrl: string
}

/** 上传文件到开放存储桶 */
export async function publicUpload(
  key: string,
  fileBuffer: Buffer,
  options?: IUploadFileOption
): Promise<IUploadFileResult> {
  const { mime } = Object.assign({}, options)

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.PUBLIC_S3_BUCKET_NAME,
    Body: fileBuffer,
    Key: trimStart(key, '/'),
    ContentType: mime || mimeLib.getType(key) || undefined,
  })

  await publicS3Client.send(uploadCommand)

  const fileUrl = `https://${process.env.PUBLIC_S3_CNAME}/${trimStart(key, '/')}`
  const result = { fileUrl }

  return result
}

export interface IUploadFilePreSignOption extends IUploadFileOption {
  /** 过期时间秒数，默认为 `600`，也就是 10 分钟 */
  expiresIn?: number
}

export interface IUploadFilePreSignResult {
  /** 预签名 S3 上传地址，请使用 PUT 上传 */
  preSignUrl: string
  /** 上传成功后，访问文件的路径 */
  publicUrl: string
}

/** 生成预签名的上传文件 url */
export async function uploadFilePreSign(
  key: string,
  options?: IUploadFilePreSignOption
): Promise<IUploadFilePreSignResult> {
  const { expiresIn, mime } = Object.assign<IUploadFilePreSignOption, any>(
    { expiresIn: 600 },
    options
  )

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.PUBLIC_S3_BUCKET_NAME,
    Key: trimStart(key, '/'),
    ContentType: mime,
  })

  const preSignUrl = await getSignedUrl(publicS3Client, uploadCommand, { expiresIn })
  const publicUrl = `https://${process.env.PUBLIC_S3_CNAME}/${trimStart(key, '/')}`

  return { preSignUrl, publicUrl }
}
