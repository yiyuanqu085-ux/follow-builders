**AI Builders Digest — 2026年7月10日**

**X / TWITTER**

**Swyx (swyx on X)**
大部分 agent 实验室对使用中国模型讳莫如深，因为要向政府/国防部门销售。Swyx 指出 Cognition 团队做了一件难而正确的事：构建了多语言宣传与审查评估体系，在 post-training 阶段成功修正了偏见问题，并以 1000 tok/s 的低成本提供服务。对于想在合规前提下使用高性价比模型的人来说，这是一个值得参考的工程范例。
https://x.com/swyx/status/2074919183947808881

**Claude Code 负责人 Boris Cherny (bcherny on X)**
Claude Code 新增了 /checkup 命令，一键清理未使用的 skills/MCPs/plugins 释放上下文空间，去重本地与仓库中的 CLAUDE.md，将根级 CLAUDE.md 拆分为嵌套结构，关闭慢速 hooks，更新版本，默认启用 auto mode 并预批准常用只读命令。每个操作都会先确认再执行。这条推获得了 6631 个赞和 519 次转发，社区反响热烈。
https://x.com/bcherny/status/2074997570317779038

**Anthropic 的 Cat Wu (_catwu on X)**
Cat Wu 主持了一场关于 Claude Tag 的直播演示，展示了从单人 Claude Code 到多人协作 Claude Tag 的演进。AI 从最初帮你完成句子，到后来能写整个功能，现在 Claude Tag 可以监控频道、主动执行任务，整个团队都能指挥它，并且它能记住上周告诉它的内容。这是 agent 从单兵作战走向团队协作的重要一步。
https://x.com/_catwu/status/2074925531519468012

**Anthropic 的 Thariq (trq212 on X)**
Thariq 提出一个应改变软件工程认知的观点：在 AI 时代，代码重写可以变得又好、又便宜、又快速。虽然大多数应用无法像 Bun 那样高度可测试，但模型会持续填补这些空白。这挑战了"不要重写"的传统工程智慧。
https://x.com/trq212/status/2074993112217461020

**Replit CEO Amjad Masad (amasad on X)**
Amjad 发出一个值得深思的类比：我们什么时候才能停止拿自主 agent 和手写代码做比较？你不会看到编译器被拿来和工程师手写汇编做比较。暗示 agent 生成代码应该被视作一种新的编程范式，而非手写代码的低劣替代品。
https://x.com/amasad/status/2075080984211624154

**Vercel CEO Guillermo Rauch (rauchg on X)**
Grok 4.5 现已向所有 Vercel 客户开放，这是 xAI 模型首次通过 Vercel 平台面向更广泛的开发者社区。同时 Rauch 预测 AI 将使所有软件 Native 化——实现无妥协的性能与平台亲和力。他还展示了 agent 堆栈各个组件协同工作的成果，将用于驱动他的个人生产力 agent。
https://x.com/rauchg/status/2074920996201796067
https://x.com/rauchg/status/2075018147330232707

**Box CEO Aaron Levie (levie on X)**
Levie 评论最新一代 AI 模型（包括 Grok 4.5）在处理复杂知识工作方面的惊人进步，特别是在法律、专业服务和医疗等垂直领域。随着模型在编码、数学和推理能力上的提升，并在关键领域进行训练，企业数据和文档将释放出更大的价值。
https://x.com/levie/status/2075073587015516228

**FirstMark VC Matt Turck (mattturck on X)**
Matt 观察到这届世界杯同时也是 AI 生成内容从"垃圾"到"竟然还不错"的分水岭。这条推获得了 974 个赞和 82 次转发，反映了人们对 AI 内容质量改观的普遍感受。
https://x.com/mattturck/status/2074908816274034896

**Builder Zara Zhang (zarazhangrui on X)**
Zara 采访了一位深度使用 agent 的创始人——他为全团队购买了 Codex Max，大家通过和 Codex 对话完成工作。副作用是：团队成员不再互相交流，会议取消，协作最小化，团队文化恶化。Zara 提出我们需要的不是单纯的人机协作，而是"人-人-agent"三方协作模式。另外她直言 Codex 的前端设计能力是目前阻止她更频繁使用它的最大障碍。
https://x.com/zarazhangrui/status/2075004775436005687
https://x.com/zarazhangrui/status/2075003007520096416

**FPV Ventures 合伙人 Nikunj Kothari (nikunj on X)**
Nikunj 观察到开发者每周在 Codex 和 Claude Code 之间摇摆——"这周我们完了，下周我们又回来了"，两个团队的互相竞争让用户受益。他还指出"精致"正在和"AI 垃圾内容"画等号，预计我们将看到一次向原始、人性化内容的重大回归。
https://x.com/nikunj/status/2074878958525657452
https://x.com/nikunj/status/2075033190708961675

**OpenClaw 创始人 Peter Steinberger (steipete on X)**
Peter 正式宣布 OpenAI 雇佣了他本人而非 OpenClaw。OpenClaw Foundation 将保持独立，由赞助商而非所有者支持，并首次拥有全职团队维护这个龙虾吉祥物的稳定运行。这一安排既保障了开源项目的独立性，又允许他个人全职投入 OpenAI 的工作。
https://x.com/steipete/status/2075046949896736835

**South Park Commons GP Aditya Agarwal (adityaag on X)**
Aditya 呼吁创始人不要浪费这波 AI 浪潮。他直言 South Park Commons 的 Founder Fellowship 现在想要的是硬件极客、疯狂科学家、生物黑客、在自家 basement 造核反应堆的人。如果只做纯软件，你的 thesis 必须让所有朋友都嘲笑你——"异端是野心的代价"。
https://x.com/adityaag/status/2074892507306238235

**OFFICIAL BLOGS**

**Anthropic Engineering：Claude Code 质量问题的完整复盘**
Anthropic 发布了一份详细的 postmortem，追溯了 3-4 月间用户报告的 Claude 响应质量下降问题。根因追溯到三个独立的变更：将默认 reasoning effort 从 high 降为 medium（为减少延迟）、清空闲置会话中旧 thinking 的 bug（导致模型健忘和重复）、以及为减少冗余而添加的 system prompt（意外降低了编码质量）。三个问题互不相同，影响的时间段和流量切片也不同，导致整体看起来像是随机的质量退化。所有问题已于 4 月 20 日修复。这是一份难得的透明度示范——大公司如何追溯、诊断和修复复杂的生产环境 AI 回归问题。
https://www.anthropic.com/engineering/april-23-postmortem

**Anthropic Engineering：Managed Agents 的架构哲学——将大脑与双手解耦**
Anthropic 详细介绍了 Managed Agents 的设计理念：将 agent 抽象为 session（只追加的事件日志）、harness（调用 Claude 并路由工具调用的循环）和 sandbox（执行环境）三个虚拟化组件。这种解耦使得底层实现可以独立演进——就像操作系统的 read() 命令无论面对 1970 年代的磁盘还是现代 SSD 都能工作一样。文章特别指出，之前为 Claude Sonnet 4.5 添加的 context reset 在 Opus 4.5 上变成了"死重"（dead weight），说明 agent harness 需要随模型能力持续进化。
https://www.anthropic.com/engineering/managed-agents

**Claude Blog：Managed Agents 新增自托管 sandbox 与 MCP 隧道**
Claude Managed Agents 现在可以在企业自己的基础设施中执行工具，并通过 Model Context Protocol (MCP) 隧道连接到私有服务。支持 Cloudflare、Daytona、Modal、Vercel 等托管提供商。工具执行移入企业环境的同时，负责编排和上下文管理的 agent loop 仍保留在 Anthropic 基础设施上。企业内部网络策略、审计日志和安全工具可以正常运作，敏感文件和代码库不会离开企业边界。自托管 sandbox 目前为公开 beta，MCP 隧道为 research preview。
https://claude.com/blog/claude-managed-agents-updates

**PODCASTS**

**AI & I by Every：作家如何在 AI 时代不失自己的声音**
一位作家分享了他与 AI 共存的独特哲学——早晨醒来绝不碰互联网，直到午饭后才上线。他专门准备了一台只用于写作的笔记本电脑，屏蔽一切有趣的功能。他观察到使用 AI 的过程带有强烈的多巴胺驱动特性，像一台老虎机。他认为自己最珍贵的价值在于那些"奇怪的书"——没有多少人会去思考和写作的内容。为了保护这种创造力，他必须主动建立数字屏障。这场讨论的核心矛盾在于：AI 既是强大的创作工具，也是注意力的掠夺者。
https://www.youtube.com/watch?v=7ND0lQmLJlA

由 Follow Builders 生成: https://github.com/zarazhangrui/follow-builders
