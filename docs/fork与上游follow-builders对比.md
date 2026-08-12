# Fork 与上游 follow-builders 的区别（X API 版）

> 背景:fork 原本靠"免费源绕开 X API"建立数据层差异化。2026-08 拿到 X API bearer token 后,数据采集层与上游 [zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders) 趋同,差异转移到产品层。本文记录逐层对比与架构含义,作为 X API 重写方向的选择依据。

## 逐层对比

| 层 | 上游 follow-builders | fork（免费源版,现状） | fork（X API 修订版） |
|---|---|---|---|
| **X 推文采集** | `generate-feed.js` + bearer token → `feed-x.json`（25 人） | 不碰 X,白嫖上游 `feed-x.json` 15 人 | 自有 bearer 拉推文 → 同构 `feed-x.json`（与上游同路径） |
| **播客** | pod2txt | 白嫖上游 | 白嫖上游（不变） |
| **博客** | 爬 Anthropic / Claude blog | 白嫖上游 | 白嫖上游（不变） |
| **arXiv / trending** | 无 | 自建 | 保留 |
| **KOL 名单** | `default-sources.json` 25 个 builder | `mkt-kols.json` 30 人 + tier/angle/status | 30 人（不变） |
| **remix prompt** | AI Builders Digest（英文,通用摘要） | 7 板块 MKT 情报（中文,P0-P3） | 7 板块（不变） |
| **评分 / 主题 / 竞品配置** | 无 | 6 个 mkt config 文件 | 保留（不变） |
| **KOL 每日重排** | 无 | "to add / deprioritize" | 保留（不变） |
| **交付** | stdout | OpenClaw → 飞书全量 | 飞书（不变） |

## 真正的区别在哪

数据层基本无差别。fork 的价值全在**产品层**,且均为上游所没有:

1. **7 板块 MKT 情报结构**（不是 builder 摘要）+ 中文输出
2. **MKT 相关性评分** P0-P3,加权:Z.ai 产品 30% / dev 生态 20% / startup 15% / enterprise 15% / KOL 影响力 10% / 新鲜度 10%
3. **30 人 KOL 名单 + tier / zai_angle**,每日重排输出"建议加入 / 建议降权"
4. **arXiv + trending 额外源**（填 Enterprise / Startup 板块,上游无）
5. **主题 / 竞品 / 观察名单配置驱动打标**
6. **飞书全量推送**

## 架构含义:数据层别再维护平行实现

`generate-mkt-feed.js` 当初作为独立平行 fetcher 存在的唯一理由是"不订阅 X API"。现在 X API 到位,它与上游 `generate-feed.js` 走同一条路,平行实现失去意义,且会随上游演进而分叉、增加维护成本。

**推荐方向:贴着上游改配置,而不是另起炉灶写 fetcher。**

- **X 推文**:fork 里直接跑上游 `generate-feed.js`,只改 `config/default-sources.json`——把 `x_accounts` 换成 30 人名单,注入自己的 `X_BEARER_TOKEN`。`feed-x.json` 自动产出 30 人推文,零额外代码。
- **arXiv / trending**:往 `generate-feed.js` 加两个 fetcher,或单独小脚本只产 `feed-mkt.json` 装 trending,不重写整套。
- **podcast / blog**:继续白嫖上游（zara 的 token 在跑）,不自己出 pod2txt 钱。

这样 fork 差异收敛成**纯配置 + prompt + 交付**三块:

| 改动对象 | 内容 |
|---|---|
| `config/default-sources.json` | 换成 30 人 KOL 名单 |
| `prompts/digest-intro.md` | 7 板块 + 中文 + P0-P3 |
| `SKILL.md` | 飞书 cron、Step 3.5 删除 |
| `config/mkt-*.json` | 主题 / 评分 / 竞品 / 观察名单 |

上游更新时直接 merge,不养会分叉的平行 fetcher。

## 一句话结论

> 用了 X API,fork 跟上游 follow-builders 在"怎么抓数据"上没区别了;区别全在"抓谁、怎么评、怎么排、怎么推、给谁看"。方案应贴着上游改配置,而不是另起炉灶写 fetcher。

## 待确认前提

1. **bearer token 档位能读 `/users/:id/tweets`**:Free 档只能发推不能读,需 Basic 或以上。本地先验证端点再动代码。
2. **按次计费的单次单价**:决定 30 人 ×1 次/天的月成本,以及 `MAX_TWEETS_PER_USER` 设 3 还是更低。
