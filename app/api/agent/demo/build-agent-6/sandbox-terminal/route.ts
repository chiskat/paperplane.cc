import 'server-only'

import { CommandExitError } from '@e2b/code-interpreter'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  UIMessage,
  UIMessageStreamWriter,
} from 'ai'
import { pick } from 'lodash-es'
import { noNull, toEndsWith } from 'omn'
import z from 'zod'

import { mainModel } from '@/lib/agent/models'
import { ensureTerminal, parseTerminalOutputBuffer } from './terminal-helper'
import {
  ensureSandbox,
  isSandboxInited,
  resolveSandboxPath,
  shellQuote,
  truncateText,
} from '../sandbox-helper'

const init_sandbox = tool({
  description:
    '如有使用 Linux 沙箱的需求，例如读写文件、搜索文件或执行命令，使用此工具初始化沙箱。',
  inputSchema: z.object({}),
  execute: async () => {
    return { sandbox_inited: true }
  },
})

async function runCommand({ command, cwd }: { command: string; cwd?: string }) {
  const sandbox = await ensureSandbox()

  try {
    const result = await sandbox.commands.run(command, { cwd })

    return noNull({
      exitCode: result.exitCode,
      stdout: result.stdout ? truncateText(result.stdout) : null,
      stderr: result.stderr ? truncateText(result.stderr) : null,
    })
  } catch (error) {
    if (error instanceof CommandExitError) {
      return noNull({
        exitCode: error.exitCode,
        error: error.error,
        stdout: error.stdout ? truncateText(error.stdout) : null,
        stderr: error.stderr ? truncateText(error.stderr) : null,
      })
    }

    return { error: error instanceof Error ? error.message : '命令执行失败' }
  }
}

const ls = tool({
  description: '列出沙箱中的目录内容。',
  inputSchema: z.object({
    path: z
      .string()
      .trim()
      .min(1)
      .optional()
      .default('.')
      .describe('要列出的目录路径，默认当前目录。'),
    depth: z.int().min(1).max(5).optional().default(1).describe('递归列出的目录深度，默认 1。'),
  }),
  execute: async ({ path, depth }) => {
    try {
      const sandbox = await ensureSandbox()
      const entries = await sandbox.files.list(path, { depth })

      return { entries: entries.map(entry => pick(entry, ['name', 'path', 'type', 'size'])) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '目录读取失败' }
    }
  },
})

const read_file = tool({
  description: '读取沙箱中的文本文件。',
  inputSchema: z.object({
    path: z.string().trim().min(1).describe('要读取的文件路径。'),
    maxLength: z.int().min(1000).max(100000).optional().default(1000).describe('最大返回字符数。'),
  }),
  execute: async ({ path, maxLength }) => {
    try {
      const sandbox = await ensureSandbox()
      const content = await sandbox.files.read(path, { format: 'text' })

      return {
        content: truncateText(content, maxLength),
        truncated: content.length > maxLength,
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '文件读取失败' }
    }
  },
})

const write_file = tool({
  description: '向沙箱写入文本文件。文件不存在时会创建，存在时会覆盖。',
  inputSchema: z.object({
    path: z.string().trim().min(1).describe('要写入的文件路径。'),
    content: z.string().describe('文件内容。'),
  }),
  execute: async ({ path, content }) => {
    try {
      const sandbox = await ensureSandbox()
      const info = await sandbox.files.write(path, content)

      return { path: info.path }
    } catch (error) {
      return { error: error instanceof Error ? error.message : '文件写入失败' }
    }
  },
})

const edit_file = tool({
  description: '通过精确字符串替换编辑沙箱中的文本文件。',
  inputSchema: z.object({
    path: z.string().trim().min(1).describe('要编辑的文件路径。'),
    oldText: z.string().min(1).describe('文件中需要被替换的原始文本，必须精确匹配。'),
    newText: z.string().describe('替换后的新文本。'),
    replaceAll: z
      .boolean()
      .optional()
      .default(false)
      .describe('是否替换全部匹配项，默认只替换第一个。'),
  }),
  execute: async ({ path, oldText, newText, replaceAll }) => {
    try {
      const sandbox = await ensureSandbox()
      const content = await sandbox.files.read(path, { format: 'text' })
      const occurrences = content.split(oldText).length - 1

      if (occurrences === 0) {
        return { edited: false, error: '未找到要替换的原始文本' }
      }

      const nextContent = replaceAll
        ? content.replaceAll(oldText, newText)
        : content.replace(oldText, newText)

      const info = await sandbox.files.write(path, nextContent)

      return { path: info.path, edited: true, replacements: replaceAll ? occurrences : 1 }
    } catch (error) {
      return { edited: false, error: error instanceof Error ? error.message : '文件编辑失败' }
    }
  },
})

const glob = tool({
  description: '在沙箱中按 glob 模式查找文件路径。',
  inputSchema: z.object({
    pattern: z.string().trim().min(1).describe('glob 模式，例如 **/*.ts。'),
    cwd: z.string().trim().min(1).optional().default('.').describe('查找起始目录，默认当前目录。'),
    maxResults: z.int().min(1).max(500).optional().default(100).describe('最多返回多少条结果。'),
  }),
  execute: async ({ pattern, cwd, maxResults }) => {
    const command = `rg --files -g ${shellQuote(pattern)} --no-ignore 2>/dev/null | sort | head -n ${maxResults}`
    const result = await runCommand({ command, cwd })
    const stdout = 'stdout' in result ? (result.stdout ?? '') : ''
    const matches = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(relativePath => ({ path: resolveSandboxPath(cwd, relativePath), relativePath }))

    return noNull({
      matches,
      count: matches.length,
      error: 'error' in result ? result.error : null,
    })
  },
})

const grep = tool({
  description: '在沙箱中使用 ripgrep 搜索文件内容。',
  inputSchema: z.object({
    pattern: z.string().trim().min(1).describe('要搜索的文本或正则表达式。'),
    path: z
      .string()
      .trim()
      .min(1)
      .optional()
      .default('.')
      .describe('搜索目录或文件，默认当前目录。'),
    ignoreCase: z.boolean().optional().default(false).describe('是否忽略大小写。'),
    maxResults: z
      .int()
      .min(1)
      .max(500)
      .optional()
      .default(100)
      .describe('最多返回多少条匹配结果。'),
  }),
  execute: async ({ pattern, path, ignoreCase, maxResults }) => {
    const flags = ignoreCase ? '-n -i' : '-n'
    const command = `rg ${flags} -m ${maxResults} -- ${shellQuote(pattern)} ${shellQuote(path)}`
    const result = await runCommand({ command })
    const stdout = 'stdout' in result ? (result.stdout ?? '') : ''
    const matches = stdout
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const match = /^(.*?):(\d+):(.*)$/.exec(line)

        if (!match) {
          return { path: '', lineNumber: 0, text: line }
        }

        return { path: match[1], lineNumber: Number(match[2]), text: match[3] }
      })

    return noNull({
      matches,
      count: matches.length,
      error: 'error' in result ? result.error : null,
    })
  },
})

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const modelMessage = await convertToModelMessages(messages)

  let uiWriter: UIMessageStreamWriter<UIMessage> | undefined

  const command = tool({
    description: '在沙箱中执行 shell 命令。适合运行测试、安装依赖、执行脚本等。',
    inputSchema: z.object({
      command: z.string().trim().min(1).describe('要执行的 shell 命令。'),
      cwd: z.string().trim().min(1).optional().describe('命令工作目录。'),
    }),
    execute: async ({ command, cwd }, { toolCallId }) => {
      let output = ''
      let outputBuffer = ''

      const decoder = new TextDecoder()

      const {
        promise: commandDonePromise,
        resolve: resolveCommandDone,
        reject: rejectCommandDone,
      } = Promise.withResolvers<number>()

      function writeTerminalChunk(text: string) {
        if (!text) {
          return
        }

        output += text
        uiWriter?.write({
          type: 'data-terminal-stream',
          data: { text, toolCallId, stream: 'stdout' },
        } as any)
      }

      const { sandbox, terminal } = await ensureTerminal({
        cwd,
        onData: data => {
          const text = decoder.decode(data, { stream: true })
          if (!text) {
            return
          }

          const parsed = parseTerminalOutputBuffer(outputBuffer + text, true)
          outputBuffer = parsed.nextBuffer

          if (parsed.visibleText) {
            writeTerminalChunk(parsed.visibleText)
          }

          if (parsed.completed) {
            resolveCommandDone?.(parsed.exitCode ?? 0)
          }
        },
      })

      try {
        await sandbox.pty.sendInput(
          terminal.pid,
          new TextEncoder().encode(toEndsWith(command, '\n'))
        )
        const exitCode = await commandDonePromise

        const tail = decoder.decode()
        const tailResult = parseTerminalOutputBuffer(outputBuffer + tail, false)
        outputBuffer = tailResult.nextBuffer

        if (tailResult.visibleText) {
          writeTerminalChunk(tailResult.visibleText)
        }

        return noNull({ exitCode, stdout: output ? truncateText(output) : null })
      } catch (error) {
        if (error instanceof CommandExitError) {
          return noNull({
            exitCode: error.exitCode,
            error: error.error,
            stdout: output || error.stdout ? truncateText(output || error.stdout) : null,
            stderr: error.stderr ? truncateText(error.stderr) : null,
          })
        }

        return noNull({
          error: error instanceof Error ? error.message : '命令执行失败',
          stdout: output ? truncateText(output) : null,
        })
      } finally {
        rejectCommandDone?.(new Error('终端会话已关闭'))
        await terminal.disconnect().catch(() => undefined)
      }
    },
  })

  const tools = { init_sandbox, command, ls, read_file, write_file, edit_file, glob, grep }

  const stream = createUIMessageStream<UIMessage>({
    execute: async ({ writer }) => {
      uiWriter = writer

      const result = streamText({
        model: mainModel,
        messages: modelMessage,
        tools,
        prepareStep: ({ messages }) => {
          const sandboxInited = isSandboxInited(messages)

          return {
            system: sandboxInited
              ? '你可以使用沙箱工具读写文件、搜索文件和执行命令。沙箱是临时 Linux 环境，已安装 Python、Node.js、curl 等常用工具。执行命令前尽量先确认当前目录和文件结构。修改文件优先使用 write_file 或 edit_file，搜索文件优先使用 glob 或 grep。'
              : '当前可用 Linux 沙箱。如需读写文件、搜索文件或执行命令，可使用 init_sandbox 初始化沙箱。',
            activeTools: sandboxInited
              ? (Object.keys(tools).filter(toolName => toolName !== 'init_sandbox') as any)
              : ['init_sandbox'],
          }
        },
        stopWhen: stepCountIs(10),
      })

      writer.merge(toUIMessageStream({ stream: result.stream }))
    },
  })

  return createUIMessageStreamResponse({ stream })
}
