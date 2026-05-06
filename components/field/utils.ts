'use client'

import type { Updater } from '@tanstack/react-form'

function collectErrorMessages(error: unknown): string[] {
  if (!error) return []

  if (typeof error === 'string') return [error]

  if (error instanceof Error) {
    return error.message ? [error.message] : []
  }

  if (typeof error === 'object') {
    const errorObject = error as { message?: unknown; issues?: unknown[]; errors?: unknown[] }
    const messages: string[] = []

    if (typeof errorObject.message === 'string' && errorObject.message.trim()) {
      messages.push(errorObject.message)
    }

    const maybeNestedErrors = [...(errorObject.issues ?? []), ...(errorObject.errors ?? [])]
    for (const nestedError of maybeNestedErrors) {
      messages.push(...collectErrorMessages(nestedError))
    }

    return messages
  }

  return []
}

export function formatFieldErrors(errors: unknown[]): string {
  const messages = errors.flatMap(collectErrorMessages).filter(Boolean)
  const uniqueMessages = Array.from(new Set(messages))
  return uniqueMessages.join('；')
}

export interface TanstackFieldLike<TValue> {
  state: {
    value: TValue
    meta: {
      isValid?: boolean
      errors: unknown[]
    }
  }
  handleChange: (updater: Updater<TValue>) => void
  handleBlur?: () => void
}
