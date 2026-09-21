# 研究方向配图 —— 出处与版权

四个方向的配图**全部取自实验室自己论文里的框架图**（不是自绘示意图）。
三篇发表在 MDPI《Remote Sensing》，属于 **CC BY 4.0** 开放获取，署名即可自由使用；
第 ① 篇用的是 arXiv 版本（**CC BY-NC-SA 4.0**，允许非商业使用），见下方说明。

| 方向 | 论文 | 出处 | 许可 |
|---|---|---|---|
| `multi-source` | *Lightweight RGB-D Salient Object Detection from a Speed-Accuracy Tradeoff Perspective* — Songsong Duan, Xi Yang, Nannan Wang, Xinbo Gao | IEEE TIP 2025（arXiv:2505.04758 版本，Fig. 2）<br>[原文](https://arxiv.org/abs/2505.04758) | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) |
| `4d-scene` | *3D Point Cloud Shape Generation with Collaborative Learning of Generative Adversarial Network and Auto-Encoder* — （实验室论文，见 Remote Sensing 16(10): 1772） | Remote Sensing 2024, 16(10), 1772（Fig. 2）<br>[原文](https://www.mdpi.com/2072-4292/16/10/1772) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `embodied` | *Adaptive Granularity-Fused Keypoint Detection for 6D Pose Estimation of Space Targets* — （实验室论文，见 Remote Sensing 16(22): 4138） | Remote Sensing 2024, 16(22), 4138（Fig. 2）<br>[原文](https://www.mdpi.com/2072-4292/16/22/4138) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `remote-sensing` | *Coastal Ship Tracking with Memory-Guided Perceptual Network* — （实验室论文，见 Remote Sensing 15(12): 3150） | Remote Sensing 2023, 15(12), 3150（Fig. 2）<br>[原文](https://www.mdpi.com/2072-4292/15/12/3150) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

## 关于第 ① 篇的许可

「多源数据智能分析」用的是 *Lightweight RGB-D Salient Object Detection from a Speed-Accuracy Tradeoff Perspective*（IEEE TIP 2025）**arXiv 版本**的 Fig. 2。
arXiv 上该文的许可是 **CC BY-NC-SA 4.0**：允许非商业使用、必须署名、衍生作品需以相同方式共享。
实验室主页属于非商业用途，符合要求，但更稳妥的做法是：

1. 换成 IEEE TIP 正式版插图（**作者本人对自己论文的插图通常有使用权**），或
2. 换成另一篇 **CC BY 4.0** 论文的框架图。

## 重新生成

```bash
# MDPI 的那三张（自动按文章号拼 URL 下载）
node _tools/fetch-paper-figs.mjs
# 裁剪白边、缩放、压缩，并生成本文件
python _tools/build-research-figures.py
```

> 想换成别的论文插图：把新图放到 `public/img/research/<方向id>.png` 覆盖即可，
> 代码不用动（`src/data/research.ts` 里的 `image` 字段指向这些文件名）。

本文件由 `_tools/build-research-figures.py` 生成。
