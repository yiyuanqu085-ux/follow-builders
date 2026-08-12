# Z.ai MKT 情报日报 — 实现方案（X API 版）

> 本文是 `Z.ai-MKT-日报实现方案.md`（免费源版）的重写。2026-08 原决策"不订阅 X API"已撤销——用户现持有 X API **bearer token**，**按调用次数计费**。
>
> **方向选择**:贴着上游 `generate-feed.js` 改配置,**不另起炉灶写平行 fetcher**。理由见 `docs/fork与上游follow-builders对比.md`——数据层与上游已无差别,fork 价值全在产品层(7 板块 / 评分 / 中文 / 飞书),数据采集应复用上游而非分叉维护。

## 0. 前提确认(先验证,再动代码)

用户的 X API 是**无档位、纯按次计费**(pay-per-call)——不存在"Free 档只能发推不能读"的档位墙,读推文端点按次付费即可用。但仍需**本地确认 token 对这两个端点确实返回数据**(token 权限范围 / 端点开通情况可能有别):

```bash
X_BEARER_TOKEN=xxx node -e '
const f=async()=>{
  const u=await fetch("https://api.x.com/2/users/by/username/simonw",{headers:{Authorization:`Bearer ${process.env.X_BEARER_TOKEN}`}});
  console.log("users/by",u.status,await u.text());
};
f()'
```

返回 200 + user 对象(含 `id`)→ 继续。再用拿到的 id 验证 `/users/:id/tweets`。返回 403/401/404 → token 没开读权限,需在 X 开发者后台确认端点访问。

---

## 1. 架构总览

```
[fork 的 GitHub Action,每天 22:17 UTC,需要 X_BEARER_TOKEN secret]
  ├─ node generate-feed.js --tweets-only      ← 复用上游脚本,只改 default-sources.json
  │    bearer token 拉 30 KOL 推文 → feed-x.json(同构 {x:[{name,handle,tweets[]}]})
  │    state-feed.json(seenTweets 去重)
  │
  └─ node generate-mkt-feed.js                 ← 精简版,只补上游没有的源
       ├─ fetchArxivAuthors  (Thom_Wolf / Chollet / Jim Fan 论文)  → source_status="arxiv"
       └─ fetchTrending      (HN + GitHub trending + arXiv 热门)     → source_status="trending"
       → feed-mkt.json(signals[])  +  state-mkt-feed.json
         │  commit 回 fork 仓库
         ↓
[zara 上游]  feed-podcasts.json / feed-blogs.json  (免费白嫖;pod2txt 贵,不自建)
         │
         ↓
scripts/prepare-digest.js  (fork 改造)
  → 本地 feed-x.json(自有 30 人)+ 上游 podcasts/blogs + 本地 feed-mkt.json(arxiv+trending)+ mkt-*.json
  → 输出 JSON 到 stdout(无 web_search 路由)
         │
         ↓
SKILL.md Step 4  remix(完全离线,只读 JSON)
  → 按 prompts/digest-intro.md:7 板块 + 做轻判断 + 事实接地 MKT opp + P0-P3
  → 写 data/outputs/zai-mkt-intelligence-brief-{DATE}.md(+ stable .md)
  → stdout → OpenClaw cron → 飞书群(全量 brief)
```

**没有 Step 3.5 了。** web_search 彻底退出,remix LLM 完全离线。

## 2. 相对旧方案(免费源版)改了什么

| 维度 | 旧方案(免费源) | 新方案(X API,贴上游) |
|---|---|---|
| KOL 推文 | 白嫖上游 feed-x(15)+ 自建 RSS/arXiv/GitHub/blog_scrape(14)+ web_search(Aravind) | **复用上游 generate-feed.js + 自有 bearer 拉 30 人** → feed-x.json |
| `generate-mkt-feed.js` | 5 类异构 fetcher,无 secret | **精简到 2 类**:arXiv(3 研究者)+ trending。不碰 X |
| `source_status` | feed/rss/arxiv/github/blog_scrape/trending/web_search | **x / arxiv / trending** |
| SKILL.md Step 3.5 | web_search 前置(唯一联网点) | **删除** |
| `prepare-digest.js` | 混 4 源,含 computeKolsNeedingWebSearch | 混 3 源,删 web_search 路由;feed-x 改读本地 |
| GitHub Action | 无 secret | 新增 `X_BEARER_TOKEN`,跑两个脚本 |
| 数据成本 | $0 | 按 calls:~31 次/天(见 §7) |

**保留不变**:7 板块结构、做轻判断 + 事实接地 MKT opp + P0-P3、飞书全量推送、`data/outputs/` 落盘、OpenClaw cron、podcast/blog 白嫖。

## 3. 数据采集层

### 3.1 X 推文 — 复用上游 `generate-feed.js`

**不改脚本本身**,只改配置 + 加 token:

1. **`config/default-sources.json`**:`x_accounts` 换成 30 人名单(从 `mkt-kols.json` 的 handle 来)。podcasts/blogs 数组留着不动(`--tweets-only` 不读它们)。
2. **GitHub Action** 注入 `X_BEARER_TOKEN`,跑 `node generate-feed.js --tweets-only`。
3. 产物:`feed-x.json`(`{x:[{source,name,handle,bio,tweets[]}]}`,30 人)+ `state-feed.json`(seenTweets 去重,7 天清理)。

上游 `fetchXContent`(`generate-feed.js:523-633`)已具备:
- `/users/by` 批量查 ID(1 次调用查 100 人 → 30 人 = **1 次/天**,不是每人 1 次)
- `/users/:id/tweets`:`max_results=5`、`exclude=retweets,replies`、`start_time=24h`、每人取 3 条新推、`note_tweet` 取全文
- 429 限速 break、200ms 间隔

**user ID 缓存**:上游每次跑都重新查 `/users/by`,但因为是 1 次 batch 调用/天,缓存只省 1 次/天,**不值得为它 patch 上游**。接受每天 1 次 user-lookup。

### 3.2 arXiv + trending — 精简版 `generate-mkt-feed.js`

删除 `fetchRssBlogs` / `fetchScrapedBlogs` / `fetchGithubActivity` 三个 fetcher(X 已覆盖这些 KOL 的推文)。**保留**:

| 函数 | 数据源 | source_status | 理由 |
|---|---|---|---|
| `fetchArxivAuthors` | Thom_Wolf / Chollet / Jim Fan(本名 Linxi Fan)论文 | `arxiv` | 研究者核心产出是论文不是推文,几天才发一条;arXiv 保论文信号,免费不增加 X 调用 |
| `fetchTrending` | HN(Algolia)+ GitHub trending + arXiv 热门 | `trending` | 填 Enterprise/Startup 板块,上游无此源,免费 |

产物 `feed-mkt.json` 的 `signals[]` 现在只含 `arxiv` + `trending` 两类。state、makeSignal、parseFeed、tagTopics 等工具保留。

### 3.3 `mkt-sources.json` 瘦身

删除 `rss_blogs` / `scraped_blogs` / `github_accounts` 三个数组;只留 `arxiv_authors`(3 人)+ `trending`。

## 4. 配置变更

### `config/default-sources.json`
`x_accounts` → 30 人(含原 add_kols 的 rowancheung / gregisenberg / aligodsi / sramasw,现在直接进名单由 X 拉取,不再走 web_search)。

### `config/mkt-kols.json`
全部 30 人 `source` / `source_status` → `"x"`。`tier` / `status` / `zai_angle` 保留(Peter Yang 仍 `deprioritize`、thsottiaux 仍 `monitoring`,由 remix 决定入选)。3 个研究者的 arXiv 信号由 generate-mkt-feed.js 按 kol 名匹配产出,`source_status=arxiv`,不在此文件特殊标记。

### `~/.follow-builders/local-overrides.json`
- `remove_handles`(petergyang):**保留**,prepare-digest 运行时从 `feedX.x` 过滤。
- `add_kols`:**失效弃用**。X 时代直接编辑 `default-sources.json` 加人即可,不再需要 web_search 路由那些 add_kols。用户若想快速加人,改名单 + commit。

## 5. 打包层 — `prepare-digest.js` 改造

| 改动 | 细节 |
|---|---|
| **feed-x 改读本地** | 新增 `loadFeedX()`:本地 `feed-x.json` 优先(同 `loadMktFeed` 模式),fallback `FEED_X_URL` env。**不再硬编码 zara 的 raw URL**——feed-x 现在是 fork 自己产的。 |
| 保留 podcasts/blogs 白嫖 | `FEED_PODCASTS_URL` / `FEED_BLOGS_URL` 仍指 zara,不变 |
| **删 `computeKolsNeedingWebSearch`** | 整个函数 + `kolsNeedingWebSearch` 输出字段 + add_kols→web_search 路由(:106-131, :171-214)全删。30 人都被 X 覆盖,恒空 |
| `remove_handles` 过滤 | 保留,仍作用于 `feedX.x`(:215-221) |
| `mktSignals` | 来自 feed-mkt.json,现仅 arxiv + trending |
| `stats` | `mktSignalsByStatus` 只会出现 `arxiv` / `trending`;删 `kolsNeedingWebSearch` 计数 |

## 6. SKILL.md 改造

- **删除 Step 3.5**(web_search 前置)整段(:349-378 附近)。
- Step 2 JSON 描述:去掉 `kolsNeedingWebSearch`;`mktSignals` 说明改为"arXiv 论文 + trending,非推文信号"。
- Step 4 remix 源:`x`(30 人推文)+ `blogs` + `podcasts` + `mktSignals`(arxiv+trending)。完全离线(SKILL.md:366 防编造规则不变,且现在无任何联网步骤)。
- Step 3 content-check 空判(`stats.xBuilders===0 && mktSignals===0 && podcasts===0`):逻辑不变,xBuilders 现在是 30 人。
- OpenClaw cron message(:226, :236):删掉 "run the Step 3.5 web_search pre-step" 那句,改为 "execute prepare-digest.js, remix all sources into the 7-section brief..."。
- `source_status` 档位说明:从 feed/rss/arxiv/github/blog_scrape/web_search 收敛为 **x / arxiv / trending**。

## 7. 成本(纯按次计费,无档位)

无档位 = 无月度配额墙,成本纯粹 = 调用次数 × 单次单价。调用次数:

| 计费项 | 频次 | 每月(30 天) |
|---|---|---|
| `/users/by` 批量查 ID | 1 次/天(batch 100 人,30 人一炮) | 30 次 |
| `/users/:id/tweets` 推文拉取 | 30 KOL × 1 次/天 | 900 次 |
| **合计** | ~31 次/天 | **~930 次/月** |

> 月费 = 930 × 单次单价。**单次单价以 X 开发者后台账单为准**(用户尚未提供)。按旧估算 `docs/X-API-月度费用估算.md` 的量级参考,若单次落在 $0.01-0.03,月费约 $9-28。
>
> **省钱杠杆**(若单价高):Tier C 四人(petergyang/thsottiaux/nikunj/adityaag)隔天拉 → 减 ~60 次/月;或对低频 KOL 用更长 lookback + 去重复用(同一推文不重复拉)。`MAX_TWEETS_PER_USER` 只影响返回条数,按次计费下不影响调用次数、不省钱。

## 8. GitHub Action 改造

`.github/workflows/generate-feed.yml`:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with: { node-version: '20' }
  - run: cd scripts && npm install
  - name: Generate X feed (upstream script, own token)
    env: { X_BEARER_TOKEN: \${{ secrets.X_BEARER_TOKEN }} }
    run: cd scripts && node generate-feed.js --tweets-only
  - name: Generate MKT extra feed (arxiv + trending, no secret)
    run: cd scripts && node generate-mkt-feed.js
  - name: Commit and push
    run: |
      git config user.name "github-actions[bot]"
      git config user.email "github-actions[bot]@users.noreply.github.com"
      git add feed-x.json state-feed.json feed-mkt.json state-mkt-feed.json
      git diff --cached --quiet || git commit -m "chore: update feeds [skip ci]"
      git push
```

- 需在 fork 仓库 Settings → Secrets 添加 `X_BEARER_TOKEN`。
- cron `17 22 * * *`(6:17 上海)不变。
- 注释更新:"需要 X_BEARER_TOKEN;复用上游 generate-feed.js 拉推文,generate-mkt-feed.js 只补 arxiv+trending"。

## 9. 迁移步骤

1. **验证端点**(§0):本地确认 bearer 能读 `/users/by` + `/users/:id/tweets`,返回非空。
2. **改 `default-sources.json`**:x_accounts → 30 人(含 4 个原 add_kols)。
3. **本地跑 `generate-feed.js --tweets-only`**:确认 `feed-x.json` 含 30 人、去重生效、连跑两次无重复。
4. **精简 `generate-mkt-feed.js`**:删 3 个 fetcher,留 arxiv + trending。本地跑确认 `feed-mkt.json` 只剩 arxiv+trending。
5. **改 `mkt-kols.json`**:全部 source/source_status → `x`。
6. **改 `mkt-sources.json`**:删 3 个数组,留 arxiv_authors + trending。
7. **改 `prepare-digest.js`**:feed-x 改本地读取;删 computeKolsNeedingWebSearch + add_kols 路由。
8. **改 `SKILL.md`**:删 Step 3.5;Step 4 源 4→3 现为 x/blogs/podcasts/mktSignals;cron message 去 web_search。
9. **改 workflow**:加 X_BEARER_TOKEN env + 跑两个脚本。
10. **端到端**:`prepare-digest.js` → JSON 含 x(30)+podcasts+blogs+mktSignals(arxiv/trending)、无 kolsNeedingWebSearch → 手动 remix → `data/outputs/` 7 板块齐全、每条有 URL + P0-P3 → 飞书测试推送。

## 10. 风险与注意

1. **bearer 端点访问**(§0):无档位墙,但仍需验证 token 对 `/users/by` + `/users/:id/tweets` 返回数据(确认端点已开通读权限)。
2. **研究者信号**:Thom_Wolf/Chollet/Jim Fan 靠 arXiv 补论文;其余 KOL 若当天不发推则无信号( inherent to daily tweet brief,可接受)。
3. **trending 仍需 LLM 过滤**:HN/GitHub trending 内容杂,remix 按 mkt-topics/competitors 过滤逻辑不变。
4. **fork 仍需 public**:prepare-digest 裸 fetch 上游 podcasts/blogs raw,私有仓库读不到。
5. **上游 generate-feed.js 演进**:本方案不改它的代码,只改 default-sources.json;上游更新时 merge 低冲突。若上游改了 `--tweets-only` 行为或 feed-x.json schema,需同步检查 prepare-digest 的读取。
6. **state 文件分家**:`state-feed.json`(seenTweets,generate-feed.js 用)与 `state-mkt-feed.json`(seenMktSignals + arxiv/trending 去重,generate-mkt-feed.js 用)独立,互不干扰。
