
**AI Builders Digest — 2026年7月17日**

**X / TWITTER**

**Boris Cherny (bcherny on X)** — Claude Code @ Anthropic

Boris Cherny 分享了一篇关于自动化与 agent 开发的深度思考。他认为过去优秀工程师花大量时间优化 vim/emacs 快捷键、编写 lint 规则、搭建端到端测试，这些最高杠杆系数的行为在今天变得更重要。理由有三：第一，基础设施和 DevX 自动化不仅加速你自己，也会加速你运行的每一支 agent 军队；第二，把问题转化为代码（lint 规则、CI 步骤）可以彻底消除某类问题，而不是每次用 token 去修——这正是人们谈论"loop"时的真正含义；第三，自动化让非工程师也能像工程师一样贡献代码，因为 agent 可以导航代码库，而那些过去只能靠人来记忆的领域知识现在可以被编码为基础设施。他认为 agent 带来的真正变化是：可编码的领域知识不再局限于类型、lint 规则和测试，而是可以捕捉更广泛的知识。
https://x.com/bcherny/status/2077460395279692197

**Thibault Sottiaux (thsottiaux on X)** — Codex & ChatGPT @ OpenAI

Thibault 发布了三条重要更新：一是 Codex Plus 和 Pro 用户已取消 5 小时使用限制，他正在向社区征集关于周配额管理的反馈；二是回应了 GPT-5.6 意外删除文件的报告——调查发现这通常发生在全访问模式下且未启用沙箱保护或 auto review 时，模型试图覆盖 $HOME 环境变量定义临时目录然后误删了 $HOME，团队正在更新开发者消息、引导更安全的权限模式并增加额外的 harness 防护；三是提出将 ChatGPT 和 Codex 合并后，下一个该合并什么功能，引发了大量讨论。
https://x.com/thsottiaux/status/2077632589498913087
https://x.com/thsottiaux/status/2077630111499882637
https://x.com/thsottiaux/status/2077627035418239230

**Josh Woodward (joshwoodward on X)** — VP @ Google

Josh 宣布 Gemini Spark 向更多 Ultra 用户开放，并带来了四项新功能：可以打开和编辑 Google Docs（回应了上周的反馈）、可以读取 Google Sheets 和 Slides 中的评论、速度提升超过 50%、支持跨多个来源并行处理。此外，Google 发布了首份 Gemini 东南亚报告，关键发现：活跃用户在过去一年翻倍，70% 的提示以本地语言提交，40% 的提示仅使用语音、图像或视频。
https://x.com/joshwoodward/status/2077471111240204457
https://x.com/joshwoodward/status/2077411104775406045

**Swyx (swyx on X)** — Builder, Cognition, Temporal, AI Engineer

Swyx 对计算机使用（CUA）的进展发表了有力观点。他回顾了自己追踪这一领域的历程——从 2017 年的 World of Bits（Shi, Fan, Karpathy 等人）到 Adept 的早期工作，再到 Anthropic 的 Computer Use 和最近 AI Engineer 峰会的计算机使用赛道。他认为 GPT-5.6 + Superapp 在 CUA 上胜过此前所有方案。他让非技术团队成员尽可能使用 CUA 处理知识工作（注册支付门户、处理演讲者和赞助商数据等），得出的结论是：CUA 进步速度极快，低估其能力是非常危险的认知错误。
https://x.com/swyx/status/2077475285205958771

**Aaron Levie (levie on X)** — Box CEO

Aaron 分享了一场与大型企业 IT 领导者的晚餐讨论笔记，内容涉及企业 agent 落地的关键问题：变更管理仍然是工作流转型的最大挑战，大多数流程需要升级到与现代 agent 兼容的操作模式；IT 团队正在将全栈工程师嵌入业务部门（内部 FDE），让懂技术的人早期参与 agent 实施，可以节省数月甚至数季度的试错时间；技术职能的重要性空前增长，因为 AI 可以影响所有知识工作而非仅 ERP 等少数领域；跨职能 agent 面临复杂的数据建模和权限问题——agent 需要有自己独立的身份和权限，但它们无法自主保证安全；开发类工作的预算远高于非开发类知识工作；越来越多的公司在构建多模型路由系统，根据任务类型在最强模型和低成本模型之间分配工作。
https://x.com/levie/status/2077526010753581156

**Thariq (trq212 on X)** — Claude Code @ Anthropic

Thariq 分享了他的理想 prompt 技术：薄 prompt、厚 artifact 和上下文、薄 skill。他认为软件工程本质上是自动化的职业——引用并赞同 Boris Cherny 关于自动化 multiplier 效应的观点。
https://x.com/trq212/status/2077539537992229076
https://x.com/trq212/status/2077490092290253259

**Peter Yang (petergyang on X)** — AI 教程和访谈创作者

Peter 指出 ChatGPT Live 和 Codex 是两个不会互相通信的出色产品，他认为这是 OpenAI 最大的错失机会。他举例：用 ChatGPT Live 散步时想让它调出 Google Doc，它做不到，但手动触发文档插件后就有了上下文。他建议让 ChatGPT Live 能够使用 Codex 的所有插件、工具和浏览器功能，这样用户可以在一次语音对话中完成回复邮件、安排会议、编辑文档、发布代码等任务。
https://x.com/petergyang/status/2077572198655754583

**Guillermo Rauch (rauchg on X)** — Vercel CEO

Guillermo 分享了 Vercel Sandbox 的最新数据：DAU 月环比增长 100%，每天创建超过 350 万个沙箱。采用 Active CPU 定价模式，为 Notion、Airtable、Meta、Zapier、CodeRabbit 等客户提供服务。同时还展示了 Web Analytics API 的用例：可以让 agent 关联访问者数据、自定义事件与部署和性能指标的变化，或构建自定义前端将数据与 Stripe、Resend 等工具的数据并排展示。
https://x.com/rauchg/status/2077559189015335019
https://x.com/rauchg/status/2077426190386946539

**Peter Steinberger (steipete on X)** — OpenClaw @ OpenAI

Peter 分享了一个犀利观点：如果一个 PR 因为没使用正确的框架而被拒绝，或者设计师构建的新功能因为不符合正确的架构模式而被打回，这些都是自动化的失败。他引用 Boris Cherny 的观点并补充说 GPT-5.6 非常"不留情面"（relentless）。
https://x.com/steipete/status/2077544756390088777
https://x.com/steipete/status/2077614430658191825

**Madhu Guru (realmadhuguru on X)** — Sr Director AI @ Meta

Madhu 提出了一个有趣的概念：当人们意识到一篇文章是 AI 写的时，会产生一种本能的厌恶感。他给出了几个术语建议："semantic nausea"（语义恶心）、"uncanny prose valley"（诡异散文谷）、"synthetic shudder"（合成战栗）。同时他也分享了自己的使用方式：AI 主要用于头脑风暴阶段，最终写作保持人类完成。
https://x.com/realmadhuguru/status/2077413491586253025
https://x.com/realmadhuguru/status/2077414312180932668

**Zara Zhang (zarazhangrui on X)** — Builder

Zara 分享了关于企业 agent 的设计思考：如果想让 agent 在公司内部真正工作，必须把公司设计成 agent 可以读取的样子。她举了 Shopify 的例子——其 agent 没有私人聊天功能，只有公共频道，副作用是促进了同伴学习。此外她分享了自己从未以传统方式学习编程，使用 coding agent 纯粹是创造力和自我表达的行为，GitHub 就是她的 Substack。
https://x.com/zarazhangrui/status/2077417579837309040
https://x.com/zarazhangrui/status/2077388091044635010

**Dan Shipper (danshipper on X)** — Every CEO

Dan 详细介绍了与 Granola CEO Chris Pedregal 的最新对话。关键内容：Granola 并不认为会议笔记是终点，真正的战场是掌握 AI 原生时代人们完成工作的界面。Chris 对竞争的态度是"来得容易去得也快"——三家大公司克隆了 Granola 的核心功能，但他认为会议笔记从来不是真正的奖品。Granola 预先生成数百万个会前简报（大多数用户从不打开），但当用户打开时体验极其惊艳。Granola 正在押注"bring your own agent"策略，认为 API 和 MCP 将在未来几个月大幅改进。
https://x.com/danshipper/status/2077410279474770229

**Sam Altman (sama on X)** — OpenAI CEO

Sam 发推表示惊讶于有些人想要"无声版本"的某样东西，引发了 2542 个点赞和 457 条回复。
https://x.com/sama/status/2077489177374208000

**OFFICIAL BLOGS**

**Claude Blog**

Claude Code 现在支持 artifacts — Claude Code 可以将工作进度捕获为 artifact，将代码会话转化为实时、可分享的视觉页面，包括 PR 走查、系统说明、仪表盘和发布检查清单。Artifact 基于会话的完整上下文构建（代码库、连接器、对话内容），可以整合来自多个来源的信息。当 Claude Code 更新 artifact 时，已打开的页面会原地刷新，团队成员可以看到实时更新。常见用例包括调试调查——工程师在晨会前启动问题调查，Claude Code 处理日志并发布包含时间线、可疑提交和错误率图表的 artifact，分享链接即可让团队查看。
https://claude.com/blog/artifacts-in-claude-code

**PODCASTS**

**AI & I by Every — The Founder of a $1.5B AI Company on What Comes After the First Wave of AI Apps**

核心观点：会议笔记不是终点，AI 应用层的真正战役是争夺人们完成工作的界面。

Granola CEO Chris Pedregal 认为，AI 应用的第一波浪潮才刚刚开始，未来会远大于当前所见。他有一个反直觉的观点：三家大公司克隆了 Granola 的核心功能，但这并不重要——"Easy come, easy go"。会议笔记从来不是真正的奖品，Granola 的真正目标是成为 AI 原生工作界面。至于产品策略，Granola 正在全力押注"bring your own agent"路线，相信 API 和 MCP 将在未来几个月大幅改善。他们预先生成数百万个会前简报，虽然大多数用户从不打开，但当他们打开时体验是神奇的。Chris 还分享了一个真实的感受："我以为创业公司在不顺利的时候很难，结果发现即使一切顺利，创业也依然很难。"
https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL

---

由 Follow Builders 生成: https://github.com/zarazhangrui/follow-builders
