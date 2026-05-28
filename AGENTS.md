# AGENTS.md

此文档是 `paperplane.cc` 项目的开发指南，用于为 AI 编程助手提供项目上下文和开发规范。

注意，此文档并不是固定不变的；后续开发新功能，如果有些特别约定，请即时更新此文档。

## 项目概述

PaperPlane.cc 是一个由用户 chiskat 开发的基于 Next.js 的全栈个人网站，整合了博客、在线工具、项目展示等功能。

## 技术栈

参考 @README.md 的 “技术栈” 章节。

## 目录结构

- `app/`：Next.js App Router 页面、布局和路由处理，此目录下文件名允许 PascalCase
  - `(main-layout)/`：使用主站布局的页面路由，绝大部分页面应该在这里
  - `(no-layout)/`：不使用主站布局的路由，例如部分给 Puppeteer 截图用的界面
  - `(redirect)/`：跳转、短链等重定向相关路由
  - `(well-known)`：网站一些元数据，例如 SiteMap、llms.txt、OIDC 等
  - `api/`：接口路由，tRPC、Better-Auth 等工具会使用此路径
- `apis/`：tRPC 后端业务接口代码
- `components/`：通用 UI 组件，此目录下文件名必须遵循 dash-case
- `hooks/`：通用 React Hooks
- `lib/`：认证、数据库、缓存、存储、tRPC 等基础设施封装
- `models/`：由 Prisma 生成的类型，禁止直接修改
- `prisma/`：数据库 Schema，修改后，需要运行 `pnpm db:gen` 生成新的类型代码，推送前，需要运行 `pnpm db:mi` 生成迁移 SQL
- `assets/`、`styles/`：静态资源、全局样式
- `utils/`：通用工具函数
- `plugins/`：用于扩展 Next.js 的插件，目前包含了一系列处理 .mdx 的插件

## 通用规范

- `/app` 目录下的组件可以使用 PascalCase 命名，其它文件尽量以 dash-case 命名
- 为了提高 Next.js 约定式路由的性能，不需要作为 path 的目录请使用 `_` 下划线开头
- 对象写法尽量写到一行内，不要把每个字段都单开一行
- Prettier 配置了每行最大字符数限制、`import` 排序规则、TailwindCSS 类名排序规则
- ESLint 配置了 Next.js 和 React 相关最佳实践规则，ESLint 还会要求源码必须符合 Prettier 的输出
- 可通过 `pnpm ckeck-types` 检查 TS 错误、`pnpm lint` 检查 ESLint 错误，`pnpm format` 检查 Prettier 错误
- 日期处理相关，请优先使用 `dayjs` 而不是自行实现复杂的计算逻辑
- 数据实体模型尽可能使用现有的，优先使用 Prisma 中的，或是通过 Zod 的 `z.infer<typeof 实体对象>` 来提取类型
- 新增模块后，请在 @app/sitemap.ts 将新模块信息加入 `sitePages` 数组，站点地图和 llms.txt 都依据它来更新

## 前端规范

- 优先使用 `@tabler/icons-react` 图标库
- 处理 `className` 拼接请使用 @/utils/style 里的 `cn` 函数，不要手写代码拼接
- 页面需要有 title，前面可以有一个或多个标题，末尾是 `PaperPlane.cc`，中间使用 `-` 连接
- 组件代码中，请先导出组件参数 `interface`，然后再导出组件 `function`
- 组件代码中，组件参数的类型名称必须是组件名后加 `Props`
- 组件接受的 `string` 格式的参数，都要考虑是否可以换成 `ReactNode`
- 使用 Shadcn 添加 UI 组件时，如果提示某些文件已存在，则不要覆盖现有文件；添加后请对新增的文件进行格式化，处理其中的 ESLint 问题
- 对于拖拽放置类组件，需实现原始版本和 “可拖拽” 版本，拖拽过程中通过 `createPortal()` 包裹原始版本组件，来模拟被拖拽元素的样式；具体代码可以参考 @app/(main-layout)/awesome/\_item/AwesomeSortButton.tsx

## 后端规范

- 可使用 @lib/with-redis-cache.ts 对某个函数的运行结果进行缓存，前提是函数必须返回可序列化数据
- 项目已配置 `trpc-to-openapi`，tRPC 接口通过 `.meta(...)` 即可对外暴露为 OpenAPI 接口
- 对外暴露 OpenAPI 接口时，其 `.input(...)` 只支持最简单的 zod 数据，例如 `discriminatedUnion` 这类复杂类型都不支持
- 对外暴露 OpenAPI 接口时，必须有 `.output(...)` 规定输出格式；仅项目内使用的接口没有此强制要求
- 对外暴露 OpenAPI 接口，其 path 使用 RESTful 风格，但 method 只支持 GET 和 POST
- 对外暴露 OpenAPI 接口时只支持 JSON 数据，文件上传建议让客户端先使用 S3 预签名接口，然后让客户端自行上传到 S3 并获取返回的 URL，把 URL 作为文件字段提交，服务端进行校验即可

## Prisma 规范

- 导入 Prisma 类型时使用 `@/models/client`，如果是前端页面，需从 `@/models/browser` 导入
- Schema 中，所有表名、字段名必须使用 `@map` 或 `@@map` 映射为 snake_case 格式
- Schema 中，必须遵循 `id` 在最开头、`createdAt` 和 `updatedAt` 在最末尾
- Schema 中，外键的字段名和数据类型必须单独放在一起，使用空行分区
- Schema 中，每个 Model 顶部必须有 `///` 三斜杠开头的中文注释
- 设计外键时，考虑其 `onDelete` 是否要级联删除，还是置空
