# Privacy and deployment checks

The supplied privacy text is scoped to this application's implemented behaviour. It is not a certification of a hosting account or a replacement for legal review. Operators must supply truthful identity/contact information and verify providers, access, logs, backups, transfers and their actual audience.

## Processing boundaries

- Games, custom names, scores, colours, icons, timer state, imports and shared payloads stay in the browser. A person can deliberately share a URL snapshot or JSON file.
- URL payloads use fragments, not query strings. The application removes incoming data fragments before its optional beacon can load. Share links are public to anyone who has them, not encrypted, and not live collaborative sessions.
- First-party usage analytics accept only a fixed event allowlist and public page paths. Arbitrary strings, input contents, query strings and game content are rejected.
- No visitor IP address or IP-derived visitor identifier is stored in application analytics. Trusted addresses are processed transiently for login protection. Security counters are separate from analytics records. Authenticated administrators are automatically excluded from first-party usage analytics.
- Hosting logs, AWStats (if enabled by the host), Cloudflare delivery/security and email correspondence are separate from optional application analytics. Rejecting consent does not turn those off. Do not modify hosting-level logging under the assumption that the consent panel controls it.
- The consent cookie is site-specific, opaque, Secure and HttpOnly in production. Portfolio consent on a different host is not reused.
- Usage consent withdrawal deletes the associated live analytics in a transaction. Analytics writes and consent changes lock the same preference record to prevent a late write from recreating withdrawn records.
- Cloudflare is optional and disabled by default. Automatic upstream injection must be disabled separately; test actual requests.
- Timers, theme selection, device-language suggestions and interface nudges do not contact third-party services.

## Before enabling analytics

1. Verify the public policy's operator details and all three translations.
2. Confirm provider locations, contracts, international-transfer arrangements, log retention and backup expiry. Do not assume a provider's default configuration.
3. Confirm that hourly cleanup runs successfully without page visits and that failures are reported.
4. Test no consent, reject, separate opt-ins and withdrawal. Inspect requests, server acceptance and stored rows, rather than checkbox state alone.
5. Ensure the consented page paths and predefined event labels contain no user content. Confirm shared fragments do not reach custom analytics or the optional beacon.
6. For services used directly by children, assess the applicable consent/guardian requirements before enabling optional analytics. The default deployment disables collection. No age-profile system is invented by the app.
7. Confirm HTTPS, private storage permissions, authenticated administration, session expiry, CSRF rejection, login limits and cache bypasses.

## Policy maintenance

Publishing a policy edit changes only text. It does not authorise new tracking, configure retention, enable Cloudflare or update hosting arrangements. Keep the published policy consistent with actual processing and review all languages when changing behaviour. The separate portfolio policy is not edited by this project.

Relevant primary references: [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/), [Bulgarian Commission for Personal Data Protection](https://cpdp.bg/en/), [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/), [Cloudflare IP ranges](https://www.cloudflare.com/ips/).
