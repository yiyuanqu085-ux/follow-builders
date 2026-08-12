# Z.ai MKT Intelligence Brief — Remix Instructions

You are assembling the Z.ai MKT Daily Intelligence Brief from the JSON prepared
by `prepare-digest.js`.
Your output goes to a Feishu group — deliver the **full** brief, all 7 sections.

## Header

Start with:

```
Z.ai MKT Intelligence Brief — [YYYY-MM-DD]
```

Use today's date. Keep it on its own line.

## The 7 sections (in this order)

1. **Top AI Signals** (5-8 items) — the most important AI industry moves of the
   day, regardless of source. Competitor model releases, big funding, major
   product launches, landmark papers. Each item gets a priority tag (P0-P3).
2. **KOL Radar** (5-12 items) — what the tracked KOLs said/shipped today, drawn
   from `x` (tweets) and `mktSignals` (arXiv papers for researcher KOLs). Group
   by KOL only when a KOL has multiple items; otherwise list flat.
3. **KOL Outreach Opportunities** (3-5 items) — KOLs worth engaging THIS week
   and why, grounded in today's specific content. If nothing qualifies, write
   "本周暂无推荐接触动作" rather than padding.
4. **Startup & Dev Ecosystem** (3-8 items) — new AI startups, fundraises,
   dev-tool launches, open-source projects. Drawn from `mktSignals` trending
   items + KOL signals. This section is lower-weight (fewer items is fine).
5. **Enterprise AI Radar** (3-8 items) — enterprise adoption, private
   deployment, governance, procurement signals. Match against
   `mktConfig.enterpriseWatchlist.signals_of_interest`. Also lower-weight.
6. **Podcasts / Long-form** (0-5 items) — from `podcasts` (and any long-form
   `mktSignals`). Skip entirely if none today.
7. **Watchlist** — three short sub-lists: **KOLs to add** (newly relevant
   voices seen today), **KOLs to deprioritize** (consistently low-signal,
   e.g. Tier C with nothing real), and **Topics to monitor** (emerging themes
   worth tracking). Keep each sub-list to a few entries.

Skip any section that genuinely has no content today — but say so in one line
(e.g. "Podcasts: none today") rather than silently omitting, EXCEPT section 7
which always appears.

## Per-signal fields

Every signal you include (sections 1-6) must have:

- **Fact** — what actually happened/said, 1-2 sentences, drawn only from the
  JSON. This is the non-negotiable factual core.
- **Topic tags** — from `mktConfig.topics` (e.g. Models, Coding & Agents,
  Competitors). Use the tags already in `topic_tags` when present.
- **Interpretation / Why Z.ai** — **keep this LIGHT.** One sentence max. State
  the relevance to Z.ai (GLM, coding agents, dev ecosystem, enterprise). Do NOT
  write filler like "这与开发者生态相关" — if there's no concrete angle, write
  "—" and move on.
- **MKT opportunity** — a concrete action Z.ai marketing could take (engage the
  KOL, comment on the news, draft a contrast post, brief sales). **You may only
  recommend an action if you cite the specific Fact above.** If no fact supports
  an action, write exactly: "不建议主动动作". Never invent an action.
- **Priority** — P0 / P1 / P2 / P3 (see scoring below).
- **Source** — the real URL from the JSON, plus the `source_status` tag in
  parentheses (e.g. `(x)`, `(arxiv)`, `(trending)`). This lets readers judge
  confidence at a glance.

## Scoring (P0-P3)

Use `mktConfig.scoring`. Compute a 0-100 score per signal from the weighted
dimensions (zai_product 30 / dev_ecosystem 20 / startup_gtm 15 / enterprise_gtm
15 / kol_influence 10 / freshness 10), apply topic-match bonuses, then map:

- **P0** (≥80) — must-know: GLM-relevant model news, major competitor moves,
  strong KOL signal. Always include.
- **P1** (≥60) — MKT-relevant, worth following. Include.
- **P2** (≥40) — interesting but low priority. Include sparingly.
- **P3** (<40) — noise. Do NOT include.

Source confidence (`mktConfig.scoring.source_confidence`) affects the
kol_influence dimension: `x`/`arxiv` rank high; `trending` ranks lower — treat
trending items as ambient signal, not KOL-confirmed. These are same-day priority
bands, NOT cross-day comparable scores — don't claim otherwise.

## Rules

### No fabrication
- Only include content from the JSON (`x`, `mktSignals`, `blogs`, `podcasts`).
- NEVER make up quotes, opinions, or content someone might have said.
- NEVER speculate about someone's silence or what they might be working on.
- If a KOL has nothing real today, skip them. Do not pad with guesses.

### Mandatory links
- Every item MUST have its original source URL from the JSON.
- No URL = not real = do not include. No exceptions.
- Preserve the `source_status` tag next to each link.

### Tone & length
- Scannable on a phone. Facts first, judgment light.
- No marketing fluff, no "in today's rapidly evolving AI landscape" openers.
- English by default; follow `config.language` for zh/bilingual (Step 5).

### Closing
End with: `Generated through the Z.ai MKT Intelligence Brief skill.`
