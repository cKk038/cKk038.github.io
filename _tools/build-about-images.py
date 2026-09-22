"""
首页 2×2 配图生产脚本
================================================================================
素材全部来自 NASA 图片库（images-api.nasa.gov），属于美国联邦政府作品，
**公有领域**，可自由使用（NASA 媒体使用指南：https://www.nasa.gov/nasa-brand-center/images-and-media/）。
出处与 NASA ID 记录在 public/img/about-CREDITS.md。

产出四张（对应 src/config/site.ts 的 aboutImages，顺序与四个研究方向一致）：
  about-1.jpg   PIA01802          韦德尔海三频假彩色 SAR
                → ① 多源数据智能分析
  about-2.jpg   PIA01718          SIR-C 加州 Mammoth 三维透视
                → ② 四维场景生成理解
  about-3.jpg   iss030e135157     Robonaut 2 人形机器人
                → ③ 具身智能与智能体
  about-4.jpg   iss007e10960      轨道拍摄的沿海城市（白天光学）
                → ④ 遥感目标智能感知

2026-09 这一轮把四张全换了，原因有两类：
  · 选题不贴切：上一轮第 2 格用拉斯维加斯两期影像表达「四维」，但那只体现时间、
    不体现三维；第 4 格用上下两期拼图，缩到格子尺寸后细节全糊。
  · 构图有瑕疵：SIR-C 那类原图常带元数据条、色标图例或右上角插图，必须显式裁掉。

动态效果（两张图 + CSS 交叉淡入）这一轮没有使用 —— 四张都要各自对应一个方向，
凑不出「同一场景的两个状态」这种天然成对的素材。机制本身保留在 global.css 的
.collage-fade 与 site.ts 的 srcAlt 字段里，将来找到合适的成对素材填上 srcAlt 即可生效。

用法：python _tools/build-about-images.py
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CAND = ROOT / "_candidates"
OUT = ROOT / "public" / "img"

COLLAGE_W, COLLAGE_H = 640, 480  # 4:3，与 .about-collage img 的 aspect-ratio 一致

# 元信息（标题/机构/日期）由 fetch-candidates.mjs 写入，版权说明据此生成
SOURCES = {}
sources_file = CAND / "sources.json"
if sources_file.exists():
    for s in json.loads(sources_file.read_text(encoding="utf-8")):
        SOURCES[s["id"]] = s


def meta(nasa_id: str) -> dict:
    return SOURCES.get(nasa_id, {"id": nasa_id, "title": "", "center": "NASA", "page": ""})


STATIC = [
    # ① 多源数据智能分析：韦德尔海三频假彩色 SAR。
    # 原图有黑边、顶部一条元数据、以及右上角一块绿色的小插图 —— 显式裁切框一并避开。
    {"src": "PIA01802.jpg", "out": "about-1.jpg", "crop": (65, 12, 1065, 762)},
    # ② 四维场景生成理解：SIR-C 三维透视。原图 1440×961，上方一大片纯蓝天，
    # 裁掉部分天空把地形放大，观感更像「三维场景」而不是风景照。
    {"src": "PIA01718.jpg", "out": "about-2.jpg", "crop": (166, 130, 1274, 961)},
    # ③ 具身智能与智能体：Robonaut 2。鱼眼照片四角是黑的，左右各裁一点正好去掉，
    # 同时避开右侧出镜的航天员。
    {"src": "iss030e135157.jpg", "out": "about-3.jpg", "crop": (73, 0, 1206, 850)},
    # ④ 遥感目标智能感知：沿海城市。左右对称裁成 4:3，保留港口、机场跑道与农田。
    {"src": "iss007e10960.jpg", "out": "about-4.jpg", "crop": (75, 0, 1204, 847)},
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


def main() -> None:
    credits = []

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
        credits.append({"slot": item["out"], **m})
        print(f"✓ {item['out']:14s} {im.size[0]}x{im.size[1]}  {dst.stat().st_size // 1024} KB   {m['title']}")

    (OUT / "about-CREDITS.md").write_text(render_credits(credits), encoding="utf-8")
    print("\n版权与出处说明写入 public/img/about-CREDITS.md")


def render_credits(credits) -> str:
    slots = [
        ("① 多源数据智能分析",
         "韦德尔海（南极）三频假彩色 SAR。SIR-C/X-SAR 用 X/C/L 三个波段同时对同一片海冰"
         "成像再合成，本身就是「多源数据融合」的直观例子"),
        ("② 四维场景生成理解",
         "SIR-C 对加州 Mammoth 地区的三维透视成像，带明显景深 —— 对应方向里的三维重建与场景理解"),
        ("③ 具身智能与智能体",
         "国际空间站上的 Robonaut 2 人形机器人"),
        ("④ 遥感目标智能感知",
         "轨道拍摄的沿海城市白天光学影像，港口、机场跑道、农田等「目标」清晰可辨"),
    ]

    lines = [
        "# 首页配图出处与版权",
        "",
        "首页「关于我们」的 2×2 拼贴共四张图，**全部来自 NASA 图片库，属于公有领域**"
        "（美国联邦政府作品，不受版权保护），可自由使用、修改与再分发，无需授权也无需付费。",
        "",
        "参考：[NASA 媒体使用指南](https://www.nasa.gov/nasa-brand-center/images-and-media/)",
        "",
        "| 文件 | 标题 | 来源 | 说明页 |",
        "|---|---|---|---|",
    ]
    for c in credits:
        lines.append(f"| `{c['slot']}` | {c['title']} | {c['center']} | {c['page']} |")

    lines += [
        "",
        "## 四格分别对应哪个研究方向",
        "",
        "四格是**按实验室的四个研究方向一一对应**挑的，顺序与研究方向页一致：",
        "",
        "| 格 | 对应方向 | 影像与理由 |",
        "|---|---|---|",
    ]
    for i, (name, why) in enumerate(slots, 1):
        lines.append(f"| {i} | **{name}** | {why} |")

    lines += [
        "",
        "## 重新生成",
        "",
        "```bash",
        "node _tools/fetch-candidates.mjs     # 从 NASA 下载原始素材到 _candidates/",
        "python _tools/build-about-images.py  # 裁成 4:3、压缩",
        "```",
        "",
        "裁切参数写在 `build-about-images.py` 的 `STATIC` 列表里。**用显式裁切框而不是自动居中裁**，",
        "因为这几张原图各有各的干扰：SAR 那张有黑边、顶部元数据条和右上角插图，",
        "SIR-C 三维图上方一大片纯蓝天，鱼眼机器人照片四角是黑的。",
        "",
        "`_candidates/` 只是中间文件，随时可以删；上面的命令会重新拉取。",
        "",
        "## 关于第一格的动态效果",
        "",
        "早先第一格是两张拉斯维加斯影像交叉淡入，用来表现「随时间变化」。这一轮四格都要",
        "各自对应一个方向，凑不出同一场景的两个状态，所以改成静态图。",
        "机制仍在：给 `site.ts` 的某一格填上 `srcAlt`，`.collage-fade` 就会自动生效"
        "（实现见 `src/styles/global.css`）。",
        "",
        "本文件由 `_tools/build-about-images.py` 自动生成，换图后会一起更新。",
    ]
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    main()