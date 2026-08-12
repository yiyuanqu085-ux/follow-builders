#!/usr/bin/env node

// ============================================================================
// Z.ai MKT — Extra-Source Feed Generator (arXiv + trending)
// ============================================================================
// Supplements the X tweet feed (produced by generate-feed.js) with sources X
// doesn't cover or covers poorly: arXiv papers for researcher KOLs
// (Thomas Wolf / François Chollet / Jim Fan) whose real output is papers, not
// tweets, and trending feeds (HN / GitHub trending / arXiv hot) that fill the
// Enterprise/Startup boards. Writes feed-mkt.json — a unified signals[] array
// where every item carries a source_status confidence tag (arxiv | trending).
//
// No API keys required. KOL tweets are fetched by generate-feed.js --tweets-only
// using X_BEARER_TOKEN; this script only adds the non-tweet extras.
//
// Usage: node generate-mkt-feed.js
// ============================================================================

import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// -- Constants ---------------------------------------------------------------

const SCRIPT_DIR = decodeURIComponent(new URL(".", import.meta.url).pathname);
const CONFIG_PATH = join(SCRIPT_DIR, "..", "config", "mkt-sources.json");
const TOPICS_PATH = join(SCRIPT_DIR, "..", "config", "mkt-topics.json");
const COMPETITORS_PATH = join(SCRIPT_DIR, "..", "config", "competitors.json");
const STATE_PATH = join(SCRIPT_DIR, "..", "state-mkt-feed.json");
const OUTPUT_PATH = join(SCRIPT_DIR, "..", "feed-mkt.json");

// Some RSS hosts (notably Substack) block non-browser user agents from cloud IPs.
const RSS_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const MAX_ITEMS_PER_SOURCE = 5;

// -- State Management --------------------------------------------------------

async function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { seenMktSignals: {} };
  }
  try {
    const state = JSON.parse(await readFile(STATE_PATH, "utf-8"));
    if (!state.seenMktSignals) state.seenMktSignals = {};
    return state;
  } catch {
    return { seenMktSignals: {} };
  }
}

async function saveState(state) {
  // Prune entries older than 14 days (longer window than upstream since some
  // sources like arXiv publish less frequently than daily).
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const [id, ts] of Object.entries(state.seenMktSignals)) {
    if (ts < cutoff) delete state.seenMktSignals[id];
  }
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

// -- Config Loading ----------------------------------------------------------

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf-8"));
}

async function loadTopics() {
  const t = await loadJson(TOPICS_PATH);
  return t.topics || {};
}

async function loadCompetitorKeywords() {
  const c = await loadJson(COMPETITORS_PATH);
  const kw = [];
  for (const comp of c.competitors || []) {
    for (const a of comp.aliases || []) kw.push(a.toLowerCase());
  }
  return kw;
}

// Build a flat keyword→topic map for topic tagging
function buildTopicMap(topics) {
  const map = []; // [{keyword, topic}]
  for (const [, val] of Object.entries(topics)) {
    for (const kw of val.keywords || []) {
      map.push({ keyword: kw.toLowerCase(), topic: val.label });
    }
  }
  return map;
}

function tagTopics(text, topicMap) {
  const lower = (text || "").toLowerCase();
  const tags = new Set();
  for (const { keyword, topic } of topicMap) {
    if (lower.includes(keyword)) tags.add(topic);
  }
  return [...tags];
}

// -- Unified Feed Parser (RSS <item> + Atom <entry>) -------------------------

function firstMatch(block, ...regexes) {
  for (const re of regexes) {
    const m = block.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function stripHtml(html) {
  // Order matters: unwrap CDATA and decode entities FIRST, so entity-escaped
  // HTML (e.g. Atom <summary type="html">&lt;p&gt;...) becomes real tags that
  // the tag-stripping pass can then remove. Decode &amp; last to avoid
  // double-decoding &amp;lt; → &lt; → <.
  return (html || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns [{ title, guid, link, publishedAt, summary, content }]
function parseFeed(xml) {
  const items = [];

  // RSS <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = firstMatch(block, /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/, /<title>([\s\S]*?)<\/title>/) || "Untitled";
    const guid = firstMatch(block, /<guid[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/guid>/, /<guid[^>]*>([\s\S]*?)<\/guid>/);
    const link = firstMatch(block, /<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/, /<link>([\s\S]*?)<\/link>/);
    const pub = firstMatch(block, /<pubDate>([\s\S]*?)<\/pubDate>/, /<published>([\s\S]*?)<\/published>/, /<dc:date>([\s\S]*?)<\/dc:date>/);
    const summary = firstMatch(block, /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/, /<description>([\s\S]*?)<\/description>/);
    const content = firstMatch(block, /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/, /<content:encoded>([\s\S]*?)<\/content:encoded>/);
    items.push({
      title: stripHtml(title),
      guid: guid || link || title,
      link,
      publishedAt: pub ? new Date(pub.trim()).toISOString() : null,
      summary: summary ? stripHtml(summary).slice(0, 500) : "",
      content: content ? stripHtml(content).slice(0, 4000) : summary ? stripHtml(summary).slice(0, 2000) : "",
    });
  }

  // Atom <entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = firstMatch(block, /<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/, /<title[^>]*>([\s\S]*?)<\/title>/) || "Untitled";
    const id = firstMatch(block, /<id>([\s\S]*?)<\/id>/);
    // Atom link: prefer rel="alternate" or the first link href
    let link = null;
    const linkMatches = [...block.matchAll(/<link[^>]*>/gi)];
    for (const lm of linkMatches) {
      const tag = lm[0];
      if (/rel=["']alternate["']/.test(tag) || !/rel=/.test(tag)) {
        const href = tag.match(/href=["']([^"']+)["']/);
        if (href) { link = href[1]; break; }
      }
    }
    const pub = firstMatch(block, /<published>([\s\S]*?)<\/published>/, /<updated>([\s\S]*?)<\/updated>/);
    const summary = firstMatch(block, /<summary[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/summary>/, /<summary[^>]*>([\s\S]*?)<\/summary>/);
    const content = firstMatch(block, /<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/, /<content[^>]*>([\s\S]*?)<\/content>/);
    items.push({
      title: stripHtml(title),
      guid: id || link || title,
      link: link || id,
      publishedAt: pub ? new Date(pub.trim()).toISOString() : null,
      summary: summary ? stripHtml(content || summary).slice(0, 500) : "",
      content: (content || summary) ? stripHtml(content || summary).slice(0, 4000) : "",
    });
  }

  return items;
}

// -- Fetch helper ------------------------------------------------------------

async function fetchText(url, { asBrowser = true } = {}) {
  const headers = asBrowser
    ? { "User-Agent": RSS_USER_AGENT, Accept: "application/rss+xml, application/atom+xml, text/xml, application/xml, text/html, */*" }
    : { "User-Agent": "ZaiMKT/1.0 (feed aggregator)" };
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// -- Signal builder ----------------------------------------------------------

function makeSignal({ sourceStatus, kol, name, title, summary, url, publishedAt, sourceName, content, topicMap }) {
  const text = `${title} ${summary} ${content || ""}`;
  return {
    source_status: sourceStatus,
    kol: kol || null,
    name: name || kol || null,
    title: (title || "Untitled").slice(0, 300),
    summary: (summary || "").slice(0, 600),
    url: url || null,
    publishedAt: publishedAt || null,
    source_name: sourceName || null,
    content: (content || "").slice(0, 4000),
    topic_tags: tagTopics(text, topicMap),
  };
}

// -- Fetcher: arXiv (author papers + trending) -------------------------------

// arXiv's API intermittently returns HTTP 200 with an EMPTY feed when rate-
// limited (it wants ≥3s between calls). Retry once after a backoff so a single
// rate-limited response doesn't zero out a whole source.
async function fetchArxivFeed(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const xml = await fetchText(url, { asBrowser: false });
      const items = parseFeed(xml);
      if (items.length > 0) return items;
      // Empty 200 — likely rate-limited. Back off and retry.
    } catch (err) {
      if (attempt === 1) throw err;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return [];
}

async function fetchArxivAuthors(sources, state, errors, topicMap) {
  const signals = [];
  for (const src of sources.arxiv_authors || []) {
    try {
      const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(src.search_query)}&sortBy=submittedDate&sortOrder=descending&max_results=${src.maxResults || 8}`;
      const items = await fetchArxivFeed(url);
      let added = 0;
      const cutoffMs = Date.now() - (src.lookbackDays || 30) * 24 * 60 * 60 * 1000;
      for (const it of items) {
        if (added >= MAX_ITEMS_PER_SOURCE) break;
        const key = it.guid || it.link;
        if (!key || state.seenMktSignals[key]) continue;
        if (it.publishedAt && new Date(it.publishedAt).getTime() < cutoffMs) continue;
        signals.push(makeSignal({
          sourceStatus: "arxiv", kol: src.kol, name: src.name,
          title: it.title, summary: it.summary, url: it.link,
          publishedAt: it.publishedAt, sourceName: src.source_name,
          content: it.content || it.summary, topicMap,
        }));
        state.seenMktSignals[key] = Date.now();
        added++;
      }
      console.error(`  arxiv:${src.kol} +${added}`);
    } catch (err) {
      errors.push(`arxiv:${src.kol}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 3000)); // arXiv TOS: 3s between calls
  }
  return signals;
}

// -- Fetcher: Trending (HN / GitHub trending / arXiv trending) --------------

function matchesAny(text, keywords) {
  const lower = (text || "").toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

async function fetchTrending(trendingCfg, state, errors, topicMap, competitorKw) {
  const signals = [];
  const aiKeywords = [...topicMap.map((t) => t.keyword), ...competitorKw];
  if (!aiKeywords.length) aiKeywords.push("ai", "llm", "gpt", "model", "agent");

  // HN via Algolia — high-point recent stories, filtered to AI-relevant
  if (trendingCfg.hackernews?.enabled) {
    try {
      const cfg = trendingCfg.hackernews;
      const cutoffSec = Math.floor((Date.now() - (cfg.lookbackHours || 24) * 3600 * 1000) / 1000);
      // Filter by BOTH points AND recency — without created_at_i the Algolia
      // search returns all-time high-point stories (e.g. 2023 Sam Altman news).
      const url = `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=points%3E${cfg.minPoints || 100},created_at_i%3E${cutoffSec}&hitsPerPage=30`;
      const data = JSON.parse(await fetchText(url, { asBrowser: false }));
      let added = 0;
      for (const hit of data.hits || []) {
        if (added >= MAX_ITEMS_PER_SOURCE) break;
        const text = `${hit.title || ""} ${hit.url || ""}`;
        if (!matchesAny(text, aiKeywords)) continue;
        const link = `https://news.ycombinator.com/item?id=${hit.objectID}`;
        if (state.seenMktSignals[link]) continue;
        signals.push(makeSignal({
          sourceStatus: "trending", kol: null, name: "Hacker News",
          title: hit.title || "Untitled", summary: hit.url || "",
          url: hit.url || link, publishedAt: hit.created_at_i ? new Date(hit.created_at_i * 1000).toISOString() : null,
          sourceName: cfg.source_name, content: "", topicMap,
        }));
        state.seenMktSignals[link] = Date.now();
        added++;
      }
      console.error(`  trending:hn +${added}`);
    } catch (err) {
      errors.push(`trending:hn: ${err.message}`);
    }
  }

  // GitHub trending — scrape repo list
  if (trendingCfg.github_trending?.enabled) {
    try {
      const cfg = trendingCfg.github_trending;
      const html = await fetchText(cfg.url);
      const repoRegex = /href="\/([^/"']+\/[^/"']+)"/g;
      const repos = new Set();
      let rm;
      while ((rm = repoRegex.exec(html)) !== null) {
        const r = rm[1];
        if (r.includes(".") || r.includes("trending") || r.includes("topics") || r.includes("explore")) continue;
        repos.add(r);
      }
      let added = 0;
      for (const repo of [...repos]) {
        if (added >= MAX_ITEMS_PER_SOURCE) break;
        // Fetch repo page to check description relevance
        const link = `https://github.com/${repo}`;
        if (state.seenMktSignals[link]) continue;
        let desc = "";
        try {
          const rh = await fetchText(link);
          const dm = rh.match(/<meta name="description" content="([^"]+)"/i);
          if (dm) desc = dm[1];
        } catch {}
        if (!matchesAny(`${repo} ${desc}`, aiKeywords)) continue;
        signals.push(makeSignal({
          sourceStatus: "trending", kol: null, name: "GitHub Trending",
          title: repo, summary: desc, url: link, publishedAt: null,
          sourceName: cfg.source_name, content: "", topicMap,
        }));
        state.seenMktSignals[link] = Date.now();
        added++;
        await new Promise((r) => setTimeout(r, 200));
      }
      console.error(`  trending:github +${added}`);
    } catch (err) {
      errors.push(`trending:github: ${err.message}`);
    }
  }

  // arXiv trending — recent papers in key ML categories
  if (trendingCfg.arxiv_trending?.enabled) {
    try {
      const cfg = trendingCfg.arxiv_trending;
      const catQuery = (cfg.categories || ["cs.CL"]).map((c) => `cat:${c}`).join("+OR+");
      const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(catQuery)}&sortBy=submittedDate&sortOrder=descending&max_results=30`;
      const items = await fetchArxivFeed(url);
      const cutoffMs = Date.now() - (cfg.lookbackDays || 3) * 24 * 60 * 60 * 1000;
      let added = 0;
      for (const it of items) {
        if (added >= MAX_ITEMS_PER_SOURCE) break;
        // No keyword filter here: the cs.CL/cs.LG/cs.AI category IS the scope.
        // The LLM remix step will judge relevance per mkt-topics.
        if (it.publishedAt && new Date(it.publishedAt).getTime() < cutoffMs) continue;
        const key = it.guid || it.link;
        if (state.seenMktSignals[key]) continue;
        signals.push(makeSignal({
          sourceStatus: "trending", kol: null, name: "arXiv Trending",
          title: it.title, summary: it.summary, url: it.link,
          publishedAt: it.publishedAt, sourceName: cfg.source_name,
          content: it.summary, topicMap,
        }));
        state.seenMktSignals[key] = Date.now();
        added++;
      }
      console.error(`  trending:arxiv +${added}`);
    } catch (err) {
      errors.push(`trending:arxiv: ${err.message}`);
    }
  }

  return signals;
}

// -- Main --------------------------------------------------------------------

async function main() {
  console.error("Z.ai MKT extra-source feed generator — fetching arXiv + trending...");
  const sources = await loadJson(CONFIG_PATH);
  const topicsRaw = await loadTopics();
  const topicMap = buildTopicMap(topicsRaw);
  const competitorKw = await loadCompetitorKeywords();
  const state = await loadState();
  const errors = [];

  const signals = [];

  console.error("arXiv authors:");
  signals.push(...await fetchArxivAuthors(sources, state, errors, topicMap));
  console.error("Trending:");
  signals.push(...await fetchTrending(sources.trending || {}, state, errors, topicMap, competitorKw));

  await saveState(state);

  const stats = signals.reduce((acc, s) => {
    acc.byStatus[s.source_status] = (acc.byStatus[s.source_status] || 0) + 1;
    return acc;
  }, { byStatus: {} });

  const feed = {
    generatedAt: new Date().toISOString(),
    signalCount: signals.length,
    stats,
    signals,
    errors: errors.length ? errors : undefined,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(feed, null, 2));
  console.error(`\nDone. ${signals.length} signals → ${OUTPUT_PATH}`);
  console.error(`By source_status: ${JSON.stringify(stats.byStatus)}`);
  if (errors.length) console.error(`Errors: ${errors.length} (non-fatal)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
