"""
首页 2×2 配图生产脚本
================================================================================
素材全部来自 NASA 图片库（images-api.nasa.gov），属于美国联邦政府作品，
**公有领域**，可自由使用（NASA 媒体使用指南：https://www.nasa.gov/nasa-brand-center/images-and-media/）。
出处与 NASA ID 记录在 public/img/about-CREDITS.md。

产出五张（对应 src/config/site.ts 的 aboutImages）：
  about-1a.jpg  ┐ 拉斯维加斯 1984 / 2010 两期影像，前端用 CSS 交叉淡入淡出做成动态效果
  about-1b.jpg  ┘
  about-2.jpg   PIA03367  哥斯达黎加三维地形透视 + Landsat 影像叠加
  about-3.jpg   PIA02727  夏威夷瓦胡岛三维地形透视
  about-4.jpg   夜间灯光（南美大西洋沿岸），数据可视化风格

动态效果为什么用「两张图 + CSS 交叉淡入」而不是动图（GIF / 动态 WebP）：
同样效果下，两张 JPEG 一共约 120 KB，而 12 帧的动态 WebP 要 593 KB —— 大 5 倍，
而且 CSS 过渡更平滑、能跟随 prefers-reduced-motion 自动关掉。用叠化而不是闪烁对比，
是因为闪烁虽然对变化检测更敏感，但会干扰旁边正文的阅读。

用法：python _tools/build-about-images.py
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CAND = ROOT / "_candidates"
OUT = ROOT / "public" / "img"

COLLAGE_W, COLLAGE_H = 640, 480  # 4:3

# 元信息（标题/机构/日期）由 fetch-candidates.mjs 写入，版权说明据此生成
SOURCES = {}
sources_file = CAND / "sources.json"
if sources_file.exists():
    for s in json.loads(sources_file.read_text(encoding="utf-8")):
        SOURCES[s["id"]] = s


def meta(nasa_id: str) -> dict:
    return SOURCES.get(nasa_id, {"id": nasa_id, "title": "", "center": "NASA", "page": ""})


STATIC = [
    # ① 多源数据智能分析：Flevoland 三频假彩色 SAR。
    # 原图顶部有元数据条、四周有黑边，用显式裁切框切掉。
    {"src": "sts059-s-086.jpg", "out": "about-2.jpg", "crop": (60, 430, 953, 1100)},
    # ③ 具身智能与智能体：Robonaut 2 人形机器人。原图 1280×850 正好偏宽，
    # 裁掉左右一点就是标准 4:3，并把机器人本体留在中间。
    {"src": "iss030e148256.jpg", "out": "about-3.jpg", "crop": (120, 0, 1253, 850)},
    # ④ 遥感目标智能感知：Landsat 东京影像。原图是上下两期对照，
    # 只保留下面那一期（y 560 以下），再按 4:3 取中间。
    {"src": "GSFC_20171208_Archive_e001701.jpg", "out": "about-4.jpg", "crop": (117, 560, 862, 1111)},
]


def crop_4x3(im: Image.Image, focus: float = 0.5) -> Image.Image:
    """按 4:3 裁切；focus 决定在垂直方向偏上还是偏下保留。"""
    w, h = im.size
    target_h = round(w * 3 / 4)
    if target_h <= h:
        top = round((h - target_h) * focus)
        return im.crop((0, top, w, top + target_h))
    # 图太扁：按高度定宽
    target_w = round(h * 4 / 3)
    left = round((w - target_w) / 2)
    return im.crop((left, 0, left + target_w, h))


def resize_to_4x3(im: Image.Image, w: int, h: int) -> Image.Image:
    """按 4:3 目标比例微调裁切后再缩放（允许 1% 内的比例误差）。"""
    target = w / h
    ratio = im.width / im.height
    if abs(ratio - target) > 0.01:
        if ratio > target:
            new_w = round(im.height * target)
            left = round((im.width - new_w) / 2)
            im = im.crop((left, 0, left + new_w, im.height))
        else:
            new_h = round(im.width / target)
            top = round((im.height - new_h) / 2)
            im = im.crop((0, top, im.width, top + new_h))
    return im.resize((w, h), Image.LANCZOS)


def find_panel_split(im: Image.Image) -> int:
    """找出上下两个年份面板之间的分隔行（一行接近纯白、且很均匀）。"""
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    best, best_score = h // 2, -1
    for y in range(int(h * 0.3), int(h * 0.7)):
        vals = [px[x, y] for x in range(0, w, 4)]
        mean = sum(vals) / len(vals)
        var = sum((v - mean) ** 2 for v in vals) / len(vals)
        score = mean - var ** 0.5 * 2  # 又亮又平
        if score > best_score:
            best, best_score = y, score
    return best


def load_font(size: int):
    for name in ("arialbd.ttf", "arial.ttf", "segoeuib.ttf"):
        p = Path("C:/Windows/Fonts") / name
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except Exception:
                pass
    return ImageFont.load_default()


def badge(im: Image.Image, label: str) -> Image.Image:
    """左下角加一个半透明年份标签。"""
    im = im.convert("RGB")
    d = ImageDraw.Draw(im, "RGBA")
    font = load_font(34)
    pad = 12
    box = d.textbbox((0, 0), label, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    x, y = 18, im.height - th - 18 - pad
    d.rounded_rectangle([x, y, x + tw + pad * 2, y + th + pad * 2], radius=6, fill=(14, 31, 56, 190))
    d.text((x + pad, y + pad - box[1]), label, font=font, fill=(255, 255, 255, 255))
    return im


def main() -> None:
    credits = []

    # ── 三张静态图 ──────────────────────────────────────────────
    for item in STATIC:
        src = CAND / item["src"]
        im = Image.open(src).convert("RGB")
        if item.get("crop"):
            im = im.crop(item["crop"])  # 显式裁切框（源图像素坐标）
        else:
            im = crop_4x3(im, item.get("focus", 0.5))
        im = resize_to_4x3(im, COLLAGE_W, COLLAGE_H)
        dst = OUT / item["out"]
        im.save(dst, "JPEG", quality=80, optimize=True, progressive=True)
        m = meta(item["src"].replace(".jpg", ""))
        credits.append({**m, "file": item["out"], "kind": "static"})
        print(f"✓ {item['out']:14s} {im.size[0]}x{im.size[1]}  {dst.stat().st_size // 1024} KB   {m['title']}")

    # ── 动态图：拉斯维加斯 1984 → 2010 ───────────────────────────
    src = CAND / "GSFC_20171208_Archive_e001700.jpg"
    full = Image.open(src).convert("RGB")
    split = find_panel_split(full)
    print(f"\n面板分隔行：y={split}（全图 {full.width}x{full.height}）")

    top = full.crop((0, 0, full.width, split))
    bottom = full.crop((0, split, full.width, full.height))

    # 两块按同一 4:3 窗口裁切，保证叠化时地物对齐
    def aligned(panel: Image.Image) -> Image.Image:
        h = min(panel.height, round(panel.width * 3 / 4))
        top_off = max(0, panel.height - h - 4)  # 略微下移，避开面板自带的地名标注
        return panel.crop((0, top_off, panel.width, top_off + h))

    a = aligned(top).resize((COLLAGE_W, COLLAGE_H), Image.LANCZOS)
    b = aligned(bottom).resize((COLLAGE_W, COLLAGE_H), Image.LANCZOS)
    a = badge(a, "1984")
    b = badge(b, "2010")

    # 输出成两张 JPEG：前端叠在一起，用 CSS 交叉淡入淡出（见 global.css 的 .collage-fade）
    m = meta("GSFC_20171208_Archive_e001700")
    for name, frame in (("about-1a.jpg", a), ("about-1b.jpg", b)):
        dst = OUT / name
        frame.save(dst, "JPEG", quality=80, optimize=True, progressive=True)
        print(f"✓ {name:14s} {frame.size[0]}x{frame.size[1]}  {dst.stat().st_size // 1024} KB")
        credits.append({**m, "file": name, "kind": "animated"})
    print("  两张合起来即「城市扩张」交叉淡入效果")

    (OUT / "about-CREDITS.md").write_text(render_credits(credits), encoding="utf-8")
    print(f"\n版权与出处说明写入 public/img/about-CREDITS.md")


def render_credits(credits) -> str:
    lines = [
        "# 首页配图出处与版权",
        "",
        "首页「关于我们」的 2×2 拼贴共五张图（第一格是两张交替），"
        "**全部来自 NASA 图片库，属于公有领域**（美国联邦政府作品，不受版权保护），"
        "可自由使用、修改与再分发，无需授权也无需付费。",
        "",
        "参考：[NASA 媒体使用指南](https://www.nasa.gov/nasa-brand-center/images-and-media/)",
        "",
        "| 文件 | 类型 | 标题 | 来源 | 说明页 |",
        "|---|---|---|---|---|",
    ]
    for c in credits:
        kind = "动态（交叉淡入）" if c["kind"] == "animated" else "静态"
        lines.append(f"| `{c['file']}` | {kind} | {c['title']} | {c['center']} | {c['page']} |")
    lines += [
        "",
        "## 四格分别对应哪个研究方向",
        "",
        "四格是**按实验室的四个研究方向一一对应**挑的，不是随便找四张遥感图：",
        "",
        "| 格 | 对应方向 | 影像 |",
        "|---|---|---|",
        "| 1 | **四维场景生成理解** | 拉斯维加斯 1984 / 2010 两期 Landsat 影像（`about-1a/b`），"
        "同一场景随时间的演化 —— 前端用 CSS 交叉淡入淡出呈现 |",
        "| 2 | **多源数据智能分析** | 荷兰 Flevoland 三频（X/C/L 波段）假彩色 SAR（`about-2`），"
        "三个雷达频段合成，本身就是「多源数据」的直观例子 |",
        "| 3 | **具身智能与智能体** | 国际空间站上的 Robonaut 2 人形机器人（`about-3`） |",
        "| 4 | **遥感目标智能感知** | 东京与东京湾的 Landsat 影像（`about-4`），"
        "城市与港口设施等地物清晰可辨 |",
        "",
        "## 重新生成",
        "",
        "```bash",
        "node _tools/fetch-candidates.mjs     # 从 NASA 下载原始素材到 _candidates/",
        "python _tools/build-about-images.py  # 裁成 4:3、压缩、加年份角标",
        "```",
        "",
        "裁切参数写在 `build-about-images.py` 的 `STATIC` 列表里：有几张原图带元数据条或黑边"
        "（Flevoland 顶部就有一整条），有的是上下两期对照（拉斯维加斯、东京），"
        "所以用显式裁切框而不是自动居中裁。",
        "",
        "`_candidates/` 只是中间文件，随时可以删；上面的命令会重新拉取。",
        "",
        "本文件由 `_tools/build-about-images.py` 自动生成，换图后会一起更新。",
    ]
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    main()