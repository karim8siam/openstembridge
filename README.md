# OpenSTEM Research Match v2 — Research Exchange + Mentorship Toolkit

A premium, responsive researcher–student matching website that builds on the original ZIP (same branding, AI-generated lab visuals, candidate search, 5 OpenSTEM network links, Discord and email). This v2 adds a vetted public research-call board, private student expressions of interest, transparent project requirements, stronger application data, 30-day mentorship-charter builder, research portfolio sprint, referral messages and a three-queue moderator console.

**Release status: complete source-code MVP; NOT DEPLOYED.** There are **no actual students, published live research calls, or institution partnerships** preloaded. Examples are consistently marked as illustrations. A university or researcher is not endorsed merely for appearing on the website.

## Fast preview (no backend)

```bash
python3 -m http.server 8787
```

Open `http://localhost:8787/`. All front-end interactions (search, demo briefs, portfolio checklist, mentor charter, mobile menu and modal forms) are available. Submissions fail safely and offer an explicit email alternative; the website NEVER reports that an offline application was saved. On an unconfigured live backend there will be example research briefs rather than real calls.

## New capabilities in v2

1. **Research opportunities board**: searchable by keywords and discipline, with arrangement, expected hours, duration, location expectations, funding details and mentorship plan. Real calls only appear if approved, manually identity-checked, explicitly opted into publication and not past their deadline.
2. **Private interest applications**: students express interest in a specific live call with evidence URL and a tailored motivation letter; requests go to the private admin queue (not to a professor automatically).
3. **Stronger student profiles**: evidence links, research goal, time zone, availability, collaboration preference and optional discovery attribution; no public email and no auto-ranked “top students.”
4. **Stronger researcher briefs**: project scope, prerequisite skills, compensation arrangement, funding detail, duration, hours, work mode, geographic needs, selection criteria and promised feedback.
5. **Mentorship environment**: interactive, local-only first-month charter builder and milestone plan covering safety, review cadence, expectations and authorship.
6. **Student funnel**: self-checked evidence checklist, 7-day project exercise using OpenSTEM Lab/Replicate resources, and student signup.
7. **Researcher + community invitations**: copyable outreach text; StudexaX Discord and five original OpenSTEM properties remain linked.
8. **Privacy and moderation**: separate candidate / research request / project interest queues; explicit 18+ self-attestation; dual-consent introductions as a manual procedure, identity verification flag for public briefs; permanent delete.

## Deploy as a NEW Cloudflare Pages site

1. Upload these source files to your GitHub repository. In Cloudflare Pages (Git integration), create a new Pages project. Build command: none; output directory: `.` if the repository root directly contains `index.html`. Ensure the `functions/` directory is deployed as Cloudflare Pages Functions.
2. Create a Cloudflare D1 database called `openstem-research-match` (or another name you choose).
3. Bind it to the Pages project as `DB` in production bindings (optionally preview too).
4. Run `schema.sql` in the new database (only for fresh installs):

   ```bash
   npx wrangler d1 execute openstem-research-match --remote --file=./schema.sql
   ```

5. Add encrypted Pages secrets, not public plaintext variables: `ADMIN_TOKEN` (long independent secret, at least 32 characters) and `RATE_LIMIT_SALT` (different randomly generated secret). **Never commit these.**
6. Redeploy and confirm: `GET /api/candidates` returns `{ "candidates": [] }` and `GET /api/opportunities` returns `{ "opportunities": [] }`. Use `/admin.html` to check private queues with the bearer token.
7. Test a new student application, private researcher brief, researcher identity check + approval + publishing consent, and a student project interest. Confirm no email appears in public API responses.
8. Set the actual deployed domain in canonical/OG metadata, sitemap, sharing and Search Console. No domain for this new site has been assumed or embedded as canonical.

### IMPORTANT: upgrade an EXISTING v1 D1 database

**Do not run `schema.sql` on top of a v1 database expecting it to add columns.** Take a D1 backup/export, then execute `migrations/001_research_exchange.sql` **once** against that database before you deploy v2 code:

```bash
npx wrangler d1 execute YOUR_EXISTING_DATABASE_NAME --remote --file=./migrations/001_research_exchange.sql
```

Migration is additive. Existing profiles and requests remain private by default. Legacy requests have no project title or publication consent, so they cannot appear as public research calls without being resubmitted with a complete brief. This is intentional. The migration is *not idempotent*: do not run twice.

## API

| Method | Endpoint | Result |
|---|---|---|
| GET | `/api/candidates` | Approved public-opt-in profiles; no email |
| GET | `/api/opportunities` | Approved + identity-checked + opted-in non-expired calls; no email |
| POST | `/api/apply` | Private student application, pending |
| POST | `/api/request` | Private researcher project brief, pending |
| POST | `/api/interest` | Private interest in a genuine published call, pending |
| GET | `/api/admin` | Token-gated review queues (latest 250 per category) |
| PATCH | `/api/admin` | Token-gated status and researcher identity-check flag |
| DELETE | `/api/admin` | Token-gated permanent deletion; deleting a project deletes associated interests |

Application APIs require consent and an 18+ self-declaration. Inputs are validated. A per-connection hourly rate limit is applied. Researcher email is not returned by the public opportunities API.

## Test commands

```bash
npm run check
npm test
```

The checks cover JavaScript syntax, 18 API/security smoke conditions, initial/migrated SQLite schema compatibility, and manual desktop/mobile rendering when tested with a browser. The supplied JS smoke tests use an in-memory DB double, **not a running production Cloudflare Pages/D1 service**.

## Growth and safety operations

Read [`LAUNCH_PLAYBOOK.md`](LAUNCH_PLAYBOOK.md) for acquisition, quality gates, two-sided-network sequencing and testable KPIs. Read [`REVIEW_GUIDE.md`](REVIEW_GUIDE.md) for consent and faculty/student review. Read [`MENTORSHIP_RATIONALE.md`](MENTORSHIP_RATIONALE.md) for the academic mentoring recommendations used in the builder.

### Things NOT implemented

- Researcher institution single-sign-on or automatic authoritative credential checks (human moderation only).
- Full user accounts, real-time DMs, video calls, calendars, file uploads or hosted multi-user project rooms.
- Transactional emails, automatic introductions, AI skill certification, academic-grade badges or guaranteed placement.
- Full abuse review tooling, automated data retention, privacy law compliance review, jurisdiction-specific employment/legal advice and large-queue pagination.
- Updates to the other five **live** OpenSTEM websites (this source links to them; adding a link **back** from their deployed sites requires separately editing those websites).

**Public deployment checklist:** Identity-verification SOP, privacy-law review, realistic response capacity, rate limiting/bot protection, documented consent for sharing applicant data, 18+ eligibility policies, and an institutional policy review where needed. In particular, moderator approval must never be represented as university endorsement.

## Included network destinations

- OpenSTEM Library: https://openstemlibrary.com/
- OpenSTEM Lab: https://openstemlab.org/
- OpenSTEM Field: https://openstemfield.org/
- OpenSTEM Tool: https://openstemtool.org/
- OpenSTEM Replicate: https://openstemreplicate.org/
- OpenSTEM Recruitment: https://openstemrecruitment.com/
- StudexaX Discord: https://discord.gg/tBBKtvFJzW
- Contact: shahriyarkarimsiam@gmail.com
