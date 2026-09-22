"""
从 .docx 里提取纯文本（按段落），用于核对实验室提供的论文清单。

docx 本质是个 zip，正文在 word/document.xml 里。这里不引入 python-docx
依赖，直接用标准库解析：按 </w:p> 切段、去掉标签、还原常见实体。
段落样式（w:pStyle 的 val）会一并标出来，方便区分标题行和正文。

用法：
    python _tools/extract-docx.py "Selected Publications.docx"
"""

import sys
import zipfile
import re
import html


def extract(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="replace")

    paragraphs = []
    # 按段落切分
    for chunk in re.split(r"</w:p>", xml):
        if not chunk.strip():
            continue

        # 这一段的样式名（w:pStyle w:val="..."），没有就是普通段落
        style = ""
        m = re.search(r'<w:pStyle[^>]*w:val="([^"]+)"', chunk)
        if m:
            style = m.group(1)

        # 收集所有 <w:t> 文本。
        # 注意必须写成 <w:t(?:\s[^>]*)?> —— 不能写成 <w:t[^>]*>：
        # 后者会把自闭合的 <w:tab/>（制表符）也当成开标签，导致把后续标签吞进正文。
        texts = re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", chunk, flags=re.S)
        line = "".join(texts)
        line = html.unescape(line)
        # <w:br/> / <w:tab/> 之类的标签已经不在 w:t 里，不影响
        line = line.replace("\u00a0", " ").strip()

        if line:
            paragraphs.append((style, line))

    return paragraphs


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv

    if not args:
        print(__doc__)
        return 1

    paras = extract(args[0])

    if as_json:
        # 输出 JSON，方便其它脚本按标题做匹配比对
        import json

        print(json.dumps([line for _style, line in paras], ensure_ascii=False, indent=1))
        return 0

    print(f"共 {len(paras)} 段\n")
    for i, (style, line) in enumerate(paras, 1):
        tag = f"[{style}] " if style else ""
        print(f"{i:>3}. {tag}{line}")
    return 0


if __name__ == "__main__":
    sys.exit(main())