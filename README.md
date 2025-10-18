# OxyePayouter (GitHub-ready)

This repository is a cleaned, GitHub-ready version of your OxyePayouter Discord payment bot (originally developed on Replit).

## What is included
- `index.js` — main bot file (unchanged from original)
- `commands/`, `config/`, `utils/`, `data/` — original folders kept
- `Procfile` — for Render/Railway (runs `node index.js`)
- `.env.example` — environment variable placeholders
- `package.json` — trimmed to required fields

## How to deploy (Render - recommended, free 24/7)
1. Create a GitHub repo and push this project (or upload zip file to GitHub).
2. Sign in to Render (https://render.com) and create a new **Web Service**.
3. Connect your GitHub repo and select the branch.
4. Build command: `npm install`
5. Start command: `node index.js` (or leave blank for automatic detection)
6. Add environment variables in Render (DISCORD_TOKEN, MONGO_URI, etc) from `.env.example`.
7. Deploy — your bot will stay online 24/7 on Render.

## How to run locally
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm start` or `node index.js`

## Notes & Security
- Never commit your real `.env` file with secrets to GitHub. Use GitHub secrets / Render environment variables.
- This package keeps your project structure but removes Replit-specific and git metadata files.

If you need me to update the Procfile or change the start command, tell me and I will regenerate the zip.
