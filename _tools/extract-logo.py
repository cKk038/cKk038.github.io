"""
从 docs/brand/XI-Lab_logo.pdf 的最后一页提取 XI 标志，产出站点用的全部品牌图片。

一条命令搞定：
    python _tools/extract-logo.py

需要 pdftocairo（Poppler / MiKTeX / TeX Live 自带，跑 `where pdftocairo` 能查到即可）。

────────────────────────────────────────────────────────────────────────
原理
PDF 第 18 页里，标志是扁平的品牌蓝 (#2E9BD6) 画在扁平的深海军蓝 (#0E1F38) 底上。
所以可以用绿色通道当作 alpha 的键（navy G=31，blue G=155），再把颜色反预乘回去，
就能得到边缘干净的透明底标志 —— 比阈值抠图干净得多，也比截图重绘更保真。

裁剪区域 CROP 是量出来的：第 18 页 MediaBox 为 960×411 pt，标志占据
x 114.9~234.9 pt、y 106.5~226.5 pt（即左上角 114.9,106.5，边长 120pt 的正方形，
标志四周留了一点白）。改了 logo 文件的话，用 pdftoppm 渲染整页、
量一下标志的像素范围再换算成点即可。
────────────────────────────────────────────────────────────────────────
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "docs" / "brand" / "XI-Lab_logo.pdf"
PUBLIC = ROOT / "public"

# ── 从 PDF 里读取的参数 ─────────────────────────────────────────
PDF_PAGE = 18          # 用最后一页的 lockup
DPI = 900              # 900 DPI 下标志约 1500px，缩到导航栏 52px 绰绰有余
CROP = dict(x=1436, y=1331, w=1500, h=1500)   # 像素，@900dpi

# ── 品牌色（PDF 用 CMYK 百分比，这里换算成 0-255） ──────────────
BG = np.array([14, 31, 56], dtype=np.float64)      # #0E1F38 深海军蓝
FG = np.array([46, 155, 214], dtype=np.float64)    # #2E9BD6 品牌蓝
NAVY = (14, 31, 56)


def render_page() -> Path:
    """用 pdftocairo 把标志所在区域渲染成高分辨率 PNG。"""
    if shutil.which("pdftocairo") is None:
        sys.exit("找不到 pdftocairo。装了 MiKTeX / TeX Live / Poppler 之后它在 PATH 里。")
    if not PDF.exists():
        sys.exit(f"找不到 {PDF}")

    tmp = Path(tempfile.mkdtemp(prefix="xilab-logo-"))
    out = tmp / "mark"
    cmd = [
        "pdftocairo", "-png", "-r", str(DPI),
        "-f", str(PDF_PAGE), "-l", str(PDF_PAGE),
        "-x", str(CROP["x"]), "-y", str(CROP["y"]),
        "-W", str(CROP["w"]), "-H", str(CROP["h"]),
        str(PDF), str(out),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    produced = sorted(tmp.glob("mark*.png"))
    if not produced:
        sys.exit("pdftocairo 没有输出文件，检查裁剪参数是否超出页面范围")
    return produced[0]


def keyed_transparent(path: Path) -> Image.Image:
    """用绿色通道做键把深色底换成透明，并反预乘恢复真实颜色。"""
    arr = np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)

    alpha = np.clip((arr[:, :, 1] - BG[1]) / (FG[1] - BG[1]), 0.0, 1.0)
    safe = np.maximum(alpha, 1e-6)[:, :, None]
    unmixed = np.clip((arr - (1.0 - alpha)[:, :, None] * BG[None, None, :]) / safe, 0, 255)

    out = np.zeros((*arr.shape[:2], 4), dtype=np.uint8)
    out[:, :, :3] = unmixed.round().astype(np.uint8)
    out[:, :, 3] = (alpha * 255).round().astype(np.uint8)
    out[alpha < 0.06] = 0        # 反预乘在极低 alpha 处会放大噪声，那部分直接全透明
    return Image.fromarray(out, "RGBA")


def trim(img: Image.Image, pad_ratio: float = 0.02) -> Image.Image:
    """裁到不透明内容边界，四周留一点内边距。"""
    bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox is None:
        sys.exit("没有找到不透明像素 —— 裁剪区域或品牌色可能对不上")
    img = img.crop(bbox)
    pad = int(max(img.size) * pad_ratio)
    canvas = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad), img)
    return canvas


def to_square(img: Image.Image, size: int, pad_ratio: float) -> Image.Image:
    """放进正方形画布正中，四周留白。"""
    inner = int(size * (1 - pad_ratio * 2))
    scale = min(inner / img.width, inner / img.height)
    resized = img.resize(
        (max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS
    )
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(resized, ((size - resized.width) // 2, (size - resized.height) // 2), resized)
    return out


def dark_icon(mark: Image.Image, size: int) -> Image.Image:
    """深色圆角方块 + 标志，用于 favicon / apple-touch-icon。"""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(canvas).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=NAVY + (255,)
    )
    inner = int(size * 0.62)
    scale = min(inner / mark.width, inner / mark.height)
    resized = mark.resize(
        (max(1, round(mark.width * scale)), max(1, round(mark.height * scale))), Image.LANCZOS
    )
    canvas.paste(resized, ((size - resized.width) // 2, (size - resized.height) // 2), resized)
    return canvas


def main() -> None:
    rendered = render_page()
    mark = trim(keyed_transparent(rendered))
    print(f"标志内容区: {mark.size[0]}×{mark.size[1]}  (宽高比 {mark.width / mark.height:.3f})")

    (PUBLIC / "img").mkdir(parents=True, exist_ok=True)

    to_square(mark, 512, pad_ratio=0.06).save(PUBLIC / "logo.png", optimize=True)
    print("✓ public/logo.png             512×512  透明底，导航栏/页脚用")

    dark_icon(mark, 256).save(PUBLIC / "favicon.png", optimize=True)
    print("✓ public/favicon.png          256×256  深色圆角方块")

    dark_icon(mark, 180).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    print("✓ public/apple-touch-icon.png 180×180  iOS 主屏图标")

    mark.save(PUBLIC / "img" / "brand-mark.png", optimize=True)
    print(f"✓ public/img/brand-mark.png   {mark.size[0]}×{mark.size[1]}  纯标志大图")

    print("\n生成完毕。分享图（og-image.png）另外渲染：见 README 的「换 logo 和图片」一节。")


if __name__ == "__main__":
    main()