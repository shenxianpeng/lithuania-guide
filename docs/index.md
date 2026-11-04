---
template: landing.html
title: 立陶宛生活指南
# 首页的内容都在这份 front matter 里，由 Sumi 的 landing.html 排版。
# 关键数字、城市卡片和核验时间每年和 docs/reference/numbers.md 一起更新。
# front matter 文字里的链接写成页面地址（book/life/documents/），不要写 .md 文件名：
# Sumi 0.2.1 只转换 link 字段，文字里的 .md 链接会打开 Markdown 原文。
hero:
  eyebrow: 面向中文读者的生活参考书
  title: 立陶宛生活指南
  text: 读懂立陶宛社会，找到居留、住房、看病、上学、工作和报税的办事入口。可以从头读，也可以遇到事情再来查。
  actions:
    - {text: 从头阅读, link: book/index.md, icon: book-open, primary: true}
    - {text: 刚落地？看头 30 天, link: routes/arrival.md, icon: plane-landing}
sections:
  - type: stats
    items:
      - {value: "26", label: 章正文}
      - {value: "9", label: 份事项清单}
      - {value: "3", label: 座城市}
      - {value: "2026-10", label: 事实核验}

  - type: features
    id: numbers
    eyebrow: 核验 2026-10
    title: 2026 年关键数字
    text: "[查看全部数字](reference/numbers/)"
    columns: 3
    items:
      - {icon: badge-euro, title: "3,617.10 欧元 / 月", text: 蓝卡工资门槛}
      - {icon: id-card, title: "220 欧元", text: 居留许可规费}
      - {icon: wallet, title: "60.5%", text: "税前到手比例（月薪 2,700 以上）"}
      - {icon: baby, title: "129.5 欧元 / 孩 / 月", text: 儿童金}
      - {icon: heart-pulse, title: "80.48 欧元 / 月", text: 自缴医保}
      - {icon: coins, title: "1,153 欧元", text: 最低月薪}

  - type: features
    id: book
    tone: soft
    eyebrow: 从头阅读
    title: 全书五部分
    text: 先理解这个国家，再把日常搭起来，然后是人生里的大事和钱，最后是出了问题找谁。每一章都能单独读。
    columns: 3
    items:
      - icon: map
        title: 第一部分 认识立陶宛
        text: >-
          地图、历史、政府怎么运作，以及人和人怎么相处。 [本部分导读](book/foundations/)<br>
          [01 地理、气候与城市](book/foundations/geography/) ·
          [02 关键历史与社会形成](book/foundations/history/) ·
          [03 国家制度与公共事务](book/foundations/government/) ·
          [04 社会文化与默会知识](book/foundations/culture/) ·
          [05 立陶宛与世界](book/foundations/world/)
      - icon: house
        title: 第二部分 建立日常生活
        text: >-
          居留卡、住处、吃饭、出行、手机。这几件事接上了，生活才算开始运转。 [本部分导读](book/life/)<br>
          [06 身份、居留与行政](book/life/documents/) ·
          [07 住房、租赁与购房](book/life/housing/) ·
          [08 衣食、购物与家庭运转](book/life/household/) ·
          [09 交通、驾驶与出行](book/life/transport/) ·
          [10 数字生活与通信](book/life/digital/) ·
          [11 社区、文化与休闲](book/life/community/)
      - icon: users
        title: 第三部分 健康、家庭与学习
        text: >-
          找得到医生，孩子有学上，自己听得懂周围的人在说什么。 [本部分导读](book/people/)<br>
          [12 医疗与就医入口](book/people/health/) ·
          [13 心理健康与无障碍](book/people/wellbeing/) ·
          [14 婚姻、家庭与生育](book/people/family/) ·
          [15 幼儿园与中小学](book/people/school/) ·
          [16 大学与终身学习](book/people/learning/) ·
          [17 立陶宛语与语言生活](book/people/language/) ·
          [18 养老、父母与身后事](book/people/aging/)
      - icon: briefcase
        title: 第四部分 工作、收入与财务
        text: >-
          钱从哪里来，交了多少税，剩下的怎么放。 [本部分导读](book/work/)<br>
          [19 求职与职场文化](book/work/career/) ·
          [20 劳动关系与社会保障](book/work/employment/) ·
          [21 银行、储蓄与保险](book/work/finance/) ·
          [22 个人税务与年度申报](book/work/tax/) ·
          [23 创业与经营](book/work/business/)
      - icon: scale
        title: 第五部分 法律、安全与户外
        text: >-
          出了问题找谁，怎么保护自己，以及怎么享受这里的森林和湖。 [本部分导读](book/rights/)<br>
          [24 权利、纠纷与求助机构](book/rights/legal/) ·
          [25 公共安全与应急](book/rights/safety/) ·
          [26 自然、户外与周边旅行](book/rights/outdoors/)
      - icon: search
        title: 附 查询
        text: >-
          读的时候随手要查的东西。<br>
          [官方入口速查](reference/links/) ·
          [立陶宛语术语表](reference/glossary/) ·
          [2026 年关键数字](reference/numbers/) ·
          [阅读说明](reference/about/)

  - type: features
    id: routes
    eyebrow: 按事情查
    title: 人生里的事不按章节发生
    text: 九份清单，按时间顺序列出每一步做什么、找谁、期限多久。
    columns: 3
    items:
      - {icon: luggage, title: 出发前, text: 签证、文件认证、带什么、不用带什么。, link: routes/before-you-go.md}
      - {icon: plane-landing, title: 抵达头 30 天, text: 把居留卡、住址、银行、手机、医生接起来。, link: routes/arrival.md}
      - {icon: truck, title: 搬家, text: 不要只改一个地址。, link: routes/moving.md}
      - {icon: briefcase, title: 入职, text: 合同、工资条、税和社保怎么看。, link: routes/start-work.md}
      - {icon: life-buoy, title: 失业, text: 居留、失业金和医保，哪个先处理。, link: routes/job-loss.md}
      - {icon: stethoscope, title: 生病, text: 急不急，找谁，病假怎么开。, link: routes/illness.md}
      - {icon: baby, title: 生育, text: 从产检到孩子拿到居留卡。, link: routes/parenthood.md}
      - {icon: store, title: 创业, text: 先确认身份允许，再选公司形式。, link: routes/business.md}
      - {icon: door-open, title: 离开立陶宛, text: 注销、退税、养老金和银行账户。, link: routes/leaving.md}

  - type: features
    id: cities
    tone: soft
    eyebrow: 按城市查
    title: 法律全国统一，差别在房租和机会
    text: 立陶宛是单一制国家。城市之间不同的是房租、工作机会、公交和幼儿园名额。
    columns: 3
    items:
      - icon: landmark
        title: 维尔纽斯 Vilnius
        link: cities/vilnius.md
        text: >-
          首都。外国人最多，英语最通，房租也最高。<br>
          人口 约 61 万 · 平均税前月薪 2,967 欧元 · 一室一厅月租 430–1,200 欧元 · 公寓均价 3,197 欧元 / m²
      - icon: graduation-cap
        title: 考纳斯 Kaunas
        link: cities/kaunas.md
        text: >-
          第二大城市。大学城，制造业和工程岗位集中。<br>
          人口 约 30 万 · 平均税前月薪 2,741 欧元 · 一室一厅月租 380–900 欧元 · 公寓均价 2,339 欧元 / m²
      - icon: anchor
        title: 克莱佩达 Klaipėda
        link: cities/klaipeda.md
        text: >-
          港口城市。离海和库尔斯沙嘴最近。<br>
          人口 约 16 万 · 平均税前月薪 2,582 欧元 · 一室一厅月租 380–880 欧元 · 公寓均价 2,103 欧元 / m²

  - type: features
    id: howto
    eyebrow: 从哪读起
    title: 看你现在在哪一步
    columns: 3
    items:
      - icon: compass
        title: 还在考虑要不要来
        text: >-
          [地理、气候与城市](book/foundations/geography/)<br>
          [求职与职场文化](book/work/career/)<br>
          [个人税务：税前到手怎么算](book/work/tax/)
      - icon: plane
        title: 已经定了，或者刚落地
        text: >-
          [身份、居留与行政](book/life/documents/)<br>
          [出发前的清单](routes/before-you-go/)<br>
          [抵达头 30 天](routes/arrival/)
      - icon: house
        title: 已经住下来了
        text: >-
          [婚姻、家庭与生育：能领哪些福利](book/people/family/)<br>
          [银行、储蓄与保险：养老金三支柱](book/work/finance/)<br>
          [立陶宛语：永居要考什么](book/people/language/)

  - type: content
---

> [!WARNING] 使用前请知道
> 居留、税务和社保规则每年都在变。每一章都标注了事实核验的时间和官方来源。做重要决定之前，请以官方原文为准。[阅读说明](reference/about.md)
