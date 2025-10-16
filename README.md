🧭 Trello → GitHub Migration Guide

This script migrates Trello cards into GitHub Issues automatically.
It preserves descriptions, attachments, list names, and Trello links.

⚙️ 1. Prerequisites

Before starting, make sure you have:

Node.js installed (node -v to check)

Write access to the target GitHub repo (e.g., Livappy/Livappy)

A Trello JSON export file (e.g., livappy.json)

A fine-grained GitHub token with permission to create issues

🔑 2. Generate a GitHub Token

Go to https://github.com/settings/tokens?type=beta

Click Generate new token

Under Repository access, choose:

Only select repositories

Select the repo Livappy/Livappy

Under Permissions, add:

Issues → Read and write

Metadata → Read-only

Click Generate token

Copy the token immediately — you’ll only see it once.

📁 3. Setup

Clone or open this folder (with the migration files):

trello-to-github.js
livappy.json


Install dependencies:

npm init -y
npm install @octokit/rest


Set your token in this terminal session:

export GITHUB_TOKEN=ghu_your_token_here

🧩 4. Script configuration

Open trello-to-github.js and confirm:

const owner = "Livappy";
const repo = "Livappy";
const trelloFile = "./livappy.json";

🧪 5. Test (Dry Run)

Run a test to preview what will be created (no issues will be made):

node trello-to-github.js --dry-run --limit=5

🚀 6. Run the Real Import
node trello-to-github.js --delay=1500

Optional Flags:

--limit=20 → only import 20 cards (for testing)

--delay=2500 → add more delay to avoid rate limits

The script saves its progress in .migration-state.json, so you can stop and restart anytime.

✅ 7. Verify

After the script completes:

Go to your repo → Issues tab

Check titles, descriptions, labels, and attachments

Each issue will include a link to the original Trello card

🔒 8. Cleanup

When finished:

Revoke your GitHub token at
Settings → Developer settings → Fine-grained tokens → Revoke

Optionally delete .migration-state.json

🧠 Troubleshooting
Problem	Cause	Fix
403 Forbidden	Token lacks write access	Ensure Issues: Read & Write is enabled
Cannot find module '@octokit/rest'	Dependency missing	Run npm install @octokit/rest
rate limited → waiting ...	API limit reached	Script retries automatically or use --delay=2500
👩‍💻 Author

Olena Dats — 2025
Migration script and guide prepared for Livappy OU
