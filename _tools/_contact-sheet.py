"""
把候选缩略图拼成带编号的拼版图，便于一次评估所有构图。
编号与 _candidates/thumbs/meta.json 的顺序一致。

用法：
    python _tools/_contact-sheet.py                       # 全部，5 列
    python _tools/_contact-sheet.py 3 1,4,24,25 放大看     # 只拼指定编号，3 列，另存一个文件
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
THUMBS = ROOT / "_candidates" / "thumbs"

COLS = int(sys.argv[1]) if len(sys.argv) > 1 else 5
PICK = [int(x) for x in sys.argv[2].split(",")] if len(sys.argv) > 2 and sys.argv[2] else None
NAME = sys.argv[3] if len(sys.argv) > 3 else "contact-sheet"

all_files = sorted(THUMBS.glob("*.jpg"))
files = [all_files[i - 1] for i in PICK] if PICK else all_files

OUT = ROOT / "_candidates" / f"{NAME}.jpg"
CELL_W = 300 if not PICK else 520
LABEL_H = 26

if not files:
    raise SystemExit("没有缩略图，先跑 node _tools/_fetch-thumbs.mjs")

try:
    font = ImageFont.load_default(size=20 if not PICK else 26)
except TypeError:  # 老版本 Pillow 不支持 size 参数
    font = ImageFont.load_default()


def thumb(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB")
    im.thumbnail((CELL_W, CELL_W), Image.LANCZOS)
    return im


rows = (len(files) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CELL_W, rows * (CELL_W + LABEL_H)), (20, 24, 34))
draw = ImageDraw.Draw(sheet)

for idx, path in enumerate(files, 1):
    im = thumb(path)
    r, c = divmod(idx - 1, COLS)
    x = c * CELL_W
    y = r * (CELL_W + LABEL_H)

    # 居中放置，深色底补边
    sheet.paste(im, (x + (CELL_W - im.width) // 2, y + (CELL_W - im.height) // 2))

    orig = all_files.index(path) + 1
    label = f"{orig:>2}  {path.stem.split('-', 1)[1][:34]}"
    draw.rectangle([x, y + CELL_W, x + CELL_W, y + CELL_W + LABEL_H], fill=(12, 16, 24))
    draw.text((x + 6, y + CELL_W + 3), label, fill=(180, 220, 255), font=font)

sheet.save(OUT, quality=88)
print(f"拼版图：{OUT}")
print(f"共 {len(files)} 张，{COLS} 列 × {rows} 行，编号 {[all_files.index(p) + 1 for p in files]}")