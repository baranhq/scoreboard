# Privacy and deployment checks

The checked-in notices under `src/lib/privacy` describe the supplied Baran's Scoreboard instance. Provider names in this internal note are used to identify the configured services; the published policy uses service categories as requested. The latest owner-supplied configuration identifies JetHost.bg shared hosting with cPanel, Cloudflare network delivery/security and Web Analytics, JetBackup 5 weekly incremental backups, and Tuta Mail.

This is an engineering source note, not a compliance certification or legal opinion. Self-hosters must adapt the notices to their own identity, services, providers, retention, users and legal arrangements.

## Confirmed production facts

- The Website uses shared hosting with cPanel from JetHost.bg. AWStats is enabled and generates traffic reports from hosting access logs.
- The hosting backup service is JetBackup 5, configured for weekly incremental backups. Four recovery points were observed on 22 November 2026. The exact retention/expiry period, backup destination and access controls have not been confirmed.
- Cloudflare is used for the reverse proxy, network delivery and security. The application has separate choices for first-party Site usage analytics and the Cloudflare Web Analytics beacon; both optional capabilities are enabled in production but start off until a choice is saved.
- A live browser check from Bulgaria on 22 November 2026 found no Web Analytics beacon in the initial page DOM before a choice. Saving only the Web Analytics choice loaded the application beacon; withdrawing that choice removed it after page reload. This confirms the application-managed consent gate on the tested EU page. It does not confirm Cloudflare account-level automatic injection, other page responses or behaviour outside the EEA.
- Tuta Mail is used for email correspondence. The actual account type, processing agreement and mailbox retention settings have not been verified.

## Processing boundaries

- Cloudflare network delivery/security and hosting access logs operate independently of application analytics choices. Providers may receive connection IP addresses and request metadata; the site itself does not store raw visitor IP addresses in its analytics or rate-limit tables.
- The public API rate limiter derives a purpose-specific keyed hash from the connection IP and stores a short-lived counter with a 15-minute expiry. Raw IPs are not stored in that application table. Expired counters are physically removed by maintenance; the production schedule has not been verified.
- First-party analytics stores consented visit sessions, limited public page paths, page-view times and estimated active time. It does not accept new interaction events or user-entered labels. Older event rows may remain until cleanup removes rows older than 365 days. Analytics reporting excludes visits older than 365 days; actual physical deletion depends on the scheduled cleanup task.
- The preference cookie and hashed choice record are used to retrieve and enforce a saved choice. Choices expire after 180 days; a maintenance task deletes stored choice records after 365 days from the last update.
- Scoreboards, participant names, scores, imports, saved tables, and drafts remain in browser storage unless a user deliberately shares or exports them. Share snapshots use URL fragments and are removed before the application-controlled analytics beacon can load.
- LocalStorage, IndexedDB and sessionStorage are not controlled by the analytics consent panel. Some storage supports user-requested features such as saving work; the ePrivacy/Bulgarian Electronic Commerce Act classification of each non-essential setting or reminder should be confirmed. The policy describes what is stored but does not obtain consent for terminal storage.
- The Website has no public account or contact form. Private administration uses a separate one-hour session. Email enquiries can include message contents, attachments and correspondence metadata.
- The application-managed Web Analytics beacon is consent-gated in the tested EU flow. Cloudflare's current RUM documentation describes automatic beacon injection in some configurations and excludes EEA/UK/Swiss traffic by default on free plans. The live EEA test showed no pre-choice beacon, but the account plan and network-side automatic-injection setting must still be confirmed.

## Open account and compliance checks

1. Confirm the hosting account's access-log/AWStats fields, retention and deletion schedule.
2. Confirm JetBackup's destination, the exact recovery-point rotation/expiry, who can access backups and when provider copies are removed. The policy states the observed schedule and that exact retention is unconfirmed.
3. Confirm the Cloudflare plan, zone-level automatic RUM/beacon settings, actual response headers/cookies, data locations and transfer safeguards. A test from Bulgaria cannot establish behaviour for every region.
4. Confirm the Tuta account type, applicable service agreement, email storage/retention settings and any processing/transfer terms that apply.
5. Verify the production maintenance task removes analytics, preference and rate-limit records as expected. Source code defines 365-day cleanup for analytics/preferences and 15-minute expiry for counters, but the live schedule is an account setting.
6. Bulgarian PDPA Article 25c requires parental/guardian consent when processing based on consent for a child under 14 in connection with an information society service offered directly to them. The Website does not ask age or verify guardian authority. The policy discloses this; the notice itself does not obtain that consent.
7. Assess localStorage/sessionStorage/IndexedDB use under Article 4a of Bulgaria's Electronic Commerce Act and ePrivacy rules. The current app stores user-selected settings and app data without an additional storage-consent gate. Do not infer that every item is exempt merely because it is first-party or does not leave the browser.
8. Confirm the provider-specific transfer terms, destinations, processors and safeguards applicable to this account. Public provider documents do not establish which contracts or controls apply.

## Policy source and publication

The source notices are generated from `src/lib/privacy/{bg,tr,en}.md` by `scripts/policies.mjs` into `public/policies/*.json`. The PHP policy route selects a newer deployed policy over an older private copy by its `updatedAt` value. The source generator now dates this revision 22 November 2026; confirm the rendered policy route after deployment, especially if a private policy has a later date. No live policy text was changed from this workspace.

The policy was checked against the application code, the supplied configuration, and primary-source material recorded in [privacy-policy-source-review.md](privacy-policy-source-review.md). Publishing policy text does not configure providers, alter logging or backups, verify a transfer mechanism, or change application behaviour.
