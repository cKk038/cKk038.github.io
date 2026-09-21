/**
 * 轻量富文本：把数据文件里的 `[[名字]]` 渲染成人名高亮标签。
 *
 * 内容来自我们自己的 src/data/*.ts（不是用户输入），但仍然先做 HTML 转义，
 * 避免数据里出现 `<` `&` 时把页面结构撑坏。
 *
 *   richText('论文被 CVPR 接收，作者为 [[Wei Zhang]]。')
 *   → '论文被 CVPR 接收，作者为 <span class="person-name">Wei Zhang</span>。'
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

/** 转义 HTML，并把 [[名字]] 转成高亮标签 */
export function richText(input: string): string {
  return escapeHtml(input).replace(/\[\[(.+?)\]\]/g, '<span class="person-name">$1</span>');
}

/** 只去掉 [[ ]] 标记、不做转义（用于 <title>、alt 等纯文本场合） */
export function plainText(input: string): string {
  return input.replace(/\[\[(.+?)\]\]/g, '$1');
}