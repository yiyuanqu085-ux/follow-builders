# Z.ai MKT 情报日报 — 实现方案

## Context

把 follow-builders(fork 自 zarazhangrui/follow-builders)从原版 "AI Builders Digest"(25 人 X 推文摘要)改造成 "Z.ai MKT Daily Intelligence Brief"(7 板块营销情报日报),推送到飞书群。

**已确认的关键决策(2026-08-11):**
- **不订阅 X API**。15 个上游已覆盖 KOL 的推文继续白嫖 zara 上游 `feed-x.json`;15 个缺失 KOL 里 14 个用免费源覆盖(RSS/arXiv/GitHub/网页抓取),1 个(Aravind)走 web_search fallback。覆盖率清单见 `docs/KOL免费源覆盖清单.md`。
- **Enterprise/Startup 板块接免费热点源**(HN + GitHub trending + arXiv)填充,保持单独板块、降低条数要求。
- **AI 判断做轻**:AI 只给 Fact + 主题标签;Interpretation / Why Z.ai 做轻(短、不写废话)。
- **MKT opportunity**:AI 可推荐动作,但必须引用具体事实,否则强制写"不建议主动动作"。
- **评分**:在 `mkt-scoring.json` 配大概规则(权重 + 主题匹配),AI 据此打 P0-P3,不追求跨天严格可比。
- **飞书推送走 OpenClaw 通道**(不走 deliver.js);`deliver.js` 配 stdout。**飞书群推全量 brief**(已确认,不裁剪);同时完整版存 `data/outputs/`。
- **分三阶段实施**(已确认):Phase 1 数据采集 → Phase 2 打包+remix → Phase 3 输出+飞书。每阶段独立验证。
- **web_search 必须放在独立前置步骤**(SKILL.md Step 3.5),把结果写进 JSON;主 remix LLM 仍禁止联网(SKILL.md:366 防编造),`source_status` 标记每条来源置信度。

**硬开销**:数据源 $0(无 X API、无 pod2txt);仅 LLM remix ~$5-15/月。

**预期结果**:每天自动产出 `data/outputs/zai-mkt-intelligence-brief.{md,json}`,7 板块,每条带 source link + P0-P3,飞书群收到全量 brief。

---

## 架构总览

```
[fork 的 GitHub Action,每天跑一次,无需任何 API key]
  scripts/generate-mkt-feed.js
    ├─ fetchRssBlogs    (Simon/Ethan/Sarah/Deedy/Lenny/HF blog)  → 复用 parseRssFeed
    ├─ fetchScrapedBlog (LangChain / The Batch / Allie newsletter) → 仿 fetchBlogContent
    ├─ fetchArxiv       (Thomas Wolf / Chollet / Jim Fan)          → arXiv API Atom
    ├─ fetchGithub      (Thibault + 补充)                          → {user}.atom
    └─ fetchTrending    (HN + GitHub trending + arXiv 热门)        → 填 Enterprise/Startup
    → 写 feed-mkt.json(统一 signals 数组,每条带 source_status)
         │
         ↓ commit 回 fork 仓库
[zara 上游]  feed-x.json / feed-podcasts.json / feed-blogs.json  (免费白嫖)
         │
         ↓
scripts/prepare-digest.js  (fork:改 URL 混源)
  → 拉上游 3 feed + 自己的 feed-mkt.json + mkt-*.json 配置
  → 输出 JSON 到 stdout
         │
         ↓
SKILL.md Step 3.5  web_search 前置步骤
  → 对 Aravind 等 web_search fallback KOL 联网搜,结果写进 JSON,标 source_status=web_search
         │
         ↓
SKILL.md Step 4  remix(仍禁止联网,只读 JSON)
  → 按 prompts/digest-intro.md 重组:7 板块 + 做轻判断 + 事实接地 MKT opp + P0-P3
  → 写 data/outputs/zai-mkt-intelligence-brief.{md,json}
  → stdout → OpenClaw cron → 飞书群(全量 brief)
```

---

## Phase 1 — 数据采集层(免费源 + source_status)

### 1.1 新增配置文件

| 文件 | 内容 |
|---|---|
| `config/mkt-kols.json` | 30 KOL 完整名单(name/handle/organization/role/category/tier/status/zai_angle)+ **`source` 字段映射到免费源** + **`source_status` 默认值**(feed/rss/arxiv/github/blog_scrape/web_search) |
| `config/mkt-sources.json` | 每个免费源的具体配置:rss_blogs[]、scraped_blogs[]、arxiv_authors[]、github_accounts[]、trending[]。URL 全部来自 `docs/KOL免费源覆盖清单.md` 已验证清单 |
| `config/mkt-topics.json` | Z.ai 关注主题(Models/Coding&Agents/Dev Ecosystem/Startup/Enterprise/Competitors 各自关键词) |
| `config/mkt-scoring.json` | 评分规则:30% Z.ai product / 20% dev ecosystem / 15% startup GTM / 15% enterprise GTM / 10% KOL influence / 10% freshness + P0-P3 阈值定义 + 主题匹配加分规则 |
| `config/competitors.json` | 竞品清单(OpenAI/Anthropic/Google/Meta/xAI/Mistral/DeepSeek/Kimi/MiniMax/Qwen)+ 各自监控关键词 |
| `config/enterprise-watchlist.json` / `config/startup-watchlist.json` | 企业/startup 关注名单(一版可先空或少量) |

### 1.2 新增抓取脚本 `scripts/generate-mkt-feed.js`

**不复用上游 generate-feed.js 的 main(),独立新脚本**(避免破坏上游 feed 生成)。可复用的小工具(`parseRssFeed` @ generate-feed.js:83-118、`loadState`/`saveState` @ :43-70)采取**复制一份到新脚本**的方式(generate-feed.js 未 export,复制比重构风险低)。

抓取函数(均写入 `feed-mkt.json` 的统一 `signals[]` 数组,每条带 `source_status`):

| 函数 | 数据源 | 复用 | 输出 source_status |
|---|---|---|---|
| `fetchRssBlogs` | Simon Willison(atom)、Ethan Mollick、Sarah Guo、Deedy(Menlo)、Lenny、Clem(HF blog RSS) | 复用 `parseRssFeed` | `rss` |
| `fetchScrapedBlog` | LangChain 博客、Andrew Ng The Batch、Allie newsletter | 仿 `fetchBlogContent`(:863)+ 每站一段解析器(仿 `parseAnthropicEngineeringIndex` :641) | `blog_scrape` |
| `fetchArxiv` | Thomas Wolf、Chollet、Jim Fan(本名 Linxi Fan) | arXiv API `export.arxiv.org/api/query`(Atom),用 `parseRssFeed` 解析 | `arxiv` |
| `fetchGithub` | Thibault + 补充 | `{user}.atom` + `parseRssFeed` | `github` |
| `fetchTrending` | HN(Algolia/Firebase API)、GitHub trending、arXiv 热门 | 各自简单 fetch | `trending` |

**state 扩展**:复制 `loadState`/`saveState`,新增 `seenMktSignals`(key=URL/guid,value=timestamp),7 天清理逻辑照搬。

**统一 signal schema**(每条):
```json
{ "source_status": "rss|arxiv|github|blog_scrape|trending|web_search",
  "kol": "Simon Willison" | null,
  "title": "...", "summary": "...", "url": "...",
  "publishedAt": "...", "source_name": "simonwillison.net",
  "content": "...", "topic_tags": [] }
```

### 1.3 GitHub Action

修改 `.github/workflows/generate-feed.yml`(或新建 `generate-mkt-feed.yml`):
- 新增一步跑 `node scripts/generate-mkt-feed.js`
- `git add feed-mkt.json state-feed.json`(或独立 state 文件)
- **不需要任何 secret**(无 X token、无 pod2txt key)——这是不接 X API 的核心红利

### 1.4 Phase 1 验证
- 本地 `node scripts/generate-mkt-feed.js`,检查 `feed-mkt.json` 里 14 个 KOL 都有信号、`source_status` 分布合理
- 检查去重生效(连跑两次,第二次无重复)
- 检查 trending 源有 HN/GitHub/arXiv 条目

---

## Phase 2 — 打包 + web_search 前置 + remix

### 2.1 fork `prepare-digest.js`(改 URL 混源)

- 保留上游 3 个 feed URL 不变(`FEED_X_URL`/`FEED_PODCASTS_URL`/`FEED_BLOGS_URL` @ :29-31,白嫖 zara)
- 新增拉取自己 fork 的 `feed-mkt.json`(raw URL 指向 fork,fork 需 public)
- 新增把 `config/mkt-kols.json`/`mkt-topics.json`/`mkt-scoring.json`/`competitors.json` 读进输出 JSON(本地读,fork 仓库内)
- 输出 JSON 增加 `mktSignals`(来自 feed-mkt.json)、`mktConfig`(topics/scoring/competitors)、每个 signal 保留 `source_status`

### 2.2 `SKILL.md` 插入 Step 3.5(web_search 前置)

在 Step 3(Check for content)和 Step 4(Remix)之间插入:
- 对 `source_status=web_search` 的 KOL(Aravind,及任何 `no_recent_signal` 的 KOL),用 web search 找近 24-72h 公开内容
- 把找到的真实条目(带 URL)追加进 JSON 的 `mktSignals`,`source_status=web_search`
- **搜不到就跳过,严禁编造**;Step 4 的 remix LLM 仍保持禁联网(不动 :366 规则)

### 2.3 重写 `prompts/digest-intro.md`(7 板块 + 做轻判断)

按需求 spec 改为 7 板块结构:
1. Top AI Signals(5-8) 2. KOL Radar(5-12) 3. KOL Outreach Opportunities(3-5) 4. Startup & Dev Ecosystem(5-8,降权可少) 5. Enterprise AI Radar(5-8,降权可少) 6. Podcasts/Long-form(3-5) 7. Watchlist(KOLs to add / deprioritize / Topics to monitor)

每条信号字段(按"做轻"决策):
- **Fact**(来自数据)+ **topic_tags**(匹配 mkt-topics)
- **Interpretation / Why Z.ai**:做轻——1 句,禁废话套话,不写"这与开发者生态相关"这种正确废话
- **MKT opportunity**:可推荐动作,但**必须引用具体 Fact**,否则强制写"不建议主动动作"
- **Score/Priority**:按 mkt-scoring.json 规则打 P0-P3
- **Source links**:必须有 URL(无 URL 不收)
- 每条标注 `source_status`(让读者知道置信度)

### 2.4 Phase 2 验证
- `node scripts/prepare-digest.js` 输出 JSON,确认含 mktSignals + mktConfig + source_status
- 手动跑 remix(给 agent SKILL.md 指令),检查输出 7 板块齐全、每条有 URL、P0-P3 标注、"不建议主动动作"在无事实支撑时出现
- 检查 Aravind 走 web_search 后有/无结果都正常(无结果不编造)

---

## Phase 3 — 输出 + 飞书全量推送

### 3.1 输出文件
- SKILL.md Step 4 之后加一步:把 brief 写到 `data/outputs/zai-mkt-intelligence-brief.{md,json}`(spec 要求路径)
- 标题格式:`Z.ai MKT Intelligence Brief — YYYY-MM-DD`

### 3.2 飞书推送
- `deliver.js` 配 `stdout`(飞书场景它不干活,OpenClaw 接管)
- OpenClaw cron 配置(参考 SKILL.md:220-243):
  ```
  openclaw cron add --name "Z.ai MKT Brief" --cron "0 8 * * *" --tz "Asia/Shanghai" \
    --session isolated --channel feishu --to "oc_xxx" --exact \
    --message "Run the follow-builders skill: execute prepare-digest.js, run web_search pre-step for web_search KOLs, remix into the Z.ai MKT 7-section brief per digest-intro.md, write to data/outputs/, then output the full brief to stdout"
  ```
- 飞书群推 **全量 brief**(已确认);完整版同时存 `data/outputs/`

### 3.3 Phase 3 验证
- 确认 `data/outputs/` 两文件生成
- `openclaw cron run <jobId>` 测试,确认飞书群收到全量 brief
- 跑 2-3 天,检查覆盖率(source_status 统计)、空板块情况、评分稳定性

---

## 关键文件清单

**新增**:
- `scripts/generate-mkt-feed.js`(抓取,复用 parseRssFeed/loadState/saveState 逻辑)
- `config/mkt-kols.json` `config/mkt-sources.json` `config/mkt-topics.json` `config/mkt-scoring.json` `config/competitors.json` `config/enterprise-watchlist.json` `config/startup-watchlist.json`
- `data/outputs/zai-mkt-intelligence-brief.{md,json}`(运行产物)

**修改**:
- `scripts/prepare-digest.js`(:29-31 URL 混源、加 mktSignals/mktConfig)
- `SKILL.md`(插 Step 3.5 web_search、Step 4 后写文件、OpenClaw cron message)
- `prompts/digest-intro.md`(重写 7 板块 + 做轻判断 + 事实接地 MKT opp + P0-P3)
- `.github/workflows/generate-feed.yml`(加跑 generate-mkt-feed.js + commit feed-mkt.json)

**不动**:
- `scripts/generate-feed.js`(上游 X/podcast/blog 抓取保持原样,fork 不跑它,只白嫖其产物)
- `scripts/deliver.js`(配 stdout 即可)

---

## 风险与注意

1. **fork 必须 public**:`prepare-digest.js` 裸 fetch raw,私有仓库读不到 feed-mkt.json。
2. **3 个无 RSS 站点要写解析器**:LangChain、The Batch、Allie newsletter——仿现有 Anthropic/Claude 博客解析器,每站一段,站点改版会坏,需维护。
3. **web_search 是低置信源**:Aravind 之外,任何免费源当天无信号的 KOL 也会落到 web_search;brief 里要靠 `source_status` 让读者区分置信度。
4. **trending 源内容杂**:HN/GitHub trending 需要 AI 按 mkt-topics/competitors 过滤,否则 Enterprise/Startup 板块会混入无关项。
5. **飞书推送长度**:已确认推全量 brief(不裁剪)。注意 7 板块全量较长,飞书单条消息有长度限制,可能需分段投递(OpenClaw 通道通常自动处理,实测确认)。

---

## 验证总览(end-to-end)

1. `node scripts/generate-mkt-feed.js` → `feed-mkt.json` 14 KOL 有信号 + trending 有条目 + source_status 分布合理
2. GitHub Action 跑通,`feed-mkt.json` 每日自动更新且无 secret
3. `node scripts/prepare-digest.js` → JSON 含上游 3 feed + mktSignals + mktConfig
4. 手动跑 SKILL.md 流程 → `data/outputs/zai-mkt-intelligence-brief.md` 7 板块齐全、每条有 URL、P0-P3、"不建议主动动作"生效
5. `openclaw cron run` → 飞书群收到全量 brief
6. 连跑 3 天 → 覆盖率/空板块/评分稳定性复盘
