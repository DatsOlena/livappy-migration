# 🚀 Trello → GitHub Issue Migration

This repository contains a complete Node.js solution to migrate Trello cards into GitHub Issues. Developed by **Olena Dats** for the **Livappy** project to move tickets from Trello to GitHub efficiently and safely.

## 🧩 Overview
The `trello-to-github.js` script reads a Trello JSON export file (`livappy.json`) and creates GitHub Issues automatically.

Each issue includes:
- Trello card title → GitHub issue title
- Description preserved
- Trello list name → GitHub label
- Attachments listed as links
- Trello members listed in issue body
- Link to the original Trello card
- Progress tracking in `.migration-state.json` (resumable)

## ⚙️ Requirements
You’ll need:
- Node.js installed (`node -v` to check)
- Write access to the GitHub repository (e.g. `Livappy/Livappy`)
- Trello board exported as JSON (`livappy.json`)
- Fine-grained GitHub token with:
  - Issues → Read & Write
  - Metadata → Read-only

## 🔑 How to Generate a GitHub Token
1. Go to https://github.com/settings/tokens?type=beta
2. Click “Generate new token”
3. Under Repository access:
   - Select “Only select repositories”
   - Choose `Livappy/Livappy`
4. Under Permissions:
   - Issues → Read and write
   - Metadata → Read-only
5. Click “Generate token”
6. Copy the token immediately (you’ll only see it once).

## 🪜 Step-by-Step Guide

### 1️⃣ Prepare Files
You should have these files:
- trello-to-github.js  
- livappy.json  
Keep them together in one folder (for example `livappy-migration`).

### 2️⃣ Install Dependencies
Open a terminal in that folder and run:
npm init -y  
npm install @octokit/rest

### 3️⃣ Export the GitHub Token
export GITHUB_TOKEN=ghu_your_token_here  
(Replace with your real token string.)

### 4️⃣ Verify Configuration
Open `trello-to-github.js` and confirm:
const owner = "Livappy"  
const repo = "Livappy"  
const trelloFile = "./livappy.json"

### 5️⃣ Dry-Run Test (Preview Mode)
Run a safe test that doesn’t create issues:
node trello-to-github.js --dry-run --limit=5  
This shows which Trello cards would be imported.

### 6️⃣ Real Import
When ready, run:
node trello-to-github.js --delay=1500

Optional flags:
--limit=20 → import only 20 cards (testing)
--delay=2500 → add delay to avoid rate limits
--dry-run → test mode (no issues created)

The script saves progress in `.migration-state.json`, so you can stop and restart — it will skip already imported cards.

### 7️⃣ Verify
After running:
- Go to https://github.com/Livappy/Livappy/issues
- Check that titles, descriptions, and attachments are correct
- Confirm Trello links and labels appear properly

### 8️⃣ Cleanup
- Revoke your GitHub token after migration (Settings → Developer settings → Fine-grained tokens → Revoke)
- Optionally delete `.migration-state.json` to reset migration state.

## 🧠 Troubleshooting
403 Forbidden → Token lacks write permission → Ensure token has Issues: Read & Write and Metadata: Read-only  
Cannot find module '@octokit/rest' → Run npm install @octokit/rest  
Rate limited → Script retries automatically, or increase delay (--delay=2500)  
No issues appear → Check owner/repo in script  
Invalid JSON → Ensure Trello export file is valid

## 🧪 Advanced Options
Resuming Migration: The script keeps track of processed Trello cards in `.migration-state.json`. You can stop anytime and resume later.  
Label Mapping: You can edit mappings directly in the script if you want Trello lists like “To Do”, “Doing”, and “Done” converted to different GitHub labels.  
Testing Environment: You can safely test everything first on your own repo `DatsOlena/livappy-migration` before importing to `Livappy/Livappy`.

## 🧩 Folder Structure
livappy-migration/  
├── trello-to-github.js  
├── livappy.json  
├── .migration-state.json  
└── README.md

## ✅ Example Commands
Dry-run (no issues created):  
node trello-to-github.js --dry-run --limit=5  
Partial import (20 cards):  
node trello-to-github.js --limit=20 --delay=1500  
Full import:  
node trello-to-github.js --delay=1500

## 👩‍💻 Author
**Olena Dats**  
Frontend Developer • Livappy Project  
https://github.com/DatsOlena

## 🧾 License
This migration script and documentation are for internal Livappy use. They may be reused or adapted for internal automation purposes.

## 💬 Quick Summary
1. Clone the repo  
2. Install dependencies  
3. Export your GitHub token  
4. Run dry-run to test  
5. Run with delay for real import  
6. Verify results  
7. Revoke token ✅
