"""
压缩 public/og-image.png。
分享图是大面积渐变 + 少量文字，量化到 128 色后视觉上几乎无差别，体积能小一大截。
在重新生成分享图之后跑一次即可。

用法：python _tools/optimize-og.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "public" / "og-image.png"

if not TARGET.exists():
    raise SystemExit(f"找不到 {TARGET}")

before = TARGET.stat().st_size
img = Image.open(TARGET).convert("RGB")

# 用中位切分量化到 128 色，再以 PNG 调色板模式保存
quantized = img.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
quantized.save(TARGET, optimize=True)

after = TARGET.stat().st_size
print(f"og-image.png  {before / 1024:.0f} KB → {after / 1024:.0f} KB  ({img.size[0]}×{img.size[1]})")