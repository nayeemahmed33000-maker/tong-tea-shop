# Tong Cafe — management app (Vercel)

Live: https://tongcafe.vercel.app — the Tong Cafe management system
(dashboard, orders, kitchen, tables, bills, staff).

Source of truth: `~/workspace/tong-cafe-deploy/frontend/` — the same files
also deploy to Cloudflare Pages at https://tong-cafe.pages.dev (backup +
installed app). Backend + database stay on Cloudflare (Worker + D1,
tong-cafe-api.nayeemahmed33000.workers.dev) — nothing about orders or
data lives in this repo.

The tea-shop WEBSITE (menu site) is a different site:
https://tong-pages.pages.dev (local files in `~/workspace/tong-deploy/`).

To re-sync after a management fix, run:
`python3 ~/workspace/tong-cafe-deploy/bin/push-manage-root-vercel.py`
