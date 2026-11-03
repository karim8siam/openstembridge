# OpenSTEM Match — Research talent review guide

**Internal reviewer guidance; not a guarantee of candidate quality, affiliation or hiring suitability.**

## Before adding any students to the public directory

1. Verify explicit **public listing opt-in**. Without it, never post the student's name, institution or portfolio publicly. Email stays private in every case.
2. Check the submitted work URL. It should refer to real code, notebooks, a paper, poster, technical write-up or independently verifiable project. Do not assume ownership from a URL alone.
3. Confirm that the listed subject and skills plausibly correspond to actual work. For example, “quantum computing” should ideally include a relevant simulation, research note or course project.
4. Ask the student to correct overstatements, unverifiable positions or sensitive material. Do not describe an application as “verified” if only self-reported details have been read.
5. Review privacy risks: research data, private GitHub repositories, unpublished intellectual property, personal contact information or identifying information about other people must not be copied into public profile text.

## Evaluating a specific researcher request

Use a **project-specific** review, not a global “top student” leaderboard. The private admin panel offers only simple discipline/skills keyword suggestions. It is not an AI recommendation and must not be treated as a credential check.

| Dimension | What to check | What not to infer |
|---|---|---|
| Subject alignment | Relevant coursework, research interests, project area | Degree title alone proves readiness |
| Technical methods | Reproducible code, data analysis, laboratory or mathematical method | A long list of software means mastery |
| Demonstrated work | Publications, open projects, carefully documented coursework, reports | Number of publications alone reflects scientific potential |
| Communication | Clear summary, technical writing, reproducibility notes | Confidence or fluent English guarantees skill |
| Practical fit | Hours, time zone, compensation, working style, eligibility | Talent alone guarantees someone is available |

## Project interests and researcher publication workflow

- A researcher brief is PRIVATE by default. It is published only when **public_opt_in = true**, its moderation status is `approved`, its project title is supplied, and `identity_checked = true` has been set by the staff reviewer.
- Verify the claimed institution and lab affiliation independently before marking `identity_checked`. The checkbox is a reviewer assertion, not an automated verification service.
- In the new **Project interests** tab, check the applicant's evidence and motivation, then request informed permission from both the student and the researcher BEFORE sharing personal contact details. Mark records `contacted` only after real communication.
- A paid, stipend or volunteer arrangement needs clear terms. Researcher screening should cover supervisor capacity, who gives feedback, weekly hours, duration, travel/time zones and safety approval where relevant.
- Delete expired, inappropriate or unauthorized research calls; changing moderation status to `contacted` or `rejected` also removes a public call (public requires `approved`).

## Researcher verification

- Before introducing a student privately, confirm that the researcher is genuinely associated with the lab or organization they claim to represent. Check public institutional directories and verify from an official address when practical.
- Ask for a written project scope and honest compensation/funding information. Do not disguise an unpaid role as a paid position.
- Check for research ethics, licensing, age/eligibility, university authorization, export controls, privacy, work arrangements and applicable laws as appropriate.
- Do not forward a student's email, private CV or unpublished research without a clear basis and permission.

## Operational workflow

1. Visit `/admin.html` and load the review queue with your secret `ADMIN_TOKEN`.
2. Review pending student evidence; contact applicants by email to request clarifications. Mark `approved` only after a deliberate review. The profile becomes public **only if** the public opt-in was checked.
3. Review pending researcher requests. Use the subject/skills shortlist to identify possible candidates, then verify relevant abilities and arrange introductions personally.
4. Move records to `contacted` or `rejected` as appropriate. The software does not email the applicant automatically.
5. Process privacy deletion requests by using the permanent-delete control on the respective record; establish a documented retention period and review it regularly.

## Launch prerequisites

This MVP has no automated identity checks, institution-confirmation email, file upload verification, user accounts, full application status messaging, automatic matching engine, research ethics review or notification workflow. Add these before scaling to large volumes or presenting yourself as a formally vetted recruitment service.
