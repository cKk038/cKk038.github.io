"""
处理四个研究方向的配图 —— 全部取自实验室自己论文里的框架图
================================================================================
四个方向 → 四篇论文 → 四个框架图：

  ① 多源数据智能分析      SATNet (RGB-D 显著性目标检测)         arXiv:2505.04758 Fig.2
  ② 四维场景生成理解      3D 点云形状生成（GAN + Auto-Encoder）  Remote Sensing 2024 Fig.2
  ③ 具身智能与智能体      空间目标 6D 位姿估计（关键点检测）      Remote Sensing 2024 Fig.2
  ④ 遥感目标智能感知      近岸船舶跟踪（记忆引导感知网络）        Remote Sensing 2023 Fig.2

许可说明（重要）：
  · 三篇 Remote Sensing 是 MDPI 出版，**CC BY 4.0**，只需署名即可自由使用，包括商用。
  · 第 ① 篇的 arXiv 版本是 **CC BY-NC-SA 4.0**，允许非商业使用 + 署名 + 相同方式共享。
    实验室主页属于非商业用途，但仍建议后续换成 IEEE TIP 正式版插图（作者本人有权使用）。
    许可信息写进 public/img/research-CREDITS.md。

用法：python _tools/build-research-figures.py
"""
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SRC_DIRS = [ROOT / "_paper-figs", ROOT / "public" / "img" / "research"]
OUT = ROOT / "public" / "img" / "research"

MAX_W = 1400  # 卡片里显示约 500px，1400 够 2x 屏

# id → (源文件, 输出文件, 论文信息)
ITEMS = [
    {
        "id": "multi-source",
        "src": "_paper-figs/multi-source-relnet.png",
        "out": "multi-source.png",
        "paper": "Lightweight RGB-D Salient Object Detection from a Speed-Accuracy Tradeoff Perspective",
        "authors": "Songsong Duan, Xi Yang, Nannan Wang, Xinbo Gao",
        "venue": "IEEE TIP 2025（arXiv:2505.04758 版本，Fig. 2）",
        "license": "CC BY-NC-SA 4.0",
        "licUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "source": "https://arxiv.org/abs/2505.04758",
    },
    {
        "id": "4d-scene",
        "src": "_paper-figs/fourd-g002.png",
        "out": "4d-scene.png",
        "paper": "3D Point Cloud Shape Generation with Collaborative Learning of Generative Adversarial Network and Auto-Encoder",
        "authors": "（实验室论文，见 Remote Sensing 16(10): 1772）",
        "venue": "Remote Sensing 2024, 16(10), 1772（Fig. 2）",
        "license": "CC BY 4.0",
        "licUrl": "https://creativecommons.org/licenses/by/4.0/",
        "source": "https://www.mdpi.com/2072-4292/16/10/1772",
    },
    {
        "id": "embodied",
        "src": "_paper-figs/embodied-g002.png",
        "out": "embodied.png",
        "paper": "Adaptive Granularity-Fused Keypoint Detection for 6D Pose Estimation of Space Targets",
        "authors": "（实验室论文，见 Remote Sensing 16(22): 4138）",
        "venue": "Remote Sensing 2024, 16(22), 4138（Fig. 2）",
        "license": "CC BY 4.0",
        "licUrl": "https://creativecommons.org/licenses/by/4.0/",
        "source": "https://www.mdpi.com/2072-4292/16/22/4138",
    },
    {
        "id": "remote-sensing",
        "src": "_paper-figs/remote-g002.png",
        "out": "remote-sensing.png",
        "paper": "Coastal Ship Tracking with Memory-Guided Perceptual Network",
        "authors": "（实验室论文，见 Remote Sensing 15(12): 3150）",
        "venue": "Remote Sensing 2023, 15(12), 3150（Fig. 2）",
        "license": "CC BY 4.0",
        "licUrl": "https://creativecommons.org/licenses/by/4.0/",
        "source": "https://www.mdpi.com/2072-4292/15/12/3150",
    },
]


def trim_white(im: Image.Image, tol: int = 244) -> Image.Image:
    """去掉四周的白边（论文插图导出时常带大片空白）。"""
    rgb = im.convert("RGB")
    bg = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, bg).convert("L").point(lambda v: 255 if v > 255 - tol else 0)
    bbox = diff.getbbox()
    return im.crop(bbox) if bbox else im


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    lines = [
        "# 研究方向配图 —— 出处与版权",
        "",
        "四个方向的配图**全部取自实验室自己论文里的框架图**（不是自绘示意图）。",
        "三篇发表在 MDPI《Remote Sensing》，属于 **CC BY 4.0** 开放获取，署名即可自由使用；",
        "第 ① 篇用的是 arXiv 版本（**CC BY-NC-SA 4.0**，允许非商业使用），见下方说明。",
        "",
        "| 方向 | 论文 | 出处 | 许可 |",
        "|---|---|---|---|",
    ]

    for it in ITEMS:
        src = ROOT / it["src"] if not it["src"].startswith("_paper-figs") else ROOT / it["src"]
        if not src.exists():
            print(f"✗ 缺源文件 {it['src']}")
            lines.append(f"| {it['id']} | {it['paper'][:60]} | ⚠ 源文件缺失 | — |")
            continue

        im = Image.open(src).convert("RGB")
        before = im.size
        im = trim_white(im)
        if im.width > MAX_W:
            h = round(im.height * MAX_W / im.width)
            im = im.resize((MAX_W, h), Image.LANCZOS)

        dst = OUT / it["out"]
        # 插图是大片白底 + 细线条，PNG 无损更清晰；超过 700KB 就退回 JPEG
        im.save(dst, "PNG", optimize=True)
        if dst.stat().st_size > 700 * 1024:
            dst = OUT / it["out"].replace(".png", ".jpg")
            im.save(dst, "JPEG", quality=88, optimize=True, progressive=True)
            (OUT / it["out"]).unlink(missing_ok=True)
            it["out"] = dst.name

        print(f"✓ {it['out']:20s} {before} → {im.size}  {dst.stat().st_size // 1024} KB")
        lines.append(
            f"| `{it['id']}` | *{it['paper']}* — {it['authors']} | {it['venue']}<br>[原文]({it['source']}) | [{it['license']}]({it['licUrl']}) |"
        )

    lines += [
        "",
        "## 关于第 ① 篇的许可",
        "",
        "「多源数据智能分析」用的是 *Lightweight RGB-D Salient Object Detection from a "
        "Speed-Accuracy Tradeoff Perspective*（IEEE TIP 2025）**arXiv 版本**的 Fig. 2。",
        "arXiv 上该文的许可是 **CC BY-NC-SA 4.0**：允许非商业使用、必须署名、衍生作品需以相同方式共享。",
        "实验室主页属于非商业用途，符合要求，但更稳妥的做法是：",
        "",
        "1. 换成 IEEE TIP 正式版插图（**作者本人对自己论文的插图通常有使用权**），或",
        "2. 换成另一篇 **CC BY 4.0** 论文的框架图。",
        "",
        "## 重新生成",
        "",
        "```bash",
        "# MDPI 的那三张（自动按文章号拼 URL 下载）",
        "node _tools/fetch-paper-figs.mjs",
        "# 裁剪白边、缩放、压缩，并生成本文件",
        "python _tools/build-research-figures.py",
        "```",
        "",
        "> 想换成别的论文插图：把新图放到 `public/img/research/<方向id>.png` 覆盖即可，",
        "> 代码不用动（`src/data/research.ts` 里的 `image` 字段指向这些文件名）。",
        "",
        "本文件由 `_tools/build-research-figures.py` 生成。",
    ]
    (OUT / "research-CREDITS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n版权说明写入 public/img/research/research-CREDITS.md")


if __name__ == "__main__":
    main()