# Privacy and deployment checks

The checked-in notices under `src/lib/privacy` describe the supplied Baran's Scoreboard instance. On 2026-11-03, the operator confirmed that production uses Cloudflare as a reverse proxy and for network protection and traffic/security statistics; AWStats is enabled and its reports are actively used; and both first-party Site usage analytics and Cloudflare Web Analytics are enabled. Each optional analytics system collects per-visitor analytics only after its separate consent is given. Cloudflare network-level processing and hosting logs are independent of those choices.

The repository can verify application behaviour, but not hosting-level settings, provider contracts, or scheduled jobs. The notices are not a compliance certification or a replacement for legal review. Self-hosters must adapt the three notices to their own identity, providers, services, users, retention and legal arrangements.

## Confirmed production facts

- The deployment uses shared hosting; the provider name and hosting region have not been supplied.
- The hosting company provides AWStats, it is enabled, and the operator uses its reports. AWStats and hosting access logs are outside the website's analytics consent controls. The application does not assert that AWStats cannot be disabled.
- Cloudflare reverse proxy, network protection and traffic/security statistics are active. Cloudflare Web Analytics is manually loaded after its separate consent; Cloudflare network-level processing happens regardless of that consent.
- Both optional analytics capabilities are enabled in production, but their per-browser collection remains off until the visitor makes the corresponding choice. The application's repository defaults remain off.
- The operator may make manual backups as needed. The hosting provider may also make automatic backups; frequency and retention have not been verified.

## Processing boundaries

- Games, custom names, scores, colours, icons, timer state, imports and shared payloads stay in the browser. A person can deliberately share a URL snapshot or JSON file.
- URL payloads use fragments, not query strings. The application removes incoming data fragments before its optional beacon can load. Share links are public to anyone who has them, not encrypted, and not live collaborative sessions.
- First-party usage analytics accept only a fixed event allowlist and public page paths. Arbitrary strings, input contents, query strings and game content are rejected.
- No visitor IP address or IP-derived visitor identifier is stored in application analytics. Trusted addresses are processed transiently for login protection. Security counters are separate from analytics records. Authenticated administrators are automatically excluded from first-party usage analytics.
- Hosting logs, AWStats, Cloudflare delivery/security and email correspondence are separate from optional application analytics. Rejecting consent does not turn them off.
- The consent cookie is site-specific, opaque, Secure and HttpOnly in production. Portfolio consent on a different host is not reused.
- Usage consent withdrawal deletes the associated live analytics in a transaction. Analytics writes and consent changes lock the same preference record to prevent a late write from recreating withdrawn records.
- Cloudflare Web Analytics is manually loaded by the application after consent. The repository cannot verify whether a separate Cloudflare automatic beacon injection is disabled in production; inspect actual production responses and requests.
- Timers, theme selection, device-language suggestions and interface nudges do not contact third-party services.

## Unresolved deployment and compliance items for operator review

1. Identify the shared hosting provider, processing locations and sub-processors. Confirm retention/deletion criteria for raw access logs and AWStats reports, and which provider controls are available for those services.
2. Confirm how operator-managed and hosting-provider backups are created, accessed and deleted. Do not add fixed schedules or expiry periods unless verified. Keep operator-managed copies reviewed and remove them when no longer necessary where the operator controls deletion.
3. Confirm Cloudflare's applicable network/security log categories and retention periods, processing regions, account terms/DPA and any transfer safeguards. Verify that no automatic beacon bypasses the manual consent gate.
4. Confirm international transfer arrangements for the hosting and Cloudflare services, including applicable regions, sub-processors and transfer mechanisms. Cloudflare's published DPA/SCCs do not by themselves establish which safeguards apply to this account.
5. Verify that production runs the analytics cleanup task hourly, including during low-traffic periods, and monitors failures. Application queries exclude records older than 365 days, but physical deletion depends on scheduled cleanup. Also verify backup-restoration procedures purge restored optional analytics and consent records before service reopens.
6. The app does not ask a visitor's age or verify parent/guardian authority. For consent-based processing involving children under 14, confirm how valid parental/guardian consent is obtained for the actual audience and classroom use; the notice itself is not a consent mechanism.
7. Identify the email provider and its applicable processing locations and retention arrangements if available.
8. Check whether a private policy file configured through `POLICY_PATH` overrides the checked-in generated policy files in production, and publish the updated text to the active policy source when deploying.

## Ongoing operational checks

1. Verify operator details and all three language versions before release.
2. Test no consent, reject, separate opt-ins and withdrawal. Inspect requests, server acceptance and stored rows, rather than checkbox state alone.
3. Ensure consented page paths and predefined event labels contain no user content. Confirm shared fragments do not reach custom analytics or the optional beacon.
4. Review child audience and guardian-consent arrangements before analytics use in classrooms.
5. Confirm HTTPS, private storage permissions, authenticated administration, session expiry, CSRF rejection, login limits and cache bypasses.

## Policy maintenance

Publishing a policy edit changes only text. It does not configure provider logging, enable analytics, set retention, verify a transfer mechanism or change the hosting arrangements. Keep the public notices aligned with actual processing. The separate portfolio policy is not edited by this project.

Relevant primary references: [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng), [Bulgarian Personal Data Protection Act and Article 25c](https://cpdp.bg/en/legislation/personal-data-protection-act/), [Bulgarian Commission for Personal Data Protection](https://cpdp.bg/en/), [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/), [Cloudflare Web Analytics retention documentation](https://developers.cloudflare.com/web-analytics/faq/).
