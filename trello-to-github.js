// trello-to-github.js
// Migrates Trello cards from your board JSON export to GitHub Issues.
// Author: Olena Dats (2025)

import fs from "fs";
import { Octokit } from "@octokit/rest";

const owner = "GitHubUsername"; // your GitHub username
const repo = "TargetRepo"; // your target repo
const trelloFile = "./trelloBoard.json"; // Trello JSON export file in the same folder
const stateFile = "./.migration-state.json"; // persistent state across runs
const githubToken = process.env.GITHUB_TOKEN; // Set in terminal before running

if (!githubToken) {
  console.error("❌ Please set your GitHub token first using:\n export GITHUB_TOKEN=your_token_here");
  process.exit(1);
}

const octokit = new Octokit({ auth: githubToken });

// Helper to safely extract data
const safe = (fn, fallback = "") => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

function parseArgs(argv) {
  const flags = { dryRun: false, limit: Infinity, delay: 0 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") flags.dryRun = true;
    else if (arg.startsWith("--limit")) {
      const [, value] = arg.split("=");
      flags.limit = Number(value ?? argv[i + 1]);
      if (String(arg).includes("=") === false) i++;
      if (!Number.isFinite(flags.limit) || flags.limit < 0) flags.limit = Infinity;
    } else if (arg.startsWith("--delay")) {
      const [, value] = arg.split("=");
      flags.delay = Number(value ?? argv[i + 1]);
      if (String(arg).includes("=") === false) i++;
      if (!Number.isFinite(flags.delay) || flags.delay < 0) flags.delay = 0;
    }
  }
  return flags;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadState() {
  try {
    const raw = fs.readFileSync(stateFile, "utf8");
    const parsed = JSON.parse(raw);
    return { processedCardIds: new Set(parsed.processedCardIds || []) };
  } catch {
    return { processedCardIds: new Set() };
  }
}

function saveState(state) {
  const json = JSON.stringify(
    { processedCardIds: Array.from(state.processedCardIds) },
    null,
    2
  );
  fs.writeFileSync(stateFile, json, "utf8");
}

function isSecondaryRateLimit(err) {
  const msg = String(err?.message || "").toLowerCase();
  return err?.status === 403 && msg.includes("secondary rate limit");
}

async function createIssueWithRetry(payload, { delay }) {
  let backoffMs = 5000; // start at 5s
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await octokit.rest.issues.create(payload);
      if (delay > 0) await sleep(delay);
      return res;
    } catch (err) {
      if (isSecondaryRateLimit(err)) {
        console.log(`rate limited → waiting ${backoffMs}ms before retry`);
        await sleep(backoffMs);
        backoffMs = Math.min(backoffMs * 2, 5 * 60 * 1000); // cap at 5 minutes
        continue;
      }
      throw err;
    }
  }
}

async function migrate() {
  const data = JSON.parse(fs.readFileSync(trelloFile, "utf8"));

  const args = parseArgs(process.argv.slice(2));
  const state = loadState();
  const createdCards = state.processedCardIds;

  // Build indices to avoid repeated O(n) scans
  const cardIdToAttachments = new Map();
  const cardIdToMembers = new Map();

  for (const action of data.actions || []) {
    if (action.type === "addAttachmentToCard" && action.data?.card?.id) {
      const list = cardIdToAttachments.get(action.data.card.id) || [];
      list.push(action);
      cardIdToAttachments.set(action.data.card.id, list);
    } else if (action.type === "addMemberToCard" && action.data?.card?.id) {
      const list = cardIdToMembers.get(action.data.card.id) || [];
      list.push(action);
      cardIdToMembers.set(action.data.card.id, list);
    }
  }

  const createCardActions = (data.actions || []).filter(
    (a) => a.type === "createCard" && a.data?.card
  );

  const total = createCardActions.length;

  console.log("🚀 Starting Trello → GitHub migration...");
  console.log("Repository:", `${owner}/${repo}`);
  console.log("Cards detected:", total);
  if (args.dryRun) console.log("Mode: dry-run (no issues will be created)");
  if (Number.isFinite(args.limit) && args.limit !== Infinity)
    console.log("Limit:", args.limit);
  if (args.delay > 0) console.log("Delay between requests (ms):", args.delay);

  let processed = 0;
  let savedSinceLastWrite = 0;

  // Ensure state is saved on exit
  const finalize = () => {
    try { saveState(state); } catch {}
  };
  process.on("SIGINT", () => { finalize(); process.exit(1); });
  process.on("exit", finalize);
  for (const action of createCardActions) {
    const card = action.data.card;
    if (createdCards.has(card.id)) continue;
    createdCards.add(card.id);

    processed += 1;
    if (processed > args.limit) break;

    // Build issue title and body
    const title = card.name || "Untitled Trello Card";

    let body = "";

    // Add description if available
    const desc = safe(() => card.desc, "");
    if (desc) body += desc + "\n\n";

    // Add Trello list info
    const listName = safe(() => action.data.list.name, "Unsorted");
    body += `**Trello list:** ${listName}\n\n`;

    // Add card link
    const cardUrl = `https://trello.com/c/${card.shortLink}`;
    body += `**Original Trello card:** [${cardUrl}](${cardUrl})\n\n`;

    // Include attachments if they exist
    const attachments = cardIdToAttachments.get(card.id) || [];
    if (attachments.length) {
      body += "### 📎 Attachments\n";
      for (const att of attachments) {
        const name = safe(() => att.data.attachment.name, "file");
        const url = safe(() => att.data.attachment.url, "");
        body += `- [${name}](${url})\n`;
      }
      body += "\n";
    }

    // Mention Trello assignees if any
    const members = cardIdToMembers.get(card.id) || [];
    if (members.length) {
      body += "### 👥 Trello members\n";
      for (const m of members) {
        body += `- ${safe(() => m.data.member.name, "Unknown")}\n`;
      }
      body += "\n";
    }

    // Add label for Trello list
    const labels = listName ? [listName] : [];

    process.stdout.write(`→ (${processed}/${total}) ${title} ... `);
    if (args.dryRun) {
      console.log("skipped (dry-run)");
      continue;
    }

    try {
      const issue = await createIssueWithRetry({
        owner,
        repo,
        title,
        body,
        labels,
      }, args);
      console.log(`created ✓ ${issue.data.number}`);
      savedSinceLastWrite += 1;
      if (savedSinceLastWrite >= 10) {
        saveState(state);
        savedSinceLastWrite = 0;
      }
    } catch (err) {
      console.log("failed ✗");
      console.error(`   └─ Error for \"${title}\":`, err.message);
    }
  }

  console.log("🎉 Migration complete!");
}

migrate();
