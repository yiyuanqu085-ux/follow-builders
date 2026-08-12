# Z\.ai MKT Daily Intelligence Brief 产品优化需求

## 1\. 背景



当前早报基于开源项目 `follow-builders`，主要跟踪 AI builders 在 X/Twitter、podcast、公司 blog 上的动态。现有输出更接近 “AI Builders Digest”，对 Z\.ai MKT 的帮助有限。



Z\.ai MKT 需要的不是泛 AI 新闻汇总，而是一个每日情报工具，帮助团队判断：



1. 今天哪些 AI 信号值得关注。

2. 谁在讨论这些信号。

3. 这些人和内容是否与 Z\.ai 有关。

4. MKT 应该采取什么动作。

    

产品定位从：



```Plain Text
Follow Builders, Not Influencers.
```



升级为：



```Plain Text
Follow Builders, Buyers, Creators, and Decision-Makers.
```



## 2\. 优化目标



每日早报需要服务 Z\.ai 国际市场、KOL/creator relations、开发者生态、startup GTM、enterprise GTM、竞品情报和品牌机会。



核心问题：



1. **What happened in AI today?**

模型、agent、coding、基础设施、AI 应用、startup、enterprise AI、开发者生态的重要变化。



2. **Who is talking about it?**

识别 KOL、创始人、工程师、研究员、投资人、产品负责人、企业高管、creator。



3. **Is this relevant to Z\.ai?**

判断是否适合 KOL amplification、开发者合作、startup 合作、enterprise lead、活动嘉宾、podcast 嘉宾、co\-marketing 或竞品监控。



4. **What should MKT do?**

每条重要信息需要给出可执行建议，不能只做摘要。



## 3\. 当前问题



### 3\.1 KOL 逻辑过于静态



当前 Follow Builders 固定跟踪一批历史 AI builders，例如 Swyx、Peter Yang、Thibault、Madhu、Guillermo Rauch、Aaron Levie、Matt Turck、Zara Zhang 等。



问题：



1. 固定名单会让日报重复出现同一批人。

2. 一些历史 KOL 当前热度或相关性下降，例如 Peter Yang 不应默认占据日报位置。

3. 新出现的 agent、coding、open\-source model、enterprise AI、developer tools 相关 KOL 需要进入 watchlist。

    

要求：



1. 保留 seed KOL list，但不能作为固定白名单。

2. 每日根据内容相关性、近期活跃度、Z\.ai 相关性重新排序。

3. 对低相关 KOL 标记 `monitoring` 或 `deprioritize`，不要自动删除。

4. 输出 `KOLs to add` 和 `KOLs to deprioritize`，供 MKT 人工复核。

    

### 3\.2 缺少 Enterprise AI



当前早报偏 startup、builder、developer。Z\.ai MKT 还需要 Enterprise AI 视角。



需要新增 Enterprise AI Radar，跟踪：



1. 企业 AI 部署。

2. AI agents in production。

3. AI coding 在企业内的采用。

4. 私有化部署、on\-prem、sovereign AI。

5. AI security、governance、权限、数据接入。

6. 企业模型评测、采购、成本优化。

7. CIO、CTO、CDO、VP AI、Head of AI 等买方角色观点。

    

不要把 Enterprise AI 做成泛财经新闻。只有和 AI 采用、模型部署、agent、基础设施、安全、治理有关时才进入。



### 3\.3 缺少 MKT 解释和行动建议



现有摘要通常只回答 “发生了什么”，没有回答 “为什么 Z\.ai 应该关心”。



每条重要信号应拆成：



```Plain Text
Fact:
原始事实，来自 KOL、公司、podcast、媒体或项目页。

Interpretation:
为什么这条信息在行业里有意义。

Why it matters to Z.ai:
与 Z.ai 产品、开发者生态、startup GTM、enterprise GTM、竞品监控的关系。

MKT opportunity:
可执行动作。没有动作就明确写“不建议主动动作”。
```



## 4\. 新早报结构



输出标题：



```Plain Text
Z.ai MKT Intelligence Brief — YYYY-MM-DD
```



### 4\.1 Top AI Signals



5\-8 条最高价值信号。



每条包含：



```Plain Text
Headline
Fact
Interpretation
Why it matters to Z.ai
MKT opportunity
Score / Priority
Source links
```



主要覆盖：



1. 模型和 API。

2. agent / coding agent。

3. 开源模型和模型路由。

4. 开发者生态。

5. startup 和投资信号。

6. enterprise AI。

7. 竞品动向。

    

### 4\.2 KOL Radar



5\-12 条当天高价值 KOL 内容。



不要因为某人在历史名单里就固定展示。需要优先展示：



1. 当天内容和 Z\.ai 有明确关系。

2. 有事实增量。

3. 对开发者、startup、enterprise 或竞品监控有价值。

    

每条包含：



```Plain Text
Name / handle
Role / organization
Summary
MKT relevance
Recommended action
Original link
```



### 4\.3 KOL Outreach Opportunities



3\-5 个当天值得跟进的人。



字段：



```Plain Text
KOL:
Topic:
Why now:
Z.ai angle:
Recommended action:
```



动作枚举：



```Plain Text
Monitor
Engage
Reply
Follow
DM
Partnership outreach
Invite to event
Invite to podcast
Send product access
```



不要伪造联系方式。



### 4\.4 Startup \& Developer Ecosystem



5\-8 条。



重点：



1. 新 AI startup。

2. agent startup。

3. AI coding startup。

4. AI infra startup。

5. 开源 AI 项目。

6. 开发者工具。

7. 模型采用或模型切换。

    

每条尽量包含：



```Plain Text
Company / project
What they do
Why Z.ai should care
Potential partnership opportunity
Source
```



### 4\.5 Enterprise AI Radar



5\-8 条。



重点：



1. enterprise AI adoption。

2. AI agents in production。

3. private / on\-prem deployment。

4. AI security / governance。

5. data access / permissions。

6. model evaluation / procurement。

7. cost optimization。

    

每条包含：



```Plain Text
Enterprise signal
Potential Z.ai relevance
Recommendation
Source
```



### 4\.6 Podcasts / Long\-form



3\-5 条，不要总结所有长内容。



优先：



1. AI founders。

2. AI researchers。

3. enterprise AI leaders。

4. investors。

5. product leaders。

    

### 4\.7 Watchlist



包含三部分：



```Plain Text
KOLs to add
KOLs to deprioritize
Topics to monitor
```



`KOLs to add` 只推荐人，不推荐公司官方账号或 podcast 名称。  

`KOLs to deprioritize` 不自动删除 KOL，只提示 MKT 复核。



## 5\. KOL 机制要求



### 5\.1 KOL 配置字段



技术需要支持配置文件：



```Plain Text
config/mkt-kols.json
```



字段：



```JSON
{
  "name": "Example Person",
  "handle": "example",
  "x_url": "https://x.com/example",
  "organization": "Example AI",
  "role": "Founder / Engineer / Investor / Creator / Enterprise Executive",
  "category": ["AI Coding", "Agents", "Developer Ecosystem"],
  "audience": ["Developers", "Founders", "Enterprise"],
  "region": "US",
  "relevance_to_zai": 5,
  "priority": "A",
  "status": "active",
  "zai_angle": "Why this person matters to Z.ai",
  "review_note": "How MKT should review this person"
}
```



### 5\.2 KOL 分层



```Plain Text
Tier A — Strategic KOLs
Tier B — Emerging / Vertical KOLs
Tier C — Monitoring
```



### 5\.3 KOL 状态



```Plain Text
active
monitoring
deprioritize
replace_candidate
```



### 5\.4 Peter Yang 处理



Peter Yang 当前不应作为默认核心 KOL。



要求：



1. 标记为 `Tier C`。

2. `status` 标记为 `deprioritize`。

3. 只有当当天内容与 Z\.ai 的 agent、coding、developer ecosystem、startup GTM 有明确关系时，才可进入 KOL Radar。

4. 不应因为历史 Follow Builders 名单里有 Peter 就固定出现。

    

## 6\. MKT Relevance Scoring



每条内容计算 MKT relevance score。



建议权重：



```Plain Text
30% Z.ai product relevance
20% developer ecosystem relevance
15% startup GTM relevance
15% enterprise GTM relevance
10% KOL influence
10% freshness / momentum
```



优先级：



```Plain Text
P0 — Must Know
P1 — MKT Relevant
P2 — Interesting
P3 — Noise
```



最终日报主要展示 P0 / P1。



## 7\. Z\.ai 重点主题



### 7\.1 Models 「出新模型及时更新维护」



```Plain Text
GLM
GLM-5.2
open-source LLMs
open-weight models
multimodal models
reasoning models
```



### 7\.2 Coding / Agents



```Plain Text
coding agents
agentic coding
Claude Code
Codex
Cursor
OpenCode
agent frameworks
AI software engineering
MCP
```



### 7\.3 Developer Ecosystem



```Plain Text
API
inference
model serving
developer tools
open-source
benchmarks
Hugging Face
GitHub
agents
```



### 7\.4 Startup



```Plain Text
AI startups
AI founders
startup programs
accelerators
AI application companies
AI infra startups
agent startups
```



### 7\.5 Enterprise



```Plain Text
enterprise AI
private deployment
on-prem AI
sovereign AI
AI transformation
enterprise agents
AI security
AI governance
AI infrastructure
data access
permissions
model evaluation
cost optimization
```



### 7\.6 Competitors



```Plain Text
OpenAI
Anthropic
Google
Meta
xAI
Mistral
DeepSeek
Moonshot / Kimi
MiniMax
Qwen
```



## 8\. 输入来源要求



系统应支持：



1. Follow Builders X / blog / podcast feed。

2. TrendRadar 或类似热点雷达。

3. HN / GitHub / arXiv / YouTube / podcast。

4. 后续接入 X read\-only search。

5. 后续接入 LinkedIn / GitHub / YouTube / Substack 等来源。

    

输入文本应能被转换成统一 signal：



```Plain Text
title
summary
url
source_name
source_region
source_tier
signal_type
published_at
authors
entities
topic_tags
evidence_points
```



## 9\. 过滤规则



不要进入日报：



1. 与 AI 无关的泛财经新闻。

2. 只有情绪、段子、meme，没有事实增量。

3. 与 Z\.ai 没有明确关系的个人动态。

4. 无法核验来源链接的内容。

5. 重复出现的同一 KOL 内容。

6. 公司官方账号不应进入 `KOLs to add`。

7. podcast 名称不应作为 KOL candidate。

    

## 10\. 验收标准



一版合格的 Z\.ai MKT Daily Intelligence Brief 应满足：



1. `Top AI Signals` 有 5\-8 条。

2. `KOL Radar` 有 5\-12 条，且不被 Peter 等历史名单人物固定占位。

3. `KOL Outreach Opportunities` 有 3\-5 条。

4. `Startup & Developer Ecosystem` 有 5\-8 条。

5. `Enterprise AI Radar` 有 5\-8 条。

6. `Watchlist` 明确输出新增候选和降权候选。

7. Peter Yang 默认出现在 `KOLs to deprioritize`，除非当天内容强相关。

8. 每条重点内容有原始 source link。

9. 每条重点内容区分 Fact、Interpretation、Why it matters to Z\.ai、MKT opportunity。

10. 不把 TrendRadar 做成泛新闻搬运，只选择与 Z\.ai 相关的信号。

    

## 11\. 当前建议交付文件



技术侧建议维护：



```Plain Text
config/mkt-kols.json
config/enterprise-watchlist.json
config/startup-watchlist.json
config/competitors.json
config/mkt-topics.json
config/mkt-scoring.json
```



MKT 侧建议维护：



```Plain Text
docs/ZAI_MKT_KOL_LIST.md
```



每日输出：



```Plain Text
data/outputs/zai-mkt-intelligence-brief.md
data/outputs/zai-mkt-intelligence-brief.json
```



