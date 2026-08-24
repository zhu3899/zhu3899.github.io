# DEV.LOG — Code as Art 极客博客

生成艺术风 × 瑞士排版的个人博客。所有文章封面与首屏动画均由 Canvas 流场算法根据标题种子实时生成，零外部图片依赖。

## 技术栈

| 层面 | 技术 |
| ---- | ---- |
| 框架 | Astro 7（纯静态输出） |
| 样式 | Tailwind CSS v4 + CSS 变量双主题 |
| 内容 | Content Collections（frontmatter 类型校验） |
| 代码高亮 | Shiki 双主题 + 一键复制按钮 |
| 全文搜索 | Pagefind（构建后静态索引，Ctrl+K 唤起） |
| 评论 | giscus（GitHub Discussions） |
| 订阅 | RSS + Sitemap |

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 http://localhost:4321
npm run build      # 构建 + 生成搜索索引 → dist/
npm run preview    # 预览构建产物（可测试搜索功能）
npm run check      # 类型检查
```

> 搜索索引由 `npm run build` 生成到 `dist/pagefind/`。开发模式下已通过 Vite 中间件自动复用 `dist/` 里的索引——只要构建过一次，dev 里 Ctrl+K 即可搜索；新写的文章需要重新 build 才会进索引。

## 写新文章

在 `src/content/blog/` 新建 `.md` 文件：

```md
---
title: 文章标题
description: 摘要（列表页展示）
pubDate: 2026-08-24
tags: [标签1, 标签2]
---

正文支持 Markdown，封面会根据文件名自动生成。
```

草稿：加一行 `draft: true` 即不会被构建发布。

## 上线前必改的配置

**1. 站点信息** — 编辑 `src/site.config.ts`：

- `url`：改成你的正式域名（同时同步修改 `astro.config.mjs` 里的 `site`，影响 sitemap/RSS/OG）
- `author`、`github`、`email`

**2. 评论系统 giscus（可选）**

1. 准备一个公开 GitHub 仓库，开启 Settings → Discussions
2. 安装 [giscus app](https://github.com/apps/giscus)
3. 打开 <https://giscus.app/zh-CN> 按向导生成配置
4. 把生成的 `repo`、`repoId`、`category`、`categoryId` 填入 `src/site.config.ts` 的 `GISCUS`

不填则评论区自动隐藏，不影响其他功能。

## 部署

### Vercel

1. 把整个项目推到 GitHub 仓库
2. <https://vercel.com/new> 导入该仓库，框架自动识别为 Astro
3. Build Command 保持 `npm run build`，Output Directory 为 `dist`
4. Deploy —— 之后每次 push 自动发布

### Cloudflare Pages

1. 推到 GitHub 后，<https://dash.cloudflare.com> → Workers & Pages → Create → 连接仓库
2. 构建命令 `npm run build`，输出目录 `dist`
3. 绑定自定义域名（可选）

## 目录结构

```text
src/
├── content/blog/     Markdown 文章（你的全部数据）
├── components/       Header / GenArt / SearchDialog / Giscus ...
├── layouts/          BaseLayout / PostLayout
├── lib/generative.ts 生成艺术引擎（流场 + 种子随机）
├── pages/            路由：首页 / 文章 / 归档 / 标签 / 关于 / 404 / rss
└── styles/global.css 设计令牌与全局样式
```

## 自定义生成艺术

调色板与笔触参数集中在 `src/lib/generative.ts`：

- `palette()`：色相区间（默认青 178°–202° 与紫 252°–282°）
- `drawStatic()`：线条数量 / 步长 / 透明度
- `startHero()`：首屏粒子数（520）与鼠标扰动半径（160px）

改完 `npm run dev` 即时预览。
