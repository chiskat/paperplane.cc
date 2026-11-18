import { ensureSandbox } from '../sandbox-helper'

export async function ensureTerminal({
  cwd,
  onData,
  rows = 40,
  cols = 120,
}: {
  cwd?: string
  onData: (data: Uint8Array) => void | Promise<void>
  rows?: number
  cols?: number
}) {
  const sandbox = await ensureSandbox()
  const terminal = await sandbox.pty.create({ cwd, onData, rows, cols })

  return { sandbox, terminal }
}

export function parseTerminalOutputBuffer(
  buffer: string,
  keepMarkerTail: boolean
): {
  completed: boolean
  exitCode?: number
  nextBuffer: string
  visibleText: string
} {
  const commandDoneMarkerPrefix = '\u001b]133;D;'

  let nextBuffer = buffer
  let visibleText = ''

  while (nextBuffer) {
    const markerIndex = nextBuffer.indexOf(commandDoneMarkerPrefix)

    if (markerIndex < 0) {
      let prefixSuffixLength = 0

      if (keepMarkerTail) {
        const maxLength = Math.min(nextBuffer.length, commandDoneMarkerPrefix.length - 1)

        for (let length = maxLength; length > 0; length -= 1) {
          if (nextBuffer.endsWith(commandDoneMarkerPrefix.slice(0, length))) {
            prefixSuffixLength = length
            break
          }
        }
      }

      const safeLength = nextBuffer.length - prefixSuffixLength

      if (safeLength > 0) {
        visibleText += nextBuffer.slice(0, safeLength)
        nextBuffer = nextBuffer.slice(safeLength)
      }

      return { completed: false, nextBuffer, visibleText }
    }

    visibleText += nextBuffer.slice(0, markerIndex)
    nextBuffer = nextBuffer.slice(markerIndex + commandDoneMarkerPrefix.length)

    const terminatorMatch = /^(-?\d+)(\u0007|\u001b\\)/.exec(nextBuffer)
    if (!terminatorMatch) {
      nextBuffer = `${commandDoneMarkerPrefix}${nextBuffer}`
      return { completed: false, nextBuffer, visibleText }
    }

    return { completed: true, exitCode: Number(terminatorMatch[1]), nextBuffer: '', visibleText }
  }

  return { completed: false, nextBuffer, visibleText }
}
