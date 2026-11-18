import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defaultBuildLogger, Template } from 'e2b'

// code-interpreter-v1 基于以下源码构建，可查看预装依赖：
// https://github.com/e2b-dev/code-interpreter/blob/main/template/template.py

const currentDir = dirname(fileURLToPath(import.meta.url))

async function buildSandbox() {
  const template = Template({
    fileContextPath: resolve(currentDir, '../sandbox'),
    fileIgnorePatterns: [],
  })
    .fromTemplate('code-interpreter-v1')
    .runCmd('sudo apt-get update')
    .aptInstall(
      [
        'fonts-ipafont-gothic',
        'fonts-wqy-zenhei',
        'fonts-thai-tlwg',
        'fonts-kacst-one',
        'fonts-freefont-ttf',
        'fonts-noto-color-emoji',
      ],
      { noInstallRecommends: true }
    )
    .npmInstall('npm', { g: true })
    .npmInstall('yarn', { g: true })
    .npmInstall('pnpm', { g: true })
    .copy('command_complete.sh', '/tmp/')
    .runCmd(
      'sudo bash -lc "printf \'\\n\' >> /etc/bash.bashrc && cat /tmp/command_complete.sh >> /etc/bash.bashrc"'
    )

  const result = await Template.build(template, 'paper-agent-sandbox', {
    cpuCount: 2,
    memoryMB: 2048,
    skipCache: process.argv.includes('--skip-cache'),
    onBuildLogs: defaultBuildLogger(),
    apiKey: process.env.AI_E2B_API_KEY,
  })

  console.log(`E2B 镜像构建完成`)
  console.log(`模板名： ${result.name}`)
  console.log(`模板 ID： ${result.templateId}`)
}

buildSandbox()
