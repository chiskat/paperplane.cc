import 'server-only'

import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { trimStart } from 'lodash-es'
import mimeLib from 'mime'

export interface UploadFileOption {
  /** 自定义文件的 mime */
  mime?: string
}

export interface UploadFileResult {
  /** 对象存储中的文件 url */
  fileUrl: string
}

export interface UploadFilePreSignOption extends UploadFileOption {
  /** 过期时间秒数，默认为 `600`，也就是 10 分钟 */
  expiresIn?: number
}

export interface UploadFilePreSignResult {
  /** 预签名 S3 上传地址，请使用 PUT 上传 */
  preSignUrl: string
  /** 上传成功后，访问文件的路径 */
  publicUrl: string
}

interface S3Config {
  client: S3Client
  bucketName: string
  cname: string
}

/** 公开存储桶的 S3 客户端 */
export const publicS3Client = new S3Client({
  region: process.env.PUBLIC_S3_REGION!,
  endpoint: process.env.PUBLIC_S3_ENDPOINT!,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
})

/** 私有存储桶的 S3 客户端 */
export const internalS3Client = new S3Client({
  region: process.env.INTERNAL_S3_REGION!,
  endpoint: process.env.INTERNAL_S3_ENDPOINT!,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.INTERNAL_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.INTERNAL_S3_SECRET_ACCESS_KEY!,
  },
})

/** 通用上传函数 */
async function upload(
  config: S3Config,
  key: string,
  fileBuffer: Buffer,
  options?: UploadFileOption
): Promise<UploadFileResult> {
  const { mime } = Object.assign({}, options)

  const uploadCommand = new PutObjectCommand({
    Bucket: config.bucketName,
    Body: fileBuffer,
    Key: trimStart(key, '/'),
    ContentType: mime || mimeLib.getType(key) || undefined,
  })

  await config.client.send(uploadCommand)

  const fileUrl = `https://${config.cname}/${trimStart(key, '/')}`
  return { fileUrl }
}

/** 通用预签名函数 */
async function getUploadPreSignUrl(
  config: S3Config,
  key: string,
  options?: UploadFilePreSignOption
): Promise<UploadFilePreSignResult> {
  const { expiresIn, mime } = Object.assign<UploadFilePreSignOption, any>(
    { expiresIn: 600 },
    options
  )

  const uploadCommand = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: trimStart(key, '/'),
    ContentType: mime,
  })

  const preSignUrl = await getSignedUrl(config.client, uploadCommand, { expiresIn })
  const publicUrl = `https://${config.cname}/${trimStart(key, '/')}`

  return { preSignUrl, publicUrl }
}

/** 上传文件到公开存储桶 */
export async function publicUpload(
  key: string,
  fileBuffer: Buffer,
  options?: UploadFileOption
): Promise<UploadFileResult> {
  return upload(
    {
      client: publicS3Client,
      bucketName: process.env.PUBLIC_S3_BUCKET_NAME!,
      cname: process.env.NEXT_PUBLIC_S3_CNAME!,
    },
    key,
    fileBuffer,
    options
  )
}

/** 上传文件到私有存储桶 */
export async function internalUpload(
  key: string,
  fileBuffer: Buffer,
  options?: UploadFileOption
): Promise<UploadFileResult> {
  return upload(
    {
      client: internalS3Client,
      bucketName: process.env.INTERNAL_S3_BUCKET_NAME!,
      cname: process.env.INTERNAL_S3_CNAME!,
    },
    key,
    fileBuffer,
    options
  )
}

/** 生成公开存储桶的预签名上传 URL */
export async function publicUploadPreSign(
  key: string,
  options?: UploadFilePreSignOption
): Promise<UploadFilePreSignResult> {
  return getUploadPreSignUrl(
    {
      client: publicS3Client,
      bucketName: process.env.PUBLIC_S3_BUCKET_NAME!,
      cname: process.env.NEXT_PUBLIC_S3_CNAME!,
    },
    key,
    options
  )
}

/** 生成私有存储桶的预签名上传 URL */
export async function internalUploadPreSign(
  key: string,
  options?: UploadFilePreSignOption
): Promise<UploadFilePreSignResult> {
  return getUploadPreSignUrl(
    {
      client: internalS3Client,
      bucketName: process.env.INTERNAL_S3_BUCKET_NAME!,
      cname: process.env.INTERNAL_S3_CNAME!,
    },
    key,
    options
  )
}

/** 检查公开存储桶中的文件是否存在 */
export async function publicFileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.PUBLIC_S3_BUCKET_NAME!,
      Key: trimStart(key, '/'),
    })
    await publicS3Client.send(command)

    return true
  } catch {
    return false
  }
}

/** 检查私有存储桶中的文件是否存在 */
export async function internalFileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.INTERNAL_S3_BUCKET_NAME!,
      Key: trimStart(key, '/'),
    })
    await internalS3Client.send(command)

    return true
  } catch {
    return false
  }
}
