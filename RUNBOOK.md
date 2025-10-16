## Trello → GitHub Issues Migration (Production Runbook)

This project migrates Trello cards from a board JSON export into GitHub Issues.

### 1) Prerequisites
- Node.js 20+ installed: `node -v`
- Access to the target GitHub repository with permission to create issues
- Personal Access Token (PAT):
  - Classic: scope `repo`
  - Fine-grained: repository access to the target repo with Issues: Read/Write
- Trello board export JSON placed at the repo root and named `livappy.json`

### 2) Setup
```bash
git clone https://github.com/...
cd ..
npm ci
# Put the Trello export file at ./livappy.json (replace the file if needed)
```

Configure target repo if different from defaults:
- Edit `trello-to-github.js` top constants `owner` and `repo` to the destination.

### 3) Authenticate
```bash
export GITHUB_TOKEN=ghp_your_token_here   # or fine-grained token
```

### 4) Dry-run (recommended)
Runs without creating issues; shows what would be created.
```bash
node trello-to-github.js --dry-run --limit=5
```

### 5) Production run
Recommended to run in batches with a small delay to avoid secondary rate limits.
```bash
# Example: process 50 cards at a time with 500ms delay between successful calls
node trello-to-github.js --limit=50 --delay=500

# Full run (use only if rate limits are not a concern)
node trello-to-github.js
```

Notes:
- The script persists progress to `.migration-state.json` (do not delete during the migration).
- If stopped (Ctrl+C) or rate-limited, simply rerun; already-processed Trello cards will be skipped.
- On GitHub secondary rate limit (HTTP 403), the script automatically uses exponential backoff and resumes.

### 6) Verifying results
- Watch terminal progress output: `→ (current/total) Title ... created ✓ <issue-number>`
- Visit the repo Issues tab to confirm counts and spot-check issue bodies and labels.

### 7) Labels and metadata
- Each issue is labeled with the Trello list name. If labels don’t exist, GitHub will create them automatically for classic repositories. If your repo enforces label restrictions, pre-create labels or remove labels in the script.
- Attachments and Trello members are listed in the issue body for reference.

### 8) Reruns and recovery
- Safe to rerun multiple times; processed Trello card IDs are remembered via `.migration-state.json`.
- If you need to re-import everything from scratch, delete `.migration-state.json` and run again (not typical for production).

### 9) Common commands
```bash
# Small sanity batch
node trello-to-github.js --limit=10 --delay=750

# Resume remaining with conservative pacing
node trello-to-github.js --delay=1000
```

### 10) Troubleshooting
- 403 with “secondary rate limit”: increase `--delay` (e.g., 1000–2000ms) and rerun; script backs off automatically.
- Invalid token or permissions: ensure `GITHUB_TOKEN` has Issues write access to the target repo.
- Wrong target repo: update `owner`/`repo` in `trello-to-github.js` and rerun.

### 11) Post-migration
- Optionally archive or delete `.migration-state.json` after verifying all issues are created.
- Consider labeling/closing imported issues that came from “Done”/“Archived” Trello lists (script can be extended if needed).


