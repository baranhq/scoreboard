# Search engine and AI discovery

The site is a static Next.js export. `/` is the canonical English landing page; `/en/` renders the same English content and points to `/` as its canonical URL. `/bg/` and `/tr/` are the Bulgarian and Turkish canonical landing pages. Each page contains a prerendered title, description, stable H1 and concise product summary before JavaScript or IndexedDB starts. The summary describes team setup and scoring, countdowns and stopwatches, fullscreen display, local saves, snapshot sharing, the lack of account requirements, and the project's MIT-licensed open-source code and self-hosting option. It does not contain locally saved board data. The scoreboard remains the primary interactive content; localized help pages provide fuller instructions.

Canonical public routes use the configured origin. The `/scoreboard/` compatibility route points to `/en/scoreboard/`; the English route and Bulgarian and Turkish scoreboard pages are the canonical versions. The `/en/` landing alias and `/scoreboard/` compatibility route are omitted from the sitemap. Localized pages link reciprocally using `bg`, `tr`, `en`, `en-GB` and `x-default`; `en` and `en-GB` point to the same English equivalent. For the landing page, the English equivalent is `/`; for other pages it is the `/en/` route. Browser-local saved-scoreboard routes are `noindex` and excluded from the sitemap.

The homepage JSON-LD describes one stable `WebSite` and `WebApplication` entity across locales, plus a localized `WebPage` for each homepage. The site and app link to Baran Ahmedov’s `Person` entity; the app also links to the official GitHub repository. It contains the free price, supported languages, real features, browser requirements, MIT licence and social image. It does not include reviews or ratings. Google requires an app review or aggregate rating for its software-app rich result; none is fabricated, so the markup should not be expected to qualify for that result.

## Platform introductions

The new canonical introductions are `/[lang]/tools/scoreboard/`, `/[lang]/leaderboards/` and `/[lang]/brackets/` in EN/BG/TR. Each has localized copy, a working example, reciprocal alternates and WebApplication JSON-LD describing real features. The new `/[lang]/leaderboards/edit/` and `/[lang]/brackets/edit/` routes are noindex and omitted from the sitemap. Existing Scoreboard editor URLs remain indexable for compatibility. There are 24 canonical public sitemap entries.

On 10 November 2026, live `/en/` returned HTTP 200, `index, follow`, a canonical pointing to `/`, and no `X-Robots-Tag`. Live robots.txt allowed public crawling. The previously reported noindex issue was not reproducible. The current build loader already defaults the official production origin to indexable while retaining an explicit opt-out. Do not remove the staging safeguard or claim an unobserved hosting/Google issue was fixed. Search Console history and selected canonicals still require owner access.

Google's [AI guidance](https://developers.google.com/search/docs/appearance/ai-features) calls for the same crawlability and helpful content used for Search, without special AI files. The new introductions follow that approach. [Software-app markup](https://developers.google.com/search/docs/appearance/structured-data/software-app) includes no fabricated reviews or ratings and makes no promise of rich-result eligibility.

## Before a public build

For Apache hosting, put the real public origin and indexing choice in the automatically loaded private `.env`. Other builds can use the supported project `.env.local` or build environment. Set:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_INDEXABLE=true
```

The official production origin defaults to indexable when no indexing setting is supplied. An explicit `NEXT_PUBLIC_INDEXABLE=false` still disables indexing, including on production. Keep indexing off on development, preview and staging builds. Run `npm run build` and deploy the complete `out/` directory, including `robots.txt`, `sitemap.xml`, `.htaccess`, the social preview image, favicon, PHP API files and language pages. Rebuild when changing the origin, indexing choice or `ADMIN_PATH`. Robots rules express crawl preferences; they do not protect the administrator or API routes.

The build and `npm run indexnow` use the same private environment loader and production defaults. IndexNow submits the canonical home, product introductions, scoreboard, help, privacy and licence routes in all three languages when indexing is enabled. It does not submit the noncanonical `/en/` home alias, saved-game routes or snapshot links. Set a random 8–128 character `INDEXNOW_KEY` in the private build environment, deploy the generated `/<key>.txt` verification file, and run the command only after the public site is reachable over HTTPS. The key is public by design, not a password.

## Production verification

After `npm run build`, run `python3 tests/seo-export.py` to check the exported metadata, canonicals, reciprocal locale links, sitemap, robots rules, structured data and static internal link targets. This checks local output; HTTP redirects and production indexing still need the checks below.

1. Verify the HTTPS domain in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters/about).
2. Submit `/sitemap.xml`. Confirm that it contains only canonical public pages on the production origin and that each localized set includes reciprocal `bg`, `tr`, `en`, `en-GB` and `x-default` alternatives.
3. Inspect `/`, `/en/`, `/bg/`, `/tr/`, `/scoreboard/`, the localized scoreboard routes and each localized help page. Check raw and rendered HTML for language, title, description, H1, canonical, alternates and readable content with JavaScript disabled. Confirm `/en/` canonicalizes to `/`, `/scoreboard/` canonicalizes to `/en/scoreboard/`, and neither alias appears as a sitemap entry.
4. Use URL Inspection and Bing's URL inspection to check indexing, selected canonicals, crawl/rendering errors, language coverage and blocked assets. Confirm saved-scoreboard pages remain `noindex` and admin/API requests remain protected.
5. Run Google's Rich Results Test on each language homepage. The markup is intentionally not eligible for the software-app review/rating result without real reviews; fix syntax or unrelated critical errors without inventing ratings.
6. Review Search Console Core Web Vitals and mobile usability, then inspect Bing crawl reports and its AI Performance report if available. These reports require verified site access and enough real-user data.
7. Confirm that Cloudflare, hosting bot controls and rate limits do not challenge Googlebot, Bingbot or OAI-SearchBot on public pages, sitemap, robots file or required static assets. Keep origin authentication and API protections intact.

## Apache and Cloudflare delivery

Apache sends a one-year immutable cache policy for fingerprinted files under `/_next/static/` and a one-day policy for stable public fonts and images. HTML is not given a long cache lifetime by this `.htaccess`, so a deployment can reference new hashed assets without broadly caching stale pages. Preserve these asset policies in Cloudflare and purge any custom-cached HTML after deployment. Do not apply a blanket “Cache Everything” rule to HTML, `/api/` or the configured admin path.

Where available, enable Brotli compression and use the normal Cloudflare static-asset caching path. Check cache headers after deployment. Avoid JavaScript rewriting such as Rocket Loader unless the complete hydrated scoreboard has been checked with it; do not weaken CSP, origin protections or consent controls for a speed setting. Provider dashboards and actual edge behavior must be verified on the live domain.

## Search and AI crawler access

Indexable builds allow general crawlers and explicitly allow `OAI-SearchBot`. The existing `User-agent: *` rule also applies to GPTBot; this work leaves model-training crawler access unchanged. OpenAI documents OAI-SearchBot and GPTBot as independent controls. The robots file does not override Cloudflare/WAF challenges, and a crawler user-agent alone is not authentication. Use current official crawler details and published IP ranges when configuring verified-bot access.

No `llms.txt` is generated. There is no evidence that it improves search or recommendation eligibility; the product is represented in crawlable localized HTML, ordinary links, the sitemap and truthful structured data. AI services decide independently what to cite or recommend; there is no guaranteed inclusion mechanism.

## Search intent and off-site work

The three language markets use their own natural wording for free scorekeeping, classrooms and quizzes, and teams: **online scoreboard**, **online score counter**, **classroom scoreboard** and **team scoreboard** in English; **онлайн табло за резултати**, **брояч на точки**, **табло за класна стая** and **табло за отбори** in Bulgarian; **çevrim içi skor tabelası**, **çevrim içi puan sayacı**, **sınıf skor tablosu** and **takım puan tablosu** in Turkish. These phrases describe actual product use; no search-volume or ranking data is available, so treat them as intent hypotheses until Search Console or Bing data confirms demand. Do not target live professional-match results, league tables, betting, or sport-specific scoring rules the product does not provide. The public copy avoids keyword lists and does not claim live synchronization or cloud storage.

The English README and the Bulgarian and Turkish README files are available in the repository. Keep their product description and feature limits aligned with the live app. In GitHub's repository settings, use an accurate description such as “Free, open-source online scoreboard for classroom games, sports and team competitions, with multiple teams, timers, fullscreen display and local saves.” Relevant topics include `online-scoreboard`, `score-counter`, `classroom-tools`, `team-games`, `timer`, `typescript` and `nextjs`. Seek legitimate references from relevant open-source, teaching and community resources; do not buy links or use link farms, fake reviews or artificial traffic.

## Official references

- [Google: Localized versions of pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google: Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google: Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Bing: IndexNow](https://www.bing.com/webmasters/help/indexnow-0z209wby)
- [OpenAI: Overview of crawlers](https://developers.openai.com/api/docs/bots)
- [OpenAI: Publisher and developer FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
