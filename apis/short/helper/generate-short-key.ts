import { sample } from 'lodash-es'

const shortKeyAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateShortKey(length: number): string {
  let random = ''
  for (let i = 0; i < length; i++) {
    random += sample(shortKeyAlphabet)
  }

  return random
}

export interface ShortKeyRecord {
  key: string
  tryLength: number
  tryTimes: number
  all: string[]
}

export function generateShortKeyByRecord(
  length: number,
  lastRecord?: ShortKeyRecord
): ShortKeyRecord {
  if (!lastRecord) {
    const result = generateShortKey(length)

    return { key: result, tryLength: length, tryTimes: 0, all: [result] }
  }

  const { tryLength, tryTimes, all } = lastRecord
  const maxTryTimes = 3 * Math.pow(10, Math.max(tryLength - 4, 0))

  function generateUniqueShortKey() {
    let result: string
    do {
      result = generateShortKey(length)
    } while (!all.includes(result))

    return result
  }

  if (tryTimes <= maxTryTimes) {
    const result = generateUniqueShortKey()

    return {
      key: result,
      tryLength: length,
      tryTimes: tryTimes + 1,
      all: [...all, result],
    }
  }

  const result = generateShortKey(length + 1)

  return {
    key: generateShortKey(length + 1),
    tryLength: length + 1,
    tryTimes: 0,
    all: [result],
  }
}
