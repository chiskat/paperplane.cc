import puppeteer from 'puppeteer'

export interface GetSnapshotOptions {
  url: string
  width: number
  height: number
}

export async function getSnapshot({ url, width, height }: GetSnapshotOptions) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()

    await page.setViewport({ width: width + 100, height: height + 100, deviceScaleFactor: 2 })
    await page.goto(url, { waitUntil: 'networkidle0' })

    const file = Buffer.from(await page.screenshot({ clip: { x: 0, y: 0, width, height } }))
    await page.close()
    browser.close()

    return file
  } finally {
    browser?.close()
  }
}
