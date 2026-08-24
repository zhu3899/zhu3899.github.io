---
title: 你好，世界：这个博客正式开张
description: 为什么在 2026 年还要自己写博客？关于写作、极客精神与数字花园的一点想法。
pubDate: 2026-08-20
tags: [随笔]
---

## 缘起

社交媒体的时间线是别人的算法决定的，而博客的时间线只属于自己。这里没有热搜、没有推荐流，只有安安静静躺在 Git 历史里的每一个字。

> 写作是为了思考清楚，发布是为了思考更清楚。

## 这里会写什么

1. **生成艺术** —— Canvas、噪声函数、粒子系统
2. **前端工程** —— Astro、TypeScript、构建工具链
3. **算法笔记** —— 刷题心得与数据结构
4. **折腾记录** —— 每一次踩坑与爬坑

## 一段测试代码

顺便验证一下代码高亮和复制按钮：

```ts
interface Post {
  title: string;
  tags: string[];
}

function greet(post: Post): string {
  return `《${post.title}》 已发布，标签：${post.tags.join('、')}`;
}

console.log(greet({ title: '你好，世界', tags: ['随笔'] }));
```

## 订阅方式

- RSS：<https://example.com/rss.xml>
- 或者隔段时间直接来逛逛，这里更新不快，但每篇都是认真写的。

欢迎来到我的数字花园。
