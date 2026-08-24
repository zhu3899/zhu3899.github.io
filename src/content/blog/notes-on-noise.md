---
title: 流场笔记：柏林噪声到底在算什么
description: 把 Perlin Noise 拆开揉碎：梯度、插值、fade 曲线，以及为什么它看起来那么「自然」。
pubDate: 2026-08-23
tags: [生成艺术, 数学]
---

## 背景

上一篇文章[《这篇文章的封面，是代码画的》](/blog/code-as-art/)里反复出现 `noise(x, y)`，它就是 **Perlin Noise**（柏林噪声）。Ken Perlin 在 1983 年为电影《Tron》制作特效时发明了它，后来凭此拿了奥斯卡技术成就奖。

## 目标性质

我们想要一个函数 `noise(x, y)`，满足：

- **连续平滑**：相邻输入的输出值接近，且一阶导数连续（不然画面会出现折角）
- **伪随机**：整体看起来无规律
- **可复现**：同一输入永远返回同一输出
- **有界**：输出落在 [-1, 1]

## 算法拆解

### 第一步：打乱网格

把整数格点 `[0..255]` 排列成一个随机置换表 `perm`，查询时对坐标取模映射进去：

```ts
const X = Math.floor(x) & 255;
const Y = Math.floor(y) & 255;
```

### 第二步：梯度点积

每个格点预先藏了一个梯度向量（这里用 8 方向），把「格点梯度」与「格点到当前点的距离向量」做点积，得到该格点对当前点的贡献值：

```ts
grad(hash, x, y)
// hash 决定方向，(x, y) 是格内相对坐标
```

### 第三步：平滑插值

四个角的贡献值按权重融合，但权重不是线性插值，而是经过 **fade 曲线**处理：

```ts
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
// 即 6t⁵ - 15t⁴ + 10t³，二阶导在端点为 0
```

这一步是平滑的关键：线性插值的导数在格点处不为零，视觉上会有「网格感」；五次多项式的二阶导数为零，噪声才真正丝滑。

## 直观验证

频率参数 `s` 越大，单位面积内的「涡旋」越多：

| 频率 s | 视觉效果 |
| ------ | -------- |
| 0.001  | 大尺度舒展的流线，接近丝绸 |
| 0.005  | 中等涡旋，最常见的艺术参数区间 |
| 0.02   | 细密卷曲，接近毛发质感 |

## 分形叠加（fBm）

单一频率的噪声还是有点「塑料」。把多个倍频程的噪声加权求和，就能得到更自然的细节：

```ts
function fbm(noise, x, y, octaves = 4) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / total;
}
```

这就是地形生成、云雾特效、程序化纹理的地基。

## 参考资料

- Ken Perlin, *An Image Synthesizer* (SIGGRAPH 1985)
- Adrian Biagioli, *Perlin Noise* 在线教程
- Inigo Quilez 的噪声函数合集

> 数学的美在于它总能用几行公式描述整个世界的一小片 —— 比如一张博客封面。
