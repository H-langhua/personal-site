# personal-site

个人网站：作品集 + 技术博客 + 交互实验室（Labs），中英双语，暗黑科技风。

## 技术栈

- **Next.js 16**（App Router、Turbopack、Cache Components / PPR）
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**（radix base）
- **next-themes**：默认暗色，可切亮色
- 内置字典式 **i18n**（`zh` / `en`，无额外依赖，路由前缀 `/[locale]`）
- 博客：本地 **MDX**（`gray-matter` + `next-mdx-remote/rsc` + `rehype-pretty-code`/Shiki）
- 动效：**motion**（framer-motion）
- 交互实验：**AntV X6** 图形编辑器、**Three.js** 3D 场景、**ECharts** 实时大屏
- 部署：**Vercel**

## 开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
npm run start    # 运行构建产物
npm run lint     # ESLint（Next 16 已移除 next lint）
```

## 目录结构

```
app/
  [locale]/
    layout.tsx              # 根布局：<html>、主题、页头页脚、i18n
    page.tsx                # 首页
    projects/{page,[slug]}  # 作品集
    blog/{page,[slug]}      # 博客
    labs/{page,[slug]}      # 交互实验室
    about/page.tsx          # 关于
    opengraph-image.tsx     # 动态 OG 图
  sitemap.ts  robots.ts     # SEO
components/
  ui/                       # shadcn 组件
  sections / 卡片 / 布局     # 业务组件
  demos/x6-editor.tsx       # X6 图形编辑器（客户端）
  demos/three-scene/        # Three.js 3D 场景（客户端）
  demos/realtime-dashboard/ # 实时数据大屏（客户端）
content/blog/{zh,en}/*.mdx  # 博客文章
data/                       # 站点/项目/技能/经历/Labs 数据
lib/                        # i18n、字典、内容读取、格式化
messages/{zh,en}.json       # 界面文案
proxy.ts                    # 语言检测与重定向（Next 16 的 middleware）
```

## 内容维护

- **站点信息（姓名、邮箱、社交链接）**：`data/site.ts`
- **项目**：`data/projects.ts`（新增对象即可，列表/详情/首页精选自动生成）
- **技能**：`data/skills.ts`
- **实验室**：`data/labs.ts`；`labs/[slug]` 页面按 `slug` 渲染对应 demo
- **博客**：在 `content/blog/{zh,en}/` 新增 `.mdx`，frontmatter：

  ```yaml
  ---
  title: "标题"
  description: "摘要"
  date: "2025-08-02"
  tags: ["Next.js"]
  # updated: "2025-08-10"
  # draft: true
  ---
  ```

- **界面文案**：`messages/zh.json`、`messages/en.json`（两种语言需保持同结构）

## 部署到 Vercel

1. 把仓库推到 GitHub。
2. 在 [vercel.com/new](https://vercel.com/new) 导入该仓库，框架会自动识别为 Next.js，无需额外配置。
3. 部署完成后在 Project Settings → Domains 绑定自定义域名。
4. 上线前请把 `data/site.ts` 里的 `url` 改成正式域名（影响 metadata、OG、sitemap、robots）。

> 也可部署到 Netlify、Cloudflare Pages 或任意支持 Node 的平台；本项目的动态 OG 图与 sitemap 需要 Node 运行时。

## Next.js 16 注意事项

- `params` / `searchParams` 均为 **Promise**，必须 `await`。
- `middleware` 已更名为 **`proxy`**（默认 Node 运行时，不再支持 edge）。
- 本项目开启了 `cacheComponents`：渲染期不能直接使用 `new Date()` 等非稳定值，需用 `"use cache"`（见 `lib/format.ts`、`components/post-body.tsx`）。
- 路由段配置 `dynamicParams` 与 `cacheComponents` 不兼容，已移除。
