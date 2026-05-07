# PaperPlane.cc

个人网站 [PaperPlane.cc](https://paperplane.cc) 的源代码。

## 起源

此项目自以下项目迁移合并：

- [paperplane-blog](https://github.com/chiskat/paperplane-blog)，技术博客，基于 Hexo，集成了自制主题和插件；
- [paperplane-next](https://github.com/chiskat/paperplane-next)，全栈网站，基于 Next.js + Mantine UI + tRPC + Prisma；
- [paperplane-web-console](https://github.com/chiskat/paperplane-web-console)，在线工具 Node.js 全栈网站，是包含了前后端的 Monorepo 仓库，前端基于 Vite + React + TDesign，后端基于 Nest.js + tRPC + Prisma。

## 技术栈

- 前端基于 Next.js，组件库使用 Shadcn 构建系统，基于 ArkUI (SharkUI) + MagicUI + AnimateUI；
- 后端基于 tRPC 实现接口，通过 BetterAuth 实现鉴权，通过 Prisma 实现 ORM，通过 `trpc-to-openapi` 提供 OpenAPI 接口；
- 通过 `@tanstack/react-query` 实现查询，通过 `@tanstack/react-form` 实现表单校验与数据处理，通过 Zod 实现数据校验；
- 基于 `@next/mdx` 实现 mdx 文档组件化，基于 `remark` 和 `rehype` 生态的一些插件实现 Markdown 自定义解析；
- 使用 Drone CI 实现 CI/CD。

## 开发指南

配置需知：

- 查看 `/.env.example` 了解所有环境变量，请创建 `/.env.development.local` 并在其中补全；
- 必须能连接到 PostgreSQL、Redis；博客评论区用到了 Artalk，需部署并配置；很多功能需要用到 S3 存储，需配置相关参数；
- 如果用到登录功能，项目默认基于 Gitea 的 OAuth2 登录，需预先创建 OA2 应用；也可以改为其它的例如 GitHub 的 OA2。

部署需知：

- 可通过 `NEXT_PUBLIC_CDN_BASE_URL` 定制资源的 URL，例如放置于外部 CDN，设置后请通过 CI/CD 自行上传；
- 部署 CI/CD 过程中，需要使用命令 `pnpm db:mi` 来通过 Prisma 迁移数据库结构，此步骤需使用生产环境的环境变量；
- 代码中所有徽标 Shields 基于自部署的 `shields.paperplane.cc`，部署时可能无法通过域名验证，需手动替换。

常用命令：

```bash
# 安装依赖
pnpm i

# 本地开发
pnpm dev

# 修改 Prisma 结构定义后，需要生成 TS 类型
pnpm db:gen

# 开发环境下迁移数据库结构
pnpm db:mi
```
