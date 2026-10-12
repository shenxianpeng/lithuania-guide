"""MkDocs 钩子：按各页 front matter 给页面加页眉信息。

章节页（docs/book/<部分>/<章>.md）会得到：
- 标题上方的一行「第 NN 章 · 所属部分」
- 导语段后面的标签（核验时间、依据的法律版本、阅读时间）和「朗读」按钮
- 「本章要点」，来自 front matter 的 summary
- 文末的相关事项卡片，来自 front matter 的 routes

事项清单页和城市页只加标题上方的一行、标签和「朗读」按钮。

所有页面：front matter 里没写 description 的，取导语段作为页面摘要，
用在搜索引擎的结果和分享卡片上（见 overrides/main.html）。

用到的 front matter 字段：chapter、summary、routes、basis、verified、description。
"""

import html
import re

from mkdocs.utils import get_relative_url

PARTS = {
    "foundations": "第一部分 认识立陶宛",
    "life": "第二部分 建立日常生活",
    "people": "第三部分 健康、家庭与学习",
    "work": "第四部分 工作、收入与财务",
    "rights": "第五部分 法律、安全与户外",
}

# slug -> (标题, 一句话)。slug 对应 docs/routes/<slug>.md
ROUTES = {
    "before-you-go": ("出发前", "签证、文件认证、带什么"),
    "arrival": ("抵达头 30 天", "居留卡、住址、银行、医生"),
    "moving": ("搬家", "不要只改一个地址"),
    "start-work": ("入职", "合同、工资条、税和社保"),
    "job-loss": ("失业", "居留、失业金和医保"),
    "illness": ("生病", "急不急，找谁，病假怎么开"),
    "parenthood": ("生育", "从产检到孩子拿到居留卡"),
    "business": ("创业", "先确认身份，再选形式"),
    "leaving": ("离开立陶宛", "注销、退税、养老金"),
}

CHECK_ICON = (
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" '
    'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>'
)

# 「朗读」按钮默认隐藏，浏览器支持语音合成时由 docs/assets/listen.js 显示出来
LISTEN_BUTTON = (
    '<button class="lt-listen" type="button" aria-label="朗读本页" hidden>'
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">'
    '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z'
    'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z">'
    "</path></svg>朗读</button>"
)


def _page_kind(src_uri):
    """返回 (类型, 部分目录名)。索引页不处理。"""
    parts = src_uri.split("/")
    if parts[-1] == "index.md":
        return None, None
    if parts[0] == "book" and len(parts) == 3:
        return "chapter", parts[1]
    if parts[0] == "routes":
        return "route", None
    if parts[0] == "cities":
        return "city", None
    return None, None


def _reading_minutes(content):
    text = re.sub(r"<[^>]+>", "", content)
    chars = len(re.findall(r"[一-鿿]", text))
    return max(1, round(chars / 400))


def _chips(items):
    spans = []
    for text, ok in items:
        if ok:
            spans.append(f'<span class="lt-chip lt-chip--ok">{CHECK_ICON}{html.escape(text)}</span>')
        else:
            spans.append(f'<span class="lt-chip">{html.escape(text)}</span>')
    return f'<div class="lt-meta" data-search-exclude>{"".join(spans)}{LISTEN_BUTTON}</div>'


def _lead_text(content, limit=110):
    """标题后第一段的纯文字，太长就截断。没有导语段时返回空字符串。"""
    h1_end = content.find("</h1>")
    if h1_end == -1:
        return ""
    p_start = content.find("<p", h1_end)
    p_end = content.find("</p>", h1_end)
    next_h2 = content.find("<h2", h1_end)
    if p_start == -1 or p_end == -1 or (next_h2 != -1 and p_start > next_h2):
        return ""
    text = html.unescape(re.sub(r"<[^>]+>", "", content[p_start:p_end]))
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip("，、；：") + "…"


def _insert_after_lead(content, block):
    """把 block 插到标题后的第一段后面；找不到就插到标题后面。"""
    h1_end = content.find("</h1>")
    if h1_end == -1:
        return block + content
    h1_end += len("</h1>")
    p_end = content.find("</p>", h1_end)
    next_h2 = content.find("<h2", h1_end)
    if p_end == -1 or (next_h2 != -1 and p_end > next_h2):
        return content[:h1_end] + block + content[h1_end:]
    p_end += len("</p>")
    return content[:p_end] + block + content[p_end:]


def on_page_content(content, page, config, files):
    lead = _lead_text(content)
    if lead and not page.meta.get("description"):
        page.meta["description"] = lead

    kind, part = _page_kind(page.file.src_uri)
    if kind is None:
        return content

    meta = page.meta or {}
    verified = str(meta.get("verified") or config.extra.get("verified_short", ""))

    # 标题上方的一行
    if kind == "chapter":
        number = str(meta.get("chapter", "")).strip()
        label = PARTS.get(part, "")
        num_html = f'<span class="lt-kicker__num">{html.escape(number)}</span>' if number else ""
        kicker = f'<div class="lt-kicker" data-search-exclude>{num_html}<span>{html.escape(label)}</span></div>'
    elif kind == "route":
        kicker = '<div class="lt-kicker" data-search-exclude><span>事项清单</span></div>'
    else:
        kicker = '<div class="lt-kicker" data-search-exclude><span>城市</span></div>'
    content = content.replace("<h1", kicker + "<h1", 1)

    # 标签
    chips = []
    if verified:
        chips.append((f"事实核验 {verified}", True))
    if meta.get("basis"):
        chips.append((f"依据{meta['basis']}", False))
    if kind == "route":
        steps = content.count('class="task-list-item"')
        if steps:
            chips.append((f"{steps} 个步骤", False))
    else:
        chips.append((f"约 {_reading_minutes(content)} 分钟", False))
    block = _chips(chips)

    # 本章要点
    summary = meta.get("summary") or []
    if summary:
        items = "".join(f"<li>{html.escape(str(s))}</li>" for s in summary)
        block += (
            '<section class="lt-key" aria-label="本章要点" data-search-exclude>'
            '<p class="lt-key__title">本章要点</p>'
            f"<ul>{items}</ul></section>"
        )
    content = _insert_after_lead(content, block)

    # 相关事项
    slugs = [s for s in (meta.get("routes") or []) if s in ROUTES]
    if slugs:
        cards = []
        for slug in slugs:
            title, note = ROUTES[slug]
            href = get_relative_url(f"routes/{slug}/", page.url)
            cards.append(
                f'<a class="lt-related__card" href="{href}">'
                f"<strong>{html.escape(title)}</strong><span>{html.escape(note)}</span></a>"
            )
        related = (
            '<nav class="lt-related" aria-label="相关事项" data-search-exclude>'
            '<p class="lt-related__title">这一章会用在这些事情上</p>'
            f'<div class="lt-related__grid">{"".join(cards)}</div></nav>'
        )
        marker = '<p class="lt-verified">'
        if marker in content:
            content = content.replace(marker, related + marker, 1)
        else:
            content += related

    return content
