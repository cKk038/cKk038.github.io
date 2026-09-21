# 首页配图出处与版权

首页「关于我们」的 2×2 拼贴共五张图（第一格是两张交替），**全部来自 NASA 图片库，属于公有领域**（美国联邦政府作品，不受版权保护），可自由使用、修改与再分发，无需授权也无需付费。

参考：[NASA 媒体使用指南](https://www.nasa.gov/nasa-brand-center/images-and-media/)

| 文件 | 类型 | 标题 | 来源 | 说明页 |
|---|---|---|---|---|
| `about-2.jpg` | 静态 | Three frequency false color image of Flevoland, the Netherlands | JSC | https://images.nasa.gov/details-sts059-s-086 |
| `about-3.jpg` | 静态 | Robonaut 2 Humanoid Robot | JSC | https://images.nasa.gov/details-iss030e148256 |
| `about-4.jpg` | 静态 | Landsat View: Tokyo, Japan | GSFC | https://images.nasa.gov/details-GSFC_20171208_Archive_e001701 |
| `about-1a.jpg` | 动态（交叉淡入） | Landsat View: Las Vegas, Nevada | GSFC | https://images.nasa.gov/details-GSFC_20171208_Archive_e001700 |
| `about-1b.jpg` | 动态（交叉淡入） | Landsat View: Las Vegas, Nevada | GSFC | https://images.nasa.gov/details-GSFC_20171208_Archive_e001700 |

## 四格分别对应哪个研究方向

四格是**按实验室的四个研究方向一一对应**挑的，不是随便找四张遥感图：

| 格 | 对应方向 | 影像 |
|---|---|---|
| 1 | **四维场景生成理解** | 拉斯维加斯 1984 / 2010 两期 Landsat 影像（`about-1a/b`），同一场景随时间的演化 —— 前端用 CSS 交叉淡入淡出呈现 |
| 2 | **多源数据智能分析** | 荷兰 Flevoland 三频（X/C/L 波段）假彩色 SAR（`about-2`），三个雷达频段合成，本身就是「多源数据」的直观例子 |
| 3 | **具身智能与智能体** | 国际空间站上的 Robonaut 2 人形机器人（`about-3`） |
| 4 | **遥感目标智能感知** | 东京与东京湾的 Landsat 影像（`about-4`），城市与港口设施等地物清晰可辨 |

## 重新生成

```bash
node _tools/fetch-candidates.mjs     # 从 NASA 下载原始素材到 _candidates/
python _tools/build-about-images.py  # 裁成 4:3、压缩、加年份角标
```

裁切参数写在 `build-about-images.py` 的 `STATIC` 列表里：有几张原图带元数据条或黑边（Flevoland 顶部就有一整条），有的是上下两期对照（拉斯维加斯、东京），所以用显式裁切框而不是自动居中裁。

`_candidates/` 只是中间文件，随时可以删；上面的命令会重新拉取。

本文件由 `_tools/build-about-images.py` 自动生成，换图后会一起更新。
