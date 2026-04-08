import 'server-only'

import dayjs from 'dayjs'
import { toEndsWith } from 'omn'

export interface HistoryProps {
  filename: string
  oldFilename?: string
}

interface PostHistory {
  message: string
  id: string
  url: string
  date: string
  old?: boolean
}

const HISTORY_LIMIT = 5

async function githubHistory(repo: string, path: string): Promise<PostHistory[]> {
  const query = new URLSearchParams({ path, sha: 'main' })
  const prefixURL = process.env.GITHUB_API_PROXY_PREFIX
    ? toEndsWith(process.env.GITHUB_API_PROXY_PREFIX, '/')
    : ''
  const response = await fetch(
    prefixURL + `https://api.github.com/repos/${repo}/commits?${query}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_PERSON_TOKEN}`,
      },
    }
  )

  if (!response.ok) {
    return []
  }

  const commits = await response.json()

  if (!Array.isArray(commits)) {
    return []
  }

  const result = commits.map(item => ({
    message: item.commit.message,
    id: item.sha,
    url: item.html_url,
    date: item.commit.author?.date ?? '',
  }))

  return result
}

async function articleHistory(filename: string, oldFilename?: string) {
  const [history, oldHistory] = await Promise.all([
    githubHistory('chiskat/paperplane.cc', `/articles/posts/${filename}.mdx`),
    oldFilename
      ? githubHistory('chiskat/paperplane-blog', `/source/_posts/${oldFilename}.md`)
      : Promise.resolve([]),
  ])

  const result = [...history, ...oldHistory?.map(item => ({ ...item, old: true }))]

  return result
}

function getHistoryTimestamp(date: string) {
  const parsedDate = dayjs(date)
  return parsedDate.isValid() ? parsedDate.valueOf() : -1
}

function getHistoryDateText(date: string) {
  const parsedDate = dayjs(date)
  return parsedDate.isValid() ? parsedDate.format('YYYY年 M月 D日') : '时间未知'
}

function getMessageTitle(message: string) {
  const firstLine = message
    .split('\n')
    .map(line => line.trim())
    .find(Boolean)

  return firstLine ?? '无提交信息'
}

function getAllRevisionsUrl(filename: string) {
  const encodedFilename = filename
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/')

  return `https://github.com/chiskat/paperplane.cc/commits/main/articles/posts/${encodedFilename}.mdx`
}

export default async function History({ filename, oldFilename }: HistoryProps) {
  const history = await articleHistory(filename, oldFilename)
  const sortedHistory = [...history].sort(
    (a, b) => getHistoryTimestamp(b.date) - getHistoryTimestamp(a.date)
  )

  const shouldTruncateHistory = sortedHistory.length > HISTORY_LIMIT
  const visibleHistory = shouldTruncateHistory
    ? sortedHistory.slice(0, HISTORY_LIMIT)
    : sortedHistory

  return (
    <section id="history" className="font-title-serif mt-14 border-t border-[#ddd] pt-8">
      <h2 className="mb-6 text-[30px]">修订记录</h2>

      {visibleHistory.length > 0 ? (
        <div className="relative">
          <ul className="relative space-y-5 pl-8 before:absolute before:top-[1.54rem] before:bottom-0 before:left-2.75 before:w-px before:bg-[#ddd] before:content-['']">
            {visibleHistory.map(item => (
              <li
                key={`${item.id}-${item.old ? 'old' : 'new'}`}
                className="relative w-fit max-w-full"
              >
                <span className="absolute top-[1.1rem] -left-7 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#356daa] shadow-[0_0_0_1px_#356daa]" />

                <div className="inline-block max-w-full rounded-[3px] border border-[#ddd] bg-[rgba(255,255,255,0.7)] px-4 py-3">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[15px] text-[#999]">
                    <time dateTime={item.date}>{getHistoryDateText(item.date)}</time>
                    {item.old ? (
                      <span className="rounded-full bg-[#f0ebe6] px-2 py-0.5 text-[13px] text-[#8a6a4a]">
                        旧版 Hexo 博客
                      </span>
                    ) : null}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    title={getMessageTitle(item.message)}
                    className="font-content-serif block truncate text-[18px] leading-normal text-[#333] no-underline transition-colors duration-200 visited:text-[#333] hover:text-[#c0332f] hover:no-underline"
                  >
                    {getMessageTitle(item.message)}
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <div className="font-content-serif relative mt-5 text-left text-[18px] leading-normal before:absolute before:-top-5 before:left-2.75 before:h-3 before:w-px before:bg-[#ddd] before:content-['']">
            {shouldTruncateHistory ? (
              <a
                href={getAllRevisionsUrl(filename)}
                target="_blank"
                rel="noreferrer"
                className="text-[#356daa] underline decoration-[#356daa]/40 underline-offset-[3px] transition-all duration-200 hover:text-[#c0332f] hover:decoration-[#c0332f]/60"
              >
                查看全部修订
              </a>
            ) : (
              <span className="">创建文章</span>
            )}
          </div>
        </div>
      ) : (
        <p className="font-content-serif text-[18px] text-[#999]">暂无历史修改记录</p>
      )}
    </section>
  )
}
