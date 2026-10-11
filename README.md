# 立陶宛生活指南

面向中文读者的立陶宛生活参考书。线上地址：<https://lt.shenxianpeng.dev/>

## 目录结构

```
docs/
├── index.md              首页（只有 front matter，内容在 overrides/home.html）
├── book/                 正文，五部分二十六章
│   ├── foundations/      第一部分 认识立陶宛
│   ├── life/             第二部分 建立日常生活
│   ├── people/           第三部分 健康、家庭与学习
│   ├── work/             第四部分 工作、收入与财务
│   └── rights/           第五部分 法律、安全与户外
├── routes/               按事情查（抵达、搬家、失业、生育……）
├── cities/               按城市查（维尔纽斯、考纳斯、克莱佩达）
├── reference/            官方入口、术语表、年度数字、阅读说明
└── assets/               样式 extra.css、清单勾选脚本 guide.js、logo
overrides/                Material 模板覆盖：首页 home.html、页脚、浏览器标题
hooks/guide.py            按 front matter 给章节加编号、核验标签、本章要点、相关事项
wechat/                   公众号版本（单篇长文）
```

## 章节的 front matter

每一章开头的 front matter 决定页面上方显示什么：

```yaml
---
chapter: "06"                 # 全书连续编号，和 mkdocs.yml 的 nav 标题一致
basis: "《外国人法律地位法》2026-07-01 至 10-31 文本"   # 可选，显示成一个标签
summary:                      # 「本章要点」，三到五条，每条一句话
  - "……"
routes: [arrival, job-loss]   # 可选，文末的相关事项卡片，对应 docs/routes/ 下的文件名
---
```

核验时间默认取 `mkdocs.yml` 里的 `extra.verified_short`，单独一章要写别的日期时加 `verified: "2027-01"`。

## 本地预览

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/mkdocs serve
```

打开 <http://127.0.0.1:8000/>。

构建检查（有断链会失败）：

```bash
.venv/bin/mkdocs build --strict
```

## 发布

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会构建并发布到 GitHub Pages。自定义域名在仓库的 Settings → Pages 里设置。

## 每年要更新什么

立陶宛的最低工资、税档、社保基数和各类津贴每年 1 月 1 日调整。

1. 先改 `docs/reference/numbers.md`，这里集中了所有带年份的金额。
2. 改 `mkdocs.yml` 里的 `extra.home`（首页的关键数字和城市卡片）和 `extra.verified`、`extra.verified_short`。
3. 全文搜索上一年的年份（例如 `2026`），逐处核对。各章 front matter 里的 `summary` 也带数字，一并核对。
4. 更新每章末尾的「事实核验」时间。只改了措辞、没有重新核对事实的章节，不要动这个时间。

## 写作约定

- 立陶宛语专有名词保留原文和变音符号，首次出现时给中文说法。
- 金额用欧元，注明年份。
- 涉及资格、期限、金额的内容，在章末「官方入口」里给出一手来源。
- 没能核实的内容用 `!!! question "待核实"` 标出来，不要写成确定的口气。
- 正文不用 emoji。

## 版权

© 2026 沈显鹏。转载请注明作者和出处，请勿用于商业用途。
