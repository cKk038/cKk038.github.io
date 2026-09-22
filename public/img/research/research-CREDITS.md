# 研究方向配图说明

研究方向页的四张配图（`multi-source.svg` / `4d-scene.svg` / `embodied.svg` /
`remote-sensing.svg`）**是本项目自绘的矢量示意图**，由
[`_tools/build-research-diagrams.mjs`](../../_tools/build-research-diagrams.mjs) 生成。

因此：

- 不涉及任何第三方图片版权，不需要署名，也不需要 CC 授权声明；
- 配色取自站点的设计令牌（品牌蓝 `#2E9BD6`、海军蓝 `#0E1F38`），与页面风格一致；
- 是 SVG 矢量图，点开放大不会糊；
- 其中三张带动画（CSS 关键帧），并遵循系统的「减少动态效果」设置自动静止。

## 为什么不用论文里的 framework 图

早先这四格用的是实验室自己论文里的框架图（3 张 MDPI《Remote Sensing》CC BY 4.0、
1 张 arXiv 版 CC BY-NC-SA 4.0）。换成自绘图的原因：

- 论文插图是为某个具体方法服务的，缩到卡片宽度后小字全糊，读不出内容；
- 那种图讲的是「某一篇论文怎么做」，跟「这个方向在研究什么」不是一回事；
- 自绘图可以说清方向的结构（输入、融合、输出），且不受任何授权限制。

> 旧的论文配图与其授权记录在本仓库的 git 历史里（2026-09 之前的提交），
> 如果将来要回退，从历史中取回即可。

## 重新生成

```bash
node _tools/build-research-diagrams.mjs          # 生成四张 SVG 到 public/img/research/
node _tools/_preview-diagrams.mjs                # 可选：拼成一张预览页，便于肉眼检查
```

改图只需要改生成脚本里的坐标与文案，不要直接编辑 `.svg` —— 它们是生成产物，
下次运行脚本会被覆盖。

本文件由 `_tools/build-research-diagrams.mjs` 自动生成。
