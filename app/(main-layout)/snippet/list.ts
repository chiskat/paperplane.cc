interface SnippetListCategory {
  dir: string
  title: string
  icon?: string
  children: string[]
}

interface SnippetListGroup {
  title: string
  children: SnippetListCategory[]
}

export const list: SnippetListGroup[] = [
  {
    title: '系统',
    children: [
      {
        dir: '_command',
        title: '常用命令行',
        children: ['npm', 'pnpm', 'yarn', 'git', 'macos', 'windows', 'linux'],
      },
      { dir: '_vscode', title: 'VSCode', children: ['global', 'project'] },
    ],
  },

  {
    title: '通用',
    children: [
      { dir: '_license', title: 'LICENSE 许可', children: ['intro', 'mit'] },
      { dir: '_editorconfig', title: 'EditorConfig', children: ['editorconfig'] },
      { dir: '_git', title: 'Git', children: ['gitignore', 'gitattributes'] },
      { dir: '_typescript', title: 'TypeScript', children: ['react', 'publish', 'decorator'] },
    ],
  },

  {
    title: '开发配置',
    children: [
      { dir: '_next.js', title: 'Next.js', children: ['basic', 'cdn', 'image', 'markdown'] },
      { dir: '_vite', title: 'Vite', children: ['react', 'cdn', 'css', 'env'] },
      { dir: '_vitest', title: 'Vitest', children: ['basic', 'msw', 'server', 'browser'] },
      { dir: '_postcss', title: 'PostCSS', children: ['config'] },
      { dir: '_rollup', title: 'Rollup', children: ['typescript', 'external', 'node'] },
      {
        dir: '_eslint',
        title: 'ESLint',
        children: ['intro', 'react', 'nextjs', 'typescript', 'monorepo', 'v8'],
      },
      { dir: '_prettier', title: 'Prettier', children: ['prettierrc', 'sort', 'prettierignore'] },
      { dir: '_tailwindcss', title: 'TailwindCSS', children: ['config'] },
    ],
  },

  {
    title: '包管理',
    children: [
      { dir: '_npm', title: 'npm', children: ['npmrc'] },
      {
        dir: '_package.json',
        title: 'package.json',
        icon: 'nodejs',
        children: ['project', 'publish'],
      },
    ],
  },

  {
    title: '传统',
    children: [
      { dir: '_webpack', title: 'Webpack', children: ['common', 'cdn', 'sass', 'less', 'antdv4'] },
      { dir: '_babel', title: 'Babel', children: ['antd', 'cra', 'lib', 'mui'] },
      { dir: '_cra', title: 'CreateReactApp', children: ['intro', 'babel', 'webpack', 'css'] },
    ],
  },

  {
    title: '杂项',
    children: [{ dir: '_monorepo', title: 'Monorepo', children: ['config'] }],
  },
]
