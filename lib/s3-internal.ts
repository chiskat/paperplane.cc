import 'server-only'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { trimStart } from 'lodash-es'
import mimeLib from 'mime'

import {
  IUploadFileOption,
  IUploadFilePreSignOption,
  IUploadFilePreSignResult,
  IUploadFileResult,
} from './s3-public'

export const internalS3Client = new S3Client({
  region: process.env.INTERNAL_S3_REGION!,
  endpoint: process.env.INTERNAL_S3_ENDPOINT!,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.INTERNAL_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.INTERNAL_S3_SECRET_ACCESS_KEY!,
  },
})

/** 上传文件到私有存储桶 */
export async function internalUpload(
  key: string,
  fileBuffer: Buffer,
  options?: IUploadFileOption
): Promise<IUploadFileResult> {
  const { mime } = Object.assign({}, options)

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.INTERNAL_S3_BUCKET_NAME,
    Body: fileBuffer,
    Key: trimStart(key, '/'),
    ContentType: mime || mimeLib.getType(key) || undefined,
  })

  await internalS3Client.send(uploadCommand)

  const fileUrl = `https://${process.env.INTERNAL_S3_CNAME}/${trimStart(key, '/')}`
  const result = { fileUrl }

  return result
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
    Bucket: process.env.INTERNAL_S3_BUCKET_NAME,
    Key: trimStart(key, '/'),
    ContentType: mime,
  })

  const preSignUrl = await getSignedUrl(internalS3Client, uploadCommand, { expiresIn })
  const publicUrl = `https://${process.env.INTERNAL_S3_CNAME}/${trimStart(key, '/')}`

  return { preSignUrl, publicUrl }
}
