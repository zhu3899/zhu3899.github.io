---
title: 搭建这个博客用到的所有技术
description: Astro 7 + Tailwind v4 + Pagefind + giscus 的完整技术选型记录，以及为什么这么选。
pubDate: 2026-08-22
tags: [Astro, 建站]
---

## 选型一览

| 层面 | 选择 | 一句话理由 |
| ---- | ---- | ---------- |
| 框架 | Astro | 内容优先，默认零 JS，静态输出 |
| 样式 | Tailwind CSS v4 | 原子类 + CSS 变量主题 |
| 内容 | Content Collections | frontmatter 有类型校验，写错直接构建失败 |
| 高亮 | Shiki | VS Code 同源引擎，支持双主题 |
| 搜索 | Pagefind | 构建后生成纯静态索引，无后端 |
| 评论 | giscus | 数据存在 GitHub Discussions |

## 为什么是静态站

个人博客 99% 的流量是「读文章」，动态后端带来的复杂度（数据库、备份、安全补丁）远大于收益。静态站的部署目标只是一个 CDN：

```text
Markdown → astro build → dist/ → CDN
```

## 初始化命令

```bash
npm create astro@latest blog -- --template minimal --no-git --install --yes
npx astro add tailwind sitemap
npm install @astrojs/rss pagefind
```

## 双主题代码高亮

Shiki 支持一次编译输出两套颜色变量，配合 CSS 变量切换即可实现明暗主题下的高亮适配：

```js
export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'one-dark-pro' },
    },
  },
});
```

```css
html[data-theme='dark'] .astro-code,
html[data-theme='dark'] .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

## 全文搜索：Pagefind

Pagefind 在 `build` 之后扫描 `dist/` 里的 HTML 自动建立索引，前端只需动态 import 它的脚本：

```json
{
  "scripts": {
    "build": "astro build && pagefind --site dist"
  }
}
```

搜索 UI 是自己写的 Ctrl+K 弹窗 —— 大概 80 行原生 JS，没有引入任何框架运行时。

## 目录结构

```text
src/
├── content/blog/     Markdown 文章（数据本体）
├── components/       Header / PostCard / GenArt ...
├── layouts/          BaseLayout / PostLayout
├── lib/              generative.ts 生成艺术引擎
├── pages/            路由即文件
└── styles/           global.css 设计令牌
```

## 部署

推到 GitHub 后在 Vercel 或 Cloudflare Pages 导入仓库即可，构建命令 `npm run build`、输出目录 `dist`，之后每次 push 自动发布。

整个过程没有任何服务器需要维护。**Git 仓库就是数据库，Markdown 就是 CMS。**
