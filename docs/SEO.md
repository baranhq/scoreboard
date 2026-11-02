# Search engine and AI discovery

The site is a static Next.js export. Each public language has its own URL and prerendered metadata; help, privacy and licence pages are static HTML. The live scoreboard hydrates in the browser because saved games use IndexedDB. Its product summary and application metadata are in the prerendered homepage metadata and structured data, while the localised help pages provide crawlable usage details. Production canonicals use the configured HTTPS origin; Bulgarian and Turkish pages remain self-canonical. The sitemap contains the home, help, privacy and licences pages in all three languages, with reciprocal alternates (`bg`, `tr`, `en-GB`, and the Bulgarian default). Browser-local saved games are `noindex` and are not included in the sitemap.

## Before a public build

In `.env.local`, set the real origin and explicitly enable indexing:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_INDEXABLE=true
```

Keep indexing off on development, preview and staging builds. Then run `npm run build` and deploy the complete `out/` directory, including `robots.txt`, `sitemap.xml`, `.htaccess`, the social preview image, favicon and static language pages. A later build with a changed origin, indexing choice or `ADMIN_PATH` must replace the deployed build. The robots file is a crawl preference, never an access-control mechanism; the configured administrator route and `/api/` still rely on server-side authentication or authorization.

## Google and Bing checklist

1. Verify ownership of the HTTPS domain in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters/about), preferably using their DNS verification method.
2. Confirm `https://your-domain.example/robots.txt` allows public pages and points to the deployed sitemap. Confirm the sitemap lists only canonical URLs and that it uses the configured domain, not localhost or an example domain.
3. Submit `/sitemap.xml` in both webmaster tools. Inspect the English, Bulgarian and Turkish home and help pages; check rendered language, title, description, canonical and alternate URLs.
4. Confirm saved-games routes remain `noindex`, administrator/API routes remain protected, and old English/Bulgarian/Turkish aliases redirect to their canonical localized routes on Apache deployments.
5. Review indexing, crawl and structured-data reports after search engines revisit the site. Fix reported access or canonical mismatches; submission does not guarantee indexing or rankings.

## Optional IndexNow

IndexNow can notify Bing and participating search engines when these small static pages change. It is optional and does not affect normal crawling. Generate a random 8–128 character key containing letters, numbers or hyphens, set `INDEXNOW_KEY` in the build environment, deploy the generated `/<key>.txt` file, then run `npm run indexnow` after the site is publicly reachable over HTTPS. The verification key is public by design, not a password. Do not submit user-generated URLs, shared snapshots or browser-local saved games.

## Search and AI crawler access

Indexable builds allow general web crawlers and explicitly allow `OAI-SearchBot` for ChatGPT Search. No separate model-training crawler rule is added; those crawlers follow the general rule. Preview builds block crawling. The app's Apache configuration does not block public crawlers, but a CDN, WAF or hosting bot challenge can still do so. If one is configured, review its current rules and allow the documented search crawlers and their published network ranges without weakening origin access controls. Do not treat crawler user-agent strings as authentication.

No AI assistant recommendation or citation is promised. Accurate descriptions, crawlable help content, real project links and complete licence/privacy information make the site easier to interpret, but independent services choose what to surface.

For monitoring, review Search Console and Bing Webmaster Tools crawl/index reports, and use Bing's AI Performance report if it is available for the verified site. Referral analytics can show some visits from AI services, but a referral is not proof of a citation and missing referrals do not prove the site was not cited. Keep measurement within the existing optional analytics controls; do not add third-party tracking for this purpose.

## Search intent and wording

Use these phrases naturally in relevant descriptions and documentation, not as repeated lists on the public interface:

- **English:** online scoreboard, classroom scoreboard, team scoreboard, scoreboard with timer.
- **Bulgarian:** онлайн табло за резултати, табло за резултати за отбори, табло за класни игри.
- **Turkish:** çevrim içi skor panosu, takım skor panosu, sınıf etkinlikleri için skor panosu.

These are descriptive search-intent terms based on the product's real use; this project has no search-volume or ranking data. The homepage and help page explain the actual features without claiming live synchronisation, cloud storage or sport-specific official scoring rules.

## Official references

- [Google: Localised versions of pages](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google: Canonicalisation](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google: Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Bing: IndexNow](https://www.bing.com/webmasters/help/indexnow-0z209wby)
- [OpenAI: crawler guidance](https://developers.openai.com/api/docs/bots)
