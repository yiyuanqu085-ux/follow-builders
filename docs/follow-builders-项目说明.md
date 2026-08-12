# follow-builders 项目说明

> 这份文档讲清楚 follow-builders 这个开源项目本身是怎么运转的。
> 用来作为后续做 Z.ai MKT 情报 brief 改造的背景参考。

## 一句话概括

follow-builders 是一个"AI 圈早报"工具：**每天帮你盯着一批固定的人，把他们发的内容总结成一份早报推给你看。**

---

## 它盯哪些内容

默认盯三种：

1. **X/Twitter 上 25 个 AI 圈的人**
   比如 Karpathy、Sam Altman、Aaron Levie、Swyx、Guillermo Rauch 这些。名单写死在配置文件 `config/default-sources.json` 里。

2. **6 个 AI 播客**
   Latent Space、No Priors、Unsupervised Learning、Training Data、The MAD Podcast、AI & I。

3. **2 个公司博客**
   Anthropic 工程博客、Claude 博客。

---

## 它怎么运转的：三步

### 第一步：抓数据（每天自动跑一次）

文件：`scripts/generate-feed.js`，配在 `.github/workflows/generate-feed.yml` 里。

每天早上 6:17（UTC）GitHub Actions 自动跑这个脚本，去抓：
- 那 25 个人最近 24 小时发的推文（每人最多 3 条）
- 6 个播客最新一集的转写文字
- 2 个博客最新的文章

抓完存成三个文件，提交回仓库：
- `feed-x.json`（推文）
- `feed-podcasts.json`（播客）
- `feed-blogs.json`（博客）

这一步需要两个密钥（配在仓库的 GitHub Secrets 里，普通用户拿不到）：
- `X_BEARER_TOKEN`——X/Twitter API 的密钥（现在基本要付费档）
- `POD2TXT_API_KEY`——播客转写服务的密钥

还会用 `state-feed.json` 记录已经抓过的推文 ID / 视频 ID / 文章链接，避免重复。

### 第二步：准备一份"原料包"

文件：`scripts/prepare-digest.js`。

你敲 `/ai` 或者定时任务触发时，这个脚本把三样东西打包成一个 JSON：
- 第一步抓到的推文、播客、博客内容
- 你的个人设置（语言、推送方式，存在 `~/.follow-builders/config.json`）
- 几份"怎么总结"的说明文件（`prompts/` 目录下的 prompt）

这个 JSON 就是给 AI 看的全部原料。

### 第三步：AI 把原料包写成早报

AI（比如 Claude）拿到这个 JSON，按照 prompt 里的规矩，把内容重写成一份早报。

prompt 规定了比如：
- 每个人用 2-4 句话总结，要带名字和职位
- 不重要的推文（日常水帖、纯转发、活动宣传）跳过
- 每条都要带原文链接
- **只许用 JSON 里有的内容，不许编造**

写完按你的设置推送：Telegram / 邮件 / 直接在终端看。

---

## 它的几个设计特点

1. **人是固定的那批**
   25 个人写死在 `default-sources.json`，README 原话："源名单由官方维护，用户不能改。" 普通用户没法换名单（除非自己 fork 改仓库）。

2. **AI 只做总结，不做判断**
   最强调的一条规矩就是"不许编造，只用 JSON 里有的东西"。它只告诉你"谁说了什么"，不会告诉你"这对 Z.ai 意味着什么""你该怎么做"。

3. **数据是窄的**
   它只看这 25 个人的推文 + 6 播客 + 2 博客。AI 圈发生的别的事，只要这 25 个人当天没发推，早报里就没有。

4. **它是个"技能"（skill），不是独立服务**
   跑在 Claude Code 或 OpenClaw 里，靠 `SKILL.md` 编排整个流程（引导设置、定时任务、推送）。不是一个常驻后台。

---

## 它的文件结构

```
follow-builders/
├── SKILL.md                          # 编排整个流程的说明书（AI 读这个来跑）
├── config/
│   ├── default-sources.json          # 默认盯的 25 人 + 6 播客 + 2 博客
│   └── config-schema.json
├── prompts/                          # "怎么总结"的说明文件
│   ├── digest-intro.md               # 整份早报的格式和规矩
│   ├── summarize-tweets.md           # 怎么总结推文
│   ├── summarize-podcast.md          # 怎么总结播客
│   ├── summarize-blogs.md            # 怎么总结博客
│   └── translate.md                  # 怎么翻译成中文
├── scripts/
│   ├── generate-feed.js              # 第一步：抓数据（GitHub Actions 每天跑）
│   ├── prepare-digest.js             # 第二步：打包原料 JSON
│   ├── deliver.js                    # 第三步：推送到 Telegram / 邮件
│   └── package.json
├── feed-x.json                       # 抓到的推文（自动更新）
├── feed-podcasts.json                # 抓到的播客（自动更新）
├── feed-blogs.json                   # 抓到的博客（自动更新）
├── state-feed.json                   # 记录已抓过的内容，防重复
└── .github/workflows/generate-feed.yml  # 每天定时跑抓数据的任务
```

---

## 用户能个性化什么（官方支持的范围）

follow-builders 官方留的个性化口子很有限，都在用户目录 `~/.follow-builders/` 下，不动仓库：

- **`config.json`**——语言（中/英/双语）、推送频率、推送方式
- **`prompts/*.md`**——把 prompt 复制到 `~/.follow-builders/prompts/` 改，比如"总结更短点""换个语气"
- **推送方式**——Telegram / 邮件 / 终端

**不能**改的：盯哪些人（25 人名单官方锁死）。

> 注：当前仓库的 `prepare-digest.js` 已经被改过，加了 `~/.follow-builders/local-overrides.json`，可以删掉不想要的人、或加上想要的人。但加的人没有真实抓取数据，得靠 AI 现场联网搜，不靠谱——这是后续要解决的问题。

---

## 跟 Z.ai MKT 情报 brief 的根本差距（一句话）

follow-builders 是一个 **"30 人推文摘要器"**；
Z.ai spec 要的是一个 **"全市场 AI 情报产品"**（全市场信号扫描 + 评分 + watchlist 管理 + 行动建议）。

两者重合的只有"抓推文、抓播客、AI 总结"这一小块，大约 20%。其余 80% follow-builders 没有，而且它的核心设计（固定窄名单、AI 不许做判断）跟 Z.ai 的需求是反着的。
