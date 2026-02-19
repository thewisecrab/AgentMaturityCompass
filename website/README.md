# AMC Marketing Website

Static marketing site for [Agent Maturity Compass](https://github.com/thewisecrab/AgentMaturityCompass).

## Local Preview

Open `index.html` in any browser — no build step required.

## Deploy to GitHub Pages

### Option A: GitHub Actions (automatic)

Push to `main` branch. The workflow at `.github/workflows/deploy-website.yml` deploys automatically.

1. Go to **Settings → Pages** in your repo
2. Set Source to **GitHub Actions**
3. Push to `main` — site deploys to `https://<user>.github.io/AgentMaturityCompass/`

### Option B: Manual

1. Go to **Settings → Pages**
2. Set Source to **Deploy from a branch**
3. Select `main` branch, `/website` folder
4. Save — site is live in ~60 seconds
