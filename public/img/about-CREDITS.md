# 首页配图出处与版权

首页「关于我们」的 2×2 拼贴共四张图，**全部来自 NASA 图片库，属于公有领域**（美国联邦政府作品，不受版权保护），可自由使用、修改与再分发，无需授权也无需付费。

参考：[NASA 媒体使用指南](https://www.nasa.gov/nasa-brand-center/images-and-media/)

| 文件 | 标题 | 来源 | 说明页 |
|---|---|---|---|
| `about-1.jpg` | Space Radar Image of Weddell Sea | JPL | https://images.nasa.gov/details-PIA01802 |
| `about-2.jpg` | Space Radar Image of Mammoth, California in 3-D | JPL | https://images.nasa.gov/details-PIA01718 |
| `about-3.jpg` | Robonaut 2 Humanoid Robot | JSC | https://images.nasa.gov/details-iss030e135157 |
| `about-4.jpg` | Earth Observations taken by the Expedition Seven crew | JSC | https://images.nasa.gov/details-iss007e10960 |

## 四格分别对应哪个研究方向

四格是**按实验室的四个研究方向一一对应**挑的，顺序与研究方向页一致：

| 格 | 对应方向 | 影像与理由 |
|---|---|---|
| 1 | **① 多源数据智能分析** | 韦德尔海（南极）三频假彩色 SAR。SIR-C/X-SAR 用 X/C/L 三个波段同时对同一片海冰成像再合成，本身就是「多源数据融合」的直观例子 |
| 2 | **② 四维场景生成理解** | SIR-C 对加州 Mammoth 地区的三维透视成像，带明显景深 —— 对应方向里的三维重建与场景理解 |
| 3 | **③ 具身智能与智能体** | 国际空间站上的 Robonaut 2 人形机器人 |
| 4 | **④ 遥感目标智能感知** | 轨道拍摄的沿海城市白天光学影像，港口、机场跑道、农田等「目标」清晰可辨 |

## 重新生成

```bash
node _tools/fetch-candidates.mjs     # 从 NASA 下载原始素材到 _candidates/
python _tools/build-about-images.py  # 裁成 4:3、压缩
```

裁切参数写在 `build-about-images.py` 的 `STATIC` 列表里。**用显式裁切框而不是自动居中裁**，
因为这几张原图各有各的干扰：SAR 那张有黑边、顶部元数据条和右上角插图，
SIR-C 三维图上方一大片纯蓝天，鱼眼机器人照片四角是黑的。

`_candidates/` 只是中间文件，随时可以删；上面的命令会重新拉取。

## 关于第一格的动态效果

早先第一格是两张拉斯维加斯影像交叉淡入，用来表现「随时间变化」。这一轮四格都要
各自对应一个方向，凑不出同一场景的两个状态，所以改成静态图。
机制仍在：给 `site.ts` 的某一格填上 `srcAlt`，`.collage-fade` 就会自动生效（实现见 `src/styles/global.css`）。

本文件由 `_tools/build-about-images.py` 自动生成，换图后会一起更新。
