# KOL 免费源覆盖清单

> 目标:不订阅 X API,评估 15 个缺失 KOL 能否从免费公开渠道拿到近期高价值内容。
> 全部来源经实际抓取页面验证(非凭印象)。更新日期:2026-08-11。

---

## 覆盖总表

| # | KOL | 角色 | 最佳免费源 | RSS? | 可靠度 | 建议 source_status |
|---|---|---|---|---|---|---|
| 1 | Simon Willison | 工程师/技术写作 | 博客 simonwillison.net(日更)+ GitHub | ✅ Atom | 🟢 high | `rss` |
| 2 | Harrison Chase | LangChain 创始人 | LangChain 官博(他署名) | ❌ 抓HTML | 🟡 medium | `blog_scrape` |
| 3 | Clem Delangue | HuggingFace CEO | HF 个人主页 + HF 官博 | ✅ HF RSS | 🟢 high | `rss` |
| 4 | Thomas Wolf | HF 联创/研究 | arXiv(高频)+ HF 主页 + GitHub | ✅ arXiv/Atom | 🟢 high | `rss` |
| 5 | Logan Kilpatrick | Google DeepMind DevRel | Google AI 官博 RSS + GitHub | ✅ RSS | 🟡 medium | `rss` |
| 6 | Aravind Srinivas | Perplexity CEO | 仅 Google News(官博封爬虫) | — | 🔴 low | `web_search` |
| 7 | Ethan Mollick | Wharton 教授 | "One Useful Thing" Substack(周更) | ✅ /feed | 🟢 high | `rss` |
| 8 | Andrew Ng | 教育/投资 | DeepLearning.AI《The Batch》(周更) | ❌ 抓网页 | 🟡 medium | `blog_scrape` |
| 9 | Sarah Guo | Conviction 投资人 | saranormous Substack(月更) | ✅ /feed | 🟡 medium | `rss` |
| 10 | Deedy Das | Menlo Ventures 投资人 | Menlo 博客 + GitHub(活跃) | ✅ /feed | 🟢 high | `rss` |
| 11 | Allie K. Miller | AI 顾问 | "AI with ALLIE" newsletter(周更) | ❌ 抓网页 | 🟢 high | `blog_scrape` |
| 12 | Lenny Rachitsky | 产品社区 | Lenny's Newsletter Substack(周更) | ✅ /feed | 🟢 high | `rss` |
| 13 | François Chollet | 研究员/评测 | arXiv(15篇)+ ARC Prize + GitHub | ✅ arXiv | 🟢 high | `rss` |
| 14 | Jim Fan | NVIDIA 研究员 | arXiv(61篇,本名 Linxi Fan)+ NVIDIA Research | ✅ arXiv | 🟢 high | `rss` |
| 15 | Thibault Sottiaux | AI coding builder | GitHub(OpenAI Codex,活跃) | ✅ Atom | 🟡 medium | `rss` |

---

## 覆盖率结论

| 档位 | 人数 | 名单 |
|---|---|---|
| 🟢 high | 9 | Simon Willison、Clem、Thomas Wolf、Ethan Mollick、Deedy、Allie、Lenny、Chollet、Jim Fan |
| 🟡 medium | 5 | Harrison Chase、Andrew Ng、Sarah Guo、Logan Kilpatrick、Thibault |
| 🔴 low | 1 | Aravind Srinivas |

**15 人里 14 个能靠免费源覆盖,只有 1 个(Aravind)真正难覆盖。**

---

## 验证过的可用源 URL

### 🟢 high(直接可用)

| KOL | 源 | URL |
|---|---|---|
| Simon Willison | 博客 Atom | `https://simonwillison.net/atom/everything/` |
| Simon Willison | GitHub 活动 | `https://github.com/simonw.atom` |
| Clem Delangue | HF 个人主页 | `https://huggingface.co/clem` |
| Clem Delangue | HF 官博 RSS | `https://huggingface.co/blog/feed.xml` |
| Thomas Wolf | HF 主页 | `https://huggingface.co/thomwolf` |
| Thomas Wolf | arXiv | `https://arxiv.org/a/wolf_t_3` |
| Thomas Wolf | GitHub | `https://github.com/thomwolf.atom` |
| Ethan Mollick | Substack RSS | `https://www.oneusefulthing.org/feed` |
| Deedy Das | Menlo 博客 RSS | `https://menlovc.com/feed/` |
| Deedy Das | GitHub | `https://github.com/deedy` |
| Allie K. Miller | Newsletter | `https://www.aiwithallie.com/`(无 RSS,抓归档页) |
| Allie K. Miller | YouTube | `https://www.youtube.com/@AKMofficial` |
| Lenny Rachitsky | Substack RSS | `https://lennysnewsletter.com/feed` |
| François Chollet | arXiv | `https://arxiv.org/search/?searchtype=author&query=chollet+francois` |
| François Chollet | ARC Prize | `https://arcprize.org` |
| François Chollet | GitHub | `https://github.com/fchollet` |
| Jim Fan | arXiv(本名) | `https://arxiv.org/search/?searchtype=author&query=Linxi+Fan` |
| Jim Fan | NVIDIA Research | `https://research.nvidia.com/person/linxi-jim-fan` |
| Jim Fan | GitHub | `https://github.com/DrJimFan` |

### 🟡 medium

| KOL | 源 | URL | 备注 |
|---|---|---|---|
| Harrison Chase | LangChain 博客 | `https://www.langchain.com/blog/` | 无 RSS,抓 HTML |
| Harrison Chase | GitHub | `https://github.com/hwchase17.atom` | 活跃 |
| Logan Kilpatrick | Google AI 博客 RSS | `https://blog.google/technology/ai/rss/` | 已验证可用,日更,Gemini API 内容 |
| Logan Kilpatrick | GitHub | `https://github.com/logankilpatrick.atom` | 活跃,偏工程 |
| Andrew Ng | The Batch | `https://www.deeplearning.ai/the-batch/` | 周更,无 RSS,抓网页 |
| Andrew Ng | YouTube | `https://www.youtube.com/@Deeplearningai` | |
| Andrew Ng | GitHub | `https://github.com/andrewyng` | 活跃 |
| Sarah Guo | Substack RSS | `https://saranormous.substack.com/feed` | 月更 |
| Thibault Sottiaux | GitHub | `https://github.com/thsottiaux.atom` | 活跃,OpenAI Codex |

### 🔴 low

| KOL | 可用源 | 备注 |
|---|---|---|
| Aravind Srinivas | Google News RSS:`https://news.google.com/rss/search?q=Aravind+Srinivas&hl=en-US&gl=US&ceid=US:en` | Perplexity 官博 403 封爬虫;LinkedIn 封爬虫;播客访谈零散(Lex Fridman/20VC/Lenny's)。非 X 一手渠道都难抓。 |

### 通用兜底(全部 15 人可用)

Google News RSS(人名搜索):`https://news.google.com/rss/search?q={人名}&hl=en-US&gl=US&ceid=US:en`
——只是新闻提及、非一手产出,作最低保障。

---

## 实现分工

### 有 RSS,接入成本低(10 人)
Simon Willison、Clem、Thomas Wolf、Ethan Mollick、Sarah Guo、Deedy、Lenny、Chollet、Jim Fan、Thibault、Logan
→ 直接用 `generate-feed.js` 现有博客/RSS 抓取逻辑加配置。其中 arXiv 类(Thomas Wolf、Chollet、Jim Fan)需新增一个 arXiv 抓取器(arXiv 有标准 RSS/API,简单)。

### 无 RSS,需写 HTML 解析器(3 人)
Harrison Chase(LangChain 博客)、Andrew Ng(The Batch)、Allie Miller(newsletter)
→ 每个站写一段解析器,跟现在抓 Anthropic 博客那套一样。

### 难覆盖,降级处理(1 人)
Aravind Srinivas:接受频繁 `no_recent_signal`,靠 Google News RSS + 偶尔播客访谈;或降级为观察池,考虑替换成更易覆盖的 AI 应用层 KOL。

---

## 关于"是否只在 X 上"的澄清

两个人都不是只在 X 上:
- **Logan Kilpatrick**:有 Google AI 官博 RSS(强源,已验证)+ 活跃 GitHub。已从 low 升级到 medium。
- **Aravind Srinivas**:有 Perplexity 官博、LinkedIn、播客访谈,但官博封爬虫、LinkedIn 封爬虫、播客零散。是 15 人里唯一真正难免费覆盖的。
