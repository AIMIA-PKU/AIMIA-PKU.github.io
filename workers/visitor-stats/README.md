# AIMIA visitor regions

D1 stores only country code, city and pageview count. The Worker uses Cloudflare's request geolocation and does not read or store the raw IP. The map shades countries and lists the busiest cities or country-only records. A request without country data goes into the unknown bucket. This counts pageviews, including repeat visits, and uses approximate IP locations.

The map uses [Natural Earth public-domain country boundaries](https://www.naturalearthdata.com/about/terms-of-use/). The geometry in `src/data/visitor-world.json` is simplified to the 1:110m source and projected to an SVG view box.

## Local preview

Run `pnpm dev` from the repository root and open `/zh/#visitor-footprint`. Local development uses labeled sample data. To preview a static build, run `AIMIA_VISITOR_DEMO=1 pnpm build`, then `pnpm exec astro preview`.

## Cloudflare setup

From this directory, use Wrangler with an account that can create Workers and D1 databases:

1. Run `npx wrangler login` and then `npx wrangler d1 create aimia-visitor-stats`.
2. Copy `wrangler.example.jsonc` to `wrangler.jsonc`, and replace `YOUR_DATABASE_ID` with the database ID from Wrangler. Keep `SITE_ORIGIN` set to the exact live website origin, without a trailing slash.
3. Run `npx wrangler d1 execute aimia-visitor-stats --remote --file schema.sql`, followed by `npx wrangler deploy`.
4. In the website repository, open Settings → Secrets and variables → Actions → Variables. Add `PUBLIC_VISITOR_STATS_URL` with the HTTPS Worker origin from the deployment output. Run the Pages workflow on main after the website integration is pushed.
5. Open the live site and check that the Worker’s `/summary` endpoint returns the aggregate counts. Actual regions become available after new visits. Counts from MapMyVisitors are separate.

The live Worker URL is set in `src/data/visitor-widget.json`. The repository variable is an optional override. If neither URL is set, production retains the existing map. Avoid enabling per-request logs that include IP addresses if only aggregate storage is intended.
