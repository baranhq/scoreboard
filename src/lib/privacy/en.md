This Privacy Policy explains how Baran's Scoreboard (the **Website**) processes information when you visit or use the Website at **https://scoreboard.baranhq.com/**.

**Data controller:** Baran Ahmedov, Bulgaria (operating the Website as an individual).
**Privacy contact:** [baran@baranhq.com](mailto:baran@baranhq.com)

The Website does not require a visitor account. Most scoreboard information stays on your device. However, **technical data is processed automatically when you access the Website**, whether or not you accept optional analytics. This policy explains the difference.

## 1. Information processed automatically when you visit

**Cloudflare network services.** The Website uses Cloudflare to deliver and protect its pages. When you connect, Cloudflare processes technical request and connection information that can include your IP address, requested page or resource, request time, browser or device information, network-related information, and security signals. Cloudflare also provides network traffic and security statistics. This processing takes place regardless of your optional analytics choices. Cloudflare may set technically necessary security cookies (for example, when bot detection or a security challenge applies).

**Hosting access logs and AWStats.** The hosting provider automatically generates access logs for requests it receives. Depending on the server configuration, those records may include an IP address, time and date, requested URL or resource, HTTP status, browser/user-agent data, referrer, and other technical request details. **AWStats is provided by the hosting company and is enabled on this hosting account.** The operator actively uses its traffic reports, which are generated from the hosting access logs. AWStats is separate from the optional browser-based analytics described below. **Rejecting optional analytics does not stop hosting access logs or AWStats reporting.**

**Why this happens.** Network delivery, troubleshooting, protection against attacks, and prevention of abuse are pursued on the basis of legitimate interests under Article 6(1)(f) GDPR, where applicable. The Website's use of access-log statistics through AWStats is also based on its legitimate interest in understanding overall traffic, subject to the necessary balancing of that interest against visitors' rights. Service providers may separately process data to comply with their legal obligations. You can object to processing based on legitimate interests as described below.

These systems may receive or process IP addresses even though the Website does not require you to identify yourself or open an account.

## 2. Optional analytics — only with your choice

**Both optional analytics systems are enabled for the Website, but collection for your browser remains off until you consent to the corresponding service.** Each has its own choice in the privacy panel. You can accept either, both, or neither. The legal basis for the processing described in this section is your consent (Article 6(1)(a) GDPR).

**A. Baran's Scoreboard site usage analytics**

When you consent to **Site usage analytics**, the Website records a randomly generated browser preference token (held as a hash on the server), visits and page-view times, limited public page paths, and estimated active time. It also records these predefined actions: making a scoreboard, entering fullscreen, exporting a backup, and importing a backup. A visit ends after 30 minutes of inactivity. Active time is estimated only while the page is visible, focused, and recently used.

This information is stored in the Website's MySQL database and is accessible through the protected administration interface. Authenticated administrator visits are excluded from this analytics system. The system does not intentionally store IP addresses, IP-derived visitor IDs, browser fingerprints, precise location, URL query strings, field contents, scoreboard names, team names, scores, mouse recordings, or screen recordings. This statement concerns **the Website's own usage analytics only**; it does not describe hosting logs or Cloudflare's separate processing.

**B. Cloudflare Web Analytics**

When you separately consent to **Cloudflare Web Analytics**, the Website manually loads Cloudflare's analytics beacon. It measures page views, navigation and performance information, including browser timing and Core Web Vitals. Cloudflare's reports can show page paths, referrers, approximate country, device type, browser, and operating system. The Website does not intentionally send scoreboard contents, text entered in fields, its custom analytics events, or estimated active time to this beacon.

Cloudflare documents that its Web Analytics service does not track individual visitors across customers' websites and does not log URL query strings. This service is distinct from the Cloudflare network delivery and security processing that occurs automatically.

See [Cloudflare Web Analytics documentation](https://developers.cloudflare.com/web-analytics/about/) and [Cloudflare's Privacy Policy](https://www.cloudflare.com/privacypolicy/).

## 3. Scoreboards, backups, and sharing

No public account or automatic public login is required. Scoreboard names, team names, scores, icons, appearance settings, timer settings and state, and related scoreboard information are stored locally in your browser's **IndexedDB** database named scoreboard. The Website does not intentionally upload this information to its application server or include it in either analytics system.

Leaderboards and tournament brackets are saved only when you choose Save, in a separate browser IndexedDB database named **scoreboard-studio**. It holds titles, participant names, table values, manual rankings, match results and visual settings. PNG images and JSON backups are generated locally; the Website does not intentionally upload their contents. You can delete saved tables in My Tables. These local records remain until you delete them or the browser removes site data. Unsaved edits also have a recovery draft in this tab’s sessionStorage. A draft is removed after a successful save and normally disappears when the tab’s session ends. Save or download a backup to keep your work.

You may export a JSON backup to a file on your device or import a backup locally. You are responsible for deciding where to keep or share those files.

If you make a share link, the scoreboard snapshot is encoded in the **URL fragment** (the part after #), rather than stored in a server-side sharing database. The fragment is not sent as part of an ordinary HTTP request to the Website. The application also consumes incoming share fragments locally and removes them before the consent-controlled analytics beacon can load. **Anyone who receives the full share link can view and copy the scoreboard snapshot.** Later changes are not synchronized; recipients open their own independent copy. Share links may also remain in your browser history or in messages where you paste them. Avoid putting confidential or sensitive personal information into scoreboards or links.

Local data may disappear when you clear site data, use private browsing, switch devices or browsers, move to a different domain, or experience browser storage limits. A normal application update on the same origin does not intentionally delete scoreboards. Keep exported backups of information you want to preserve.

## 4. Cookies and local storage

The following Website-controlled items are used:

**score_preferences cookie**: Remembers the privacy preferences associated with a random opaque token and permits server-side enforcement of the Site usage analytics choice. Up to **180 days**. On HTTPS it uses Secure, HttpOnly, and SameSite=Lax.

This cookie is specific to this Website and is not shared with or reused by the separate portfolio site on another host.

**Server-side privacy preference record**: Holds the choices associated with the token; the token is hashed in the database. No more than **one year**.

**score_admin cookie**: Authenticates the private administration session; this is **not** a visitor login. At most **one hour**; Secure, HttpOnly, and SameSite=Strict.

**Browser IndexedDB and local preferences**: Stores scoreboards, selected scoreboard, language, theme, and dismissed language suggestion, generally until you delete site data or your browser removes it. Any GitHub-star reminder value saved by an earlier version is deleted locally when the Website's interface loads.

Cloudflare may also use security cookies where its protection features require them; their presence and lifetimes depend on the security feature. See [Cloudflare's cookie documentation](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/).

The server checks stored consent on each first-party analytics request. A preference cookie may be needed to remember a rejection as well as an acceptance. Local functional settings and private administrator authentication are not permission to use optional analytics.

## 5. Privacy choices and withdrawal

You can manage **Site usage analytics** and **Cloudflare Web Analytics** separately through **Privacy choices** in the Website footer or the privacy page. Closing the choice panel without saving is not consent. You can use the scoreboard without accepting either option.

If you withdraw consent for Site usage analytics, the Website stops future collection under that choice and removes live analytics records linked to that browser's privacy token. If you disable Cloudflare Web Analytics, the Website stops new beacon loading and reloads the page to end the active integration; a request already in progress may finish. Withdrawal does not retroactively make previous lawful processing unlawful and does not automatically erase hosting logs, AWStats reports, Cloudflare network records, existing backups, or Cloudflare's previously processed analytics.

Other open Website tabs refresh privacy preferences when focused and receive same-site change notifications. If a tab has already loaded the Cloudflare beacon, it reloads when it learns that the corresponding consent was withdrawn, ending that tab's active integration. Deleting the privacy cookie may prevent the Website from associating an earlier analytics record with your browser. Deleting that cookie does not delete the separately stored scoreboards in IndexedDB.

## 6. Private administration, security, and messages

The public Website has no registration or ordinary visitor sign-in. An authorized operator may sign in to the private administrator area. The operator configures an administrator password outside the public source repository. Authentication uses an administrator session cookie and security controls.

To help limit login attempts and public API abuse, the Website temporarily processes connection IP addresses for rate-limiting. A keyed hash and counter are kept in a separate security table over a **15-minute** rate-limit window, with scheduled cleanup normally running hourly. The rate-limit table does not retain raw IP addresses, and those hashes are not used as visitor identifiers. Expired records may remain until delayed cleanup completes. Security processing is based on legitimate interests in preventing unauthorized access and keeping the service available.

If you email **baran@baranhq.com**, your email address, message, attachments, and related correspondence metadata are processed to respond to your enquiry and, where necessary, preserve relevant records or handle a dispute. The legal basis is legitimate interests in handling communications and protecting legal rights, or another applicable lawful basis where required. The Website does not provide a contact form.

## 7. Who can receive information

The Website operator and authorized personnel of necessary service providers may access information within their roles. These providers include the **shared hosting/database provider**, which supplies access logs and AWStats reporting; **Cloudflare** (network delivery, security, traffic information, and, with consent, Web Analytics); and the **email provider** when you contact the operator. Hosting personnel may have access to logs and reports to operate, maintain, secure, or support the hosting service. Information may also be disclosed when legally required or when necessary to establish, exercise, or defend legal claims, subject to applicable law.

The Website does **not** sell visitor personal data, use advertising tracking, or send marketing emails. When you choose to open an external link (including GitHub), that external website is responsible for its own processing, subject to its own privacy policy.

## 8. Retention

**Website usage analytics:** Visits, page views, and predefined events older than **365 days** are excluded from administration queries. Scheduled cleanup deletes expired live records. Expired records may remain in storage until cleanup completes successfully.

**Privacy choices:** the preference cookie lasts up to **180 days**; its server-side record expires within **one year**.

**Administrator sessions:** at most **one hour**. Temporary rate-limit records become inactive after a **15-minute** window and are removed by scheduled cleanup. Expired records may remain until cleanup completes.

**Local scoreboards:** generally retained in your browser until you or the browser remove them; the server does not administer their retention.

**Cloudflare Web Analytics:** Cloudflare says it keeps unsampled beacon data for **seven days**, then aggregates to approximately **10%** for longer-term storage; its dashboard displays up to **six months** of historical data. Provider policies may change.

**Hosting access logs and AWStats reports:** these provider-managed records are handled under the shared hosting provider’s service and retention practices. The operator uses AWStats traffic reports; rejecting optional analytics does not stop this hosting-level processing.

**Server and database backups:** The operator may make manual backups as needed for maintenance, security, and disaster recovery. Operator-managed backups are retained according to operational needs and applicable legal obligations, reviewed periodically, and deleted when no longer necessary where deletion is under the operator’s control. The hosting provider may also make automatic backups under its own service and retention practices. Deleting data from active systems may not immediately remove copies in existing backups. Before reopening a restored service, deployment procedures require purging restored optional analytics and consent records.

**Email enquiries:** retained only as long as reasonably necessary for the enquiry and any related legal obligations or disputes, with periodic review.

**Cloudflare network and security records:** Cloudflare processes network and security information independently of analytics consent. These records are handled under Cloudflare’s applicable service and retention practices; see [Cloudflare’s Privacy Policy](https://www.cloudflare.com/privacypolicy/).

## 9. International processing and transfers

Cloudflare and the shared hosting provider may process information outside Bulgaria and, where applicable, outside the European Economic Area (EEA). Processing locations, service providers, and transfer arrangements depend on the services and contractual settings in use. Where GDPR requires a transfer mechanism for data transferred outside the EEA, an appropriate mechanism must apply. You may contact the operator for information about the arrangements applicable to this Website.

Cloudflare publishes a [Data Processing Addendum](https://www.cloudflare.com/cloudflare-customer-dpa/) and [EU Standard Contractual Clauses](https://www.cloudflare.com/cloudflare-customer-scc/); publication of those terms does not establish which terms or safeguards apply to this website. You may contact the address above for available information about the arrangements in use.
## 10. Your rights

Depending on the circumstances, GDPR grants rights to **access**, **rectify**, **erase**, or **restrict** processing of your personal data, request **data portability**, and **object** to processing based on legitimate interests. You can **withdraw consent** at any time without affecting the lawfulness of processing before withdrawal. Some rights are subject to legal conditions or exceptions.

Email **[baran@baranhq.com](mailto:baran@baranhq.com)** to exercise your rights. The operator may ask for reasonable information necessary to identify the relevant records and prevent unauthorized disclosure. Requests are generally answered within **one month**; lawful extensions may apply. When records are held only locally in your browser, you can inspect or erase them using the Website's and browser's controls rather than requesting server-side deletion.

You may complain to a data-protection supervisory authority without contacting the operator first, including Bulgaria's **Commission for Personal Data Protection (CPDP / КЗЛД)**: [cpdp.bg](https://cpdp.bg/en/).

## 11. Children and classrooms

The Website may be used in educational settings. It does not require students to open accounts or submit personal information to use scoreboards. Do not place sensitive or confidential information in team names, scoreboard content, exports, or share links.

Under **Article 25c of Bulgaria's Personal Data Protection Act**, when processing a child's data is based on consent and the child is **under 14**, consent must be given by a parent exercising parental rights or the child's guardian. The Website does not ask visitors' ages, keep student profiles, or verify a parent's or guardian's authority. A child under 14 should not enable optional analytics without that authorization. The operator must ensure that any use by children under 14 has the required authorization; the Website has no age or guardian-verification flow, and this notice alone does not obtain valid consent. Schools and other independent operators are responsible for their own use of the tool and any information they choose to enter or disclose. See the [Bulgarian Personal Data Protection Act](https://cpdp.bg/en/legislation/personal-data-protection-act/).

## 12. Required information and automated decisions

You do not need to provide a name, email address, or visitor account to use the public scoreboard. Essential technical connection information is processed when you access pages; without that processing, the Website cannot be delivered securely. Optional analytics are not required to use the Website. No internet service can be guaranteed completely secure. The Website does not make solely automated decisions about visitors with legal or similarly significant effects and does not perform such profiling.

## 13. Policy updates

This notice may be updated when the Website, providers, or processing practices change. The current version and its update date will be published on this page. If a change requires consent for new processing, the relevant consent will be requested before that processing begins.

## 14. Contact

**Baran Ahmedov**
Bulgaria
**Email:** [baran@baranhq.com](mailto:baran@baranhq.com)
