#!/usr/bin/env node

// ============================================================================
// Follow Builders — Prepare Digest (Z.ai MKT fork)
// ============================================================================
// Gathers everything the LLM needs to produce a digest:
// - Loads the X tweet feed (LOCAL feed-x.json, produced by generate-feed.js
//   --tweets-only with the fork's own X_BEARER_TOKEN; falls back to a raw URL)
// - Free-rides upstream podcasts + blogs (zarazhangrui/follow-builders)
// - Loads the local MKT extra feed (feed-mkt.json: arXiv papers + trending)
// - Fetches the latest prompts (local fork copy wins over remote)
// - Reads the user's config + local overrides (remove_handles still applied)
// - Outputs a single JSON blob to stdout
//
// The LLM's ONLY job is to read this JSON, remix the content, and output
// the digest text. Everything else is handled here deterministically. The
// remix stays fully OFFLINE — there is no web_search step.
//
// Usage: node prepare-digest.js
// Output: JSON to stdout
// ============================================================================

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// -- Constants ---------------------------------------------------------------

const USER_DIR = join(homedir(), '.follow-builders');
const CONFIG_PATH = join(USER_DIR, 'config.json');

// Podcasts + blogs are still free-ridden from upstream (pod2txt is expensive;
// these are orthogonal to the X tweet fetch which the fork now owns).
const FEED_PODCASTS_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json';
const FEED_BLOGS_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-blogs.json';

// X feed: LOCAL file first (produced by generate-feed.js --tweets-only in this
// same repo checkout). Fall back to FEED_X_URL env (e.g. zara's raw URL) for
// remote-only setups before the first local run.
const SCRIPT_DIR = decodeURIComponent(new URL('.', import.meta.url).pathname);
const LOCAL_FEED_X_PATH = join(SCRIPT_DIR, '..', 'feed-x.json');
const LOCAL_FEED_MKT_PATH = join(SCRIPT_DIR, '..', 'feed-mkt.json');
const CONFIG_DIR = join(SCRIPT_DIR, '..', 'config');
const MKT_CONFIG_FILES = [
  'mkt-kols.json',
  'mkt-topics.json',
  'mkt-scoring.json',
  'competitors.json',
  'enterprise-watchlist.json',
  'startup-watchlist.json'
];

const PROMPTS_BASE = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/prompts';
const PROMPT_FILES = [
  'summarize-podcast.md',
  'summarize-tweets.md',
  'summarize-blogs.md',
  'digest-intro.md',
  'translate.md'
];

// -- Fetch helpers -----------------------------------------------------------

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

// Load the X tweet feed: local committed file first, then FEED_X_URL env,
// then null. Local-first because the fork produces its own feed-x.json via
// generate-feed.js --tweets-only (own X_BEARER_TOKEN, 30-KOL roster).
async function loadFeedX(errors) {
  if (existsSync(LOCAL_FEED_X_PATH)) {
    try {
      return JSON.parse(await readFile(LOCAL_FEED_X_PATH, 'utf-8'));
    } catch (err) {
      errors.push(`Could not read local feed-x.json: ${err.message}`);
    }
  }
  const remoteUrl = process.env.FEED_X_URL;
  if (remoteUrl) {
    const feed = await fetchJSON(remoteUrl);
    if (feed) return feed;
    errors.push('Could not fetch FEED_X_URL');
  }
  return null;
}

// Load the MKT extra feed: local committed file first, then FEED_MKT_URL, then null.
async function loadMktFeed(errors) {
  if (existsSync(LOCAL_FEED_MKT_PATH)) {
    try {
      return JSON.parse(await readFile(LOCAL_FEED_MKT_PATH, 'utf-8'));
    } catch (err) {
      errors.push(`Could not read local feed-mkt.json: ${err.message}`);
    }
  }
  const remoteUrl = process.env.FEED_MKT_URL;
  if (remoteUrl) {
    const feed = await fetchJSON(remoteUrl);
    if (feed) return feed;
    errors.push('Could not fetch FEED_MKT_URL');
  }
  return null;
}

// Load a local config JSON file (returns null + pushes error on failure).
async function loadConfig(name, errors) {
  const path = join(CONFIG_DIR, name);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch (err) {
    errors.push(`Could not read config/${name}: ${err.message}`);
    return null;
  }
}

// -- Main --------------------------------------------------------------------

async function main() {
  const errors = [];

  // 1. Read user config
  let config = {
    language: 'en',
    frequency: 'daily',
    delivery: { method: 'stdout' }
  };
  if (existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
    } catch (err) {
      errors.push(`Could not read config: ${err.message}`);
    }
  }

  // 2. Load feeds: X (local, own) + podcasts/blogs (free-ridden upstream)
  const feedX = await loadFeedX(errors);
  const [feedPodcasts, feedBlogs] = await Promise.all([
    fetchJSON(FEED_PODCASTS_URL),
    fetchJSON(FEED_BLOGS_URL)
  ]);

  if (!feedX) errors.push('Could not load tweet feed (feed-x.json)');
  if (!feedPodcasts) errors.push('Could not fetch podcast feed');
  if (!feedBlogs) errors.push('Could not fetch blog feed');

  // 2b. Load the MKT extra feed (arXiv papers + trending) + MKT config files.
  const mktFeed = await loadMktFeed(errors);
  const mktSignals = mktFeed?.signals || [];
  const mktConfigs = {};
  for (const name of MKT_CONFIG_FILES) {
    mktConfigs[name.replace('.json', '')] = await loadConfig(name, errors);
  }
  const allKols = mktConfigs['mkt-kols']?.kols || mktConfigs['mkt-kols'] || [];

  // Apply local overrides: remove KOLs the user no longer wants tracked.
  // (add_kols is deprecated under the X API path — extra KOLs should now be
  // added directly to config/default-sources.json so generate-feed.js fetches
  // their tweets. remove_handles still filters the X feed at runtime.)
  // File: ~/.follow-builders/local-overrides.json  (user-managed, no GitHub push needed)
  const overridesPath = join(USER_DIR, 'local-overrides.json');
  let removeHandles = [];
  let addKols = [];
  if (existsSync(overridesPath)) {
    try {
      const overrides = JSON.parse(await readFile(overridesPath, 'utf-8'));
      removeHandles = (overrides.remove_handles || []).map(h => String(h).toLowerCase().replace(/^@/, ''));
      addKols = overrides.add_kols || [];
    } catch (err) {
      errors.push(`Could not read local overrides: ${err.message}`);
    }
  }
  if (removeHandles.length && Array.isArray(feedX?.x)) {
    const before = feedX.x.length;
    feedX.x = feedX.x.filter(b => !removeHandles.includes(String(b.handle || '').toLowerCase()));
    if (feedX.x.length < before) {
      console.error(`[local-overrides] removed ${before - feedX.x.length} builder(s)`);
    }
  }

  // 3. Load prompts with priority: user custom > local (fork) > remote (upstream)
  //
  // If the user has a custom prompt at ~/.follow-builders/prompts/<file>,
  // use that (they personalized it — don't overwrite with remote updates).
  // Otherwise the local copy shipped with the fork is the source of truth
  // (local wins over remote so fork customizations stick). Remote is a last
  // resort for files not present locally.
  const prompts = {};
  const localPromptsDir = join(SCRIPT_DIR, '..', 'prompts');
  const userPromptsDir = join(USER_DIR, 'prompts');

  for (const filename of PROMPT_FILES) {
    const key = filename.replace('.md', '').replace(/-/g, '_');
    const userPath = join(userPromptsDir, filename);
    const localPath = join(localPromptsDir, filename);

    // Priority 1: user's custom prompt (they personalized it)
    if (existsSync(userPath)) {
      prompts[key] = await readFile(userPath, 'utf-8');
      continue;
    }

    // Priority 2: local copy shipped with the skill (the fork's own prompts)
    if (existsSync(localPath)) {
      prompts[key] = await readFile(localPath, 'utf-8');
      continue;
    }

    // Priority 3: fall back to remote (upstream) if no local copy exists
    const remote = await fetchText(`${PROMPTS_BASE}/${filename}`);
    if (remote) {
      prompts[key] = remote;
    } else {
      errors.push(`Could not load prompt: ${filename}`);
    }
  }

  // 4. Build the output — everything the LLM needs in one blob
  const output = {
    status: 'ok',
    generatedAt: new Date().toISOString(),

    // User preferences
    config: {
      language: config.language || 'en',
      frequency: config.frequency || 'daily',
      delivery: config.delivery || { method: 'stdout' }
    },

    // Content to remix
    podcasts: feedPodcasts?.podcasts || [],
    x: feedX?.x || [],
    blogs: feedBlogs?.blogs || [],

    // MKT extra signals — arXiv papers for researcher KOLs + trending items
    // (HN/GitHub/arXiv) for the Enterprise/Startup boards. Each carries a
    // source_status confidence tag (arxiv | trending). The remix LLM stays
    // offline; there is no web_search step.
    mktSignals,

    // Stats for the LLM to reference
    stats: {
      podcastEpisodes: feedPodcasts?.podcasts?.length || 0,
      xBuilders: feedX?.x?.length || 0,
      totalTweets: (feedX?.x || []).reduce((sum, a) => sum + a.tweets.length, 0),
      blogPosts: feedBlogs?.blogs?.length || 0,
      mktSignals: mktSignals.length,
      mktSignalsByStatus: mktSignals.reduce((acc, s) => {
        acc[s.source_status] = (acc[s.source_status] || 0) + 1;
        return acc;
      }, {}),
      feedGeneratedAt: feedX?.generatedAt || feedPodcasts?.generatedAt || feedBlogs?.generatedAt || mktFeed?.generatedAt || null
    },

    // MKT config — KOL roster, topics, scoring rules, competitors, watchlists.
    // The remix LLM reads these to tag topics, score P0-P3, and match
    // enterprise/startup signals. kols is the full 30-KOL roster with angles.
    mktConfig: {
      kols: allKols,
      topics: mktConfigs['mkt-topics'] || {},
      scoring: mktConfigs['mkt-scoring'] || {},
      competitors: mktConfigs['competitors'] || {},
      enterpriseWatchlist: mktConfigs['enterprise-watchlist'] || {},
      startupWatchlist: mktConfigs['startup-watchlist'] || {}
    },

    // Local overrides — removed handles (already filtered out of `x` above)
    // and add_kols (deprecated: add extra KOLs to default-sources.json so
    // generate-feed.js fetches their tweets; this field is informational only).
    localOverrides: {
      removedHandles: removeHandles,
      addKols
    },

    // Prompts — the LLM reads these and follows the instructions
    prompts,

    // Non-fatal errors
    errors: errors.length > 0 ? errors : undefined
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({
    status: 'error',
    message: err.message
  }));
  process.exit(1);
});
