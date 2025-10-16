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
4. Under
