# DEV.LOG — Code as Art 极客博客

青绿山水设色的个人博客，**全站没有一张图片**。颜色取自石青、石绿、赭石与泥金，
其余靠字距、留白、印章与装裱线来立——风格全由排版承担。

## 技术栈

| 层面 | 技术 |
| ---- | ---- |
| 框架 | Astro 7（纯静态输出） |
| 样式 | Tailwind CSS v4 + CSS 变量双主题（青绿山水 · 绢本设色 / 夜山） |
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

正文支持 Markdown，列表与文章页的版式由 `PostCard.astro` / `PostLayout.astro` 统一处理。
```

草稿：加一行 `draft: true` 即不会被构建发布。

## 上线前必改的配置

**1. 站点信息** — 编辑 `src/site.config.ts`：

- `url`：改成你的正式域名。`astro.config.mjs` 的 `site` 已直接引用这个字段，
  不需要再改第二处；它影响 sitemap / RSS / OG / canonical
- `author`、`github`、`email`：页脚与关于页都已引用这些字段，改这里即全站生效

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
├── components/       Header / PostCard / Toc / SearchDialog / Giscus ...
├── layouts/          BaseLayout / PostLayout
├── pages/            路由：首页 / 文章 / 归档 / 标签 / 关于 / 404 / rss
└── styles/global.css 设计令牌、双主题与东方排版构件
```

## 风格怎么落地的

**没有图片**。青绿山水在这里是一套排版观念，不是一张插图：

| 手法 | 实现 | 用在哪 |
| --- | --- | --- |
| 矿物色 | `global.css` 两组 CSS 变量 | 全站 |
| 留白 | 加大区块间距与行距（正文 `line-height: 1.95`） | 全站 |
| 字距 | `.tight-cn` / `.loose-cn`，汉字标题与竖排各用一档 | 标题、题签 |
| 印章 | `.seal` —— 全站唯一的朱红，只用在最要紧处 | 首屏、文末、关于页 |
| 竖排 | `.vertical`（`writing-mode: vertical-rl`） | 首屏题签 |
| 文武线 | `.rule-double`（一粗一细） | 文章题头、列表页 |
| 泥金线 | `.rule-gold` —— 只起头不闭合 | 卡片、小节标题 |
| 汉字序号 | `PostCard.astro` 里的 `cn()` | 列表序号 |
| 笔锋 | `.post-row` —— 左侧石青细线，hover 时长起来 | 文章条目 |

## 隐藏的彩蛋 · 月洞门

首页右下方那枚印章（`點印開卷`）是个按钮。**点印章**，纸面就从印的位置裂开一个月洞门一样的圆孔，洞外是**手绘 SVG 的青绿山水**——四层山脊（远中近 + 赭石前景）、云气带、皴法、泥金水纹、朱砂日轮。画卷在背后非常缓慢地平移（48s 一个来回），像立在月洞门里看出去的实景。

| 触发 | 行为 |
| --- | --- |
| 点击印章 | 圆孔从印章中心向四周缓慢展开（2.8s），印章微微"钤印"顿挫，淡淡一圈涟漪 |
| 再点印章 / 点别处 / `Esc` | 收卷 |

山水的颜色全部走 CSS 变量，所以深浅两套主题自动跟着变。  
实现全在 `src/components/MoonGate.astro`（SVG + script，约 180 行），不依赖任何新包。

## 主题

配色定义在 `src/styles/global.css` 的两组变量里（`:root` / `[data-theme='dark']` 与
`[data-theme='light']`）。**默认浅色**（绢本设色），深色为「夜山」变体。

切换主题只需改变量——页面里没有任何硬编码颜色，也没有需要重绘的画布。
`Header.astro` 广播 `theme-change` 事件，供需要联动的地方（如 giscus）监听。

改完 `npm run dev` 即时预览。
