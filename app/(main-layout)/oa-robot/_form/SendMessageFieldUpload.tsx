'use client'

import { retry } from 'omn'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel, FieldRequiredIndicator } from '@/components/ui/field'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneIcon,
  FileUploadItem,
  FileUploadItemGroup,
  FileUploadItemPreview,
  FileUploadItemPreviewImage,
  FileUploadTitle,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { toast } from '@/components/ui/toast'
import { useTRPCClient } from '@/lib/trpc-client'
import { UserContentPresetType } from '@/lib/zods/user-content'

export type SendMessageImageUploadProps = {
  value: string | undefined
  disabled: boolean
  invalid?: boolean
  errorMessage?: string
  onChange: (publicURL: string | undefined) => void
}

type UploadState = 'idle' | 'uploading' | 'checking' | 'error'

export function SendMessageImageUpload({
  value,
  disabled,
  invalid,
  errorMessage,
  onChange,
}: SendMessageImageUploadProps) {
  const trpc = useTRPCClient()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [uploadError, setUploadError] = useState<string>()
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      setSelectedFile(undefined)
      onChange(undefined)
      return
    }

    setSelectedFile(file)
    setUploadState('uploading')
    setUploadError(undefined)
    setImageLoaded(false)

    try {
      const { id, uploadURL } = await trpc.userContent.presign.mutate({
        filename: file.name,
        usage: UserContentPresetType.OA_ROBOT_MESSAGE,
      })

      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadResponse.ok) {
        throw new Error('上传失败')
      }

      setUploadState('checking')

      const result = await retry(() => trpc.userContent.check.mutate({ id }), {
        interval: 1000,
        maxRounds: 3,
        success: result => result.ready === true,
      })

      if (result.success && result.data?.ready) {
        onChange(result.data.publicURL)
        setUploadState('idle')
        toast.success({ title: '上传成功' })
        return
      }

      throw new Error('文件处理超时')
    } catch (error) {
      setUploadState('error')
      const message = error instanceof Error ? error.message : '上传失败'
      setUploadError(message)
      toast.error({ title: message })
      onChange(undefined)
    }
  }

  const isUploading = uploadState === 'uploading' || uploadState === 'checking'
  const isDisabled = disabled || isUploading

  return (
    <Field required invalid={invalid || uploadState === 'error'}>
      <FieldLabel>
        上传图片
        <FieldRequiredIndicator />
      </FieldLabel>

      <FileUpload
        maxFiles={1}
        accept="image/*"
        disabled={isDisabled}
        acceptedFiles={selectedFile ? [selectedFile] : []}
        onFileChange={details => handleFileChange(details.acceptedFiles[0])}
      >
        {value || selectedFile ? (
          selectedFile ? (
            <FileUploadItemGroup className="m-0 list-none p-0">
              <FileUploadItem
                file={selectedFile}
                className="bg-card block overflow-hidden rounded-2xl border"
              >
                <div className="bg-muted relative aspect-video">
                  {value && imageLoaded ? (
                    <img
                      src={value}
                      alt="上传的图片"
                      className="size-full object-contain"
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <>
                      {value && (
                        <img
                          src={value}
                          alt="上传的图片"
                          className="invisible absolute size-full object-contain"
                          onLoad={() => setImageLoaded(true)}
                        />
                      )}
                      <FileUploadItemPreview
                        className="size-full rounded-none bg-transparent"
                        type="image/*"
                      >
                        <FileUploadItemPreviewImage className="rounded-none object-contain" />
                      </FileUploadItemPreview>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {isUploading && (
                      <p className="text-muted-foreground text-xs">
                        {uploadState === 'uploading' ? '上传中...' : '处理中...'}
                      </p>
                    )}
                  </div>

                  <FileUploadTrigger asChild>
                    <Button type="button" size="sm" variant="outline" disabled={isDisabled}>
                      重新选择
                    </Button>
                  </FileUploadTrigger>
                </div>
              </FileUploadItem>
            </FileUploadItemGroup>
          ) : (
            <div className="bg-card block overflow-hidden rounded-2xl border">
              <div className="bg-muted relative aspect-video">
                <img
                  src={value}
                  alt="上传的图片"
                  className="size-full object-contain"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">已上传的图片</p>
                </div>

                <FileUploadTrigger asChild>
                  <Button type="button" size="sm" variant="outline" disabled={isDisabled}>
                    重新选择
                  </Button>
                </FileUploadTrigger>
              </div>
            </div>
          )
        ) : (
          <FileUploadDropzone>
            <FileUploadDropzoneIcon />
            <FileUploadTitle>点击或拖拽上传图片</FileUploadTitle>
          </FileUploadDropzone>
        )}
      </FileUpload>

      {invalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
      {uploadError && <FieldError>{uploadError}</FieldError>}
    </Field>
  )
}
