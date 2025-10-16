# 🚀 Trello → GitHub Issue Migration

This tool migrates Trello cards into GitHub Issues automatically.  
It was created by **Olena Dats** for the **Livappy** project to move tickets from Trello to GitHub safely and efficiently.

---

## 🧩 Overview

The script reads a Trello board export (`livappy.json`) and creates GitHub Issues with:
- ✅ Title and description  
- 🏷️ Trello list name as a GitHub label  
- 📎 Attachments (URLs listed in issue body)  
- 👥 Trello members (added as mentions in the issue body)  
- 🔗 A link to the original Trello card  
- 💾 Safe progress tracking (resumable via `.migration-state.json`)

---

## ⚙️ Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/) installed (`node -v` to verify)
- Write access to the target GitHub repository (e.g. `Livappy/Livappy`)
- A Trello JSON export file (saved as `livappy.json`)
- A fine-grained GitHub token with:
  - **Issues → Read & Write**
  - **Metadata → Read-only**

---

## 🔑 Generate a GitHub Token

1. Go to [GitHub → Settings → Developer settings → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token**
3. Under **Repository access**, choose:
   - **Only select repositories**
   - Select `Livappy/Livappy`
4. Under **Permissions**, add:
   - `Issues` → **Read and write**
   - `Metadata` → **Read-only**
5. Click **Generate token**
6. Copy it immediately — it’s shown only once.

---

## 📁 Project Setup

Clone and open this repository:

```bash
git clone https://github.com/DatsOlena/livappy-migration.git
cd livappy-migration
Install the required dependency:

npm install @octokit/rest


Export your GitHub token in the same terminal session:

export GITHUB_TOKEN=ghu_your_token_here

⚙️ Script Configuration

In trello-to-github.js, verify that these values are correct:

const owner = "Livappy";      // Organization or user
const repo = "Livappy";       // Target repository
const trelloFile = "./livappy.json";

🧪 Dry Run (Test Mode)

Run a preview without creating any issues:

node trello-to-github.js --dry-run --limit=5


You’ll see a log of which Trello cards would be migrated.

🚀 Real Import

Run the actual migration:

node trello-to-github.js --delay=1500

Optional flags:
Flag	Description
--limit=20	Import only 20 cards (for testing)
--delay=2500	Add delay between API requests (to avoid rate limits)
--dry-run	Preview mode — nothing is created

The script saves state in .migration-state.json, so you can stop and restart safely at any time.

✅ After Migration

Open the target repo → Issues tab

Verify that titles, descriptions, labels, and attachments are imported correctly

Each issue will include a link to the original Trello card

🔒 Cleanup & Security

Once migration is complete, revoke your token:
GitHub → Settings → Developer settings → Fine-grained tokens → Revoke

Optionally delete .migration-state.json to reset progress.

🧠 Troubleshooting
Problem	Cause	Fix
403 Forbidden	Token lacks write access	Ensure you have Issues: Read & Write permission
Cannot find module '@octokit/rest'	Dependency missing	Run npm install @octokit/rest
rate limited → waiting ...	GitHub API rate limit	Script retries automatically or increase --delay
👩‍💻 Author

Olena Dats — 2025
Frontend Developer | Livappy Project
💻 GitHub @DatsOlena
