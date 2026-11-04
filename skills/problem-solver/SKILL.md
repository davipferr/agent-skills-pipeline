---
name: problem-solver
description: Evidence-driven method for investigating and fixing bugs, errors, rejections, integration failures, wrong data, and "why is this happening?" tickets. Use whenever the user reports an error or unexpected behavior, pastes a ticket/work item/stack trace/error code, asks to debug, find a root cause, analyze a failure, fix a production issue, or write the analysis/closing comment for a task. Also use for development tasks that change shared code (scope, impact, testing).
---

# Problem Solver

This skill encodes a specific way of solving problems. It is not about any one domain. It is a
mindset plus a repeatable process: **distrust claims, find the source of truth, compare what works
with what fails, isolate one variable at a time, understand *why* the fix works, control the blast
radius, and write everything down.**

Take a deep breath and solve the problem step by step. Don't rush the answer.

---

## Execution mode (read first)

The thinking process below is the same everywhere. What changes per project is **who runs
things**. The project's `CLAUDE.md` decides it with one line:

```
problem-solver mode: hands-on
```

- **Hands-on** (`problem-solver mode: hands-on`): Claude does every step itself — runs and debugs
  the application, reproduces the problem, replays requests, and runs tests.
- **Hands-off** (the line is missing or says `hands-off`): Claude **does not debug and does not
  test** — no debugger, no running the app to reproduce or inspect behavior, no replaying requests,
  no automated or manual test runs. Everything else is allowed: read and search the code, read
  git history, read logs, run read-only queries, fetch docs, and edit code.
  - Wherever a phase says debug, reproduce, replay, or test, turn it into **precise instructions
    for the user**: where to put the breakpoint, which variable or value to inspect, which request
    to send, which scenario to run, and what result would confirm or kill each hypothesis. Then
    wait for the user's results and continue the reasoning from them.
  - In the final comment, mark which evidence came from the user's runs.

When in doubt about the mode, use hands-off.

---

## 1. Core beliefs

1. **Every statement is a hypothesis until data confirms it.** This includes the ticket, the
   support team, the reporter's proposed fix, the vendor, the documentation, AI output, a
   colleague's previous fix, and my own earlier conclusions. "They said X" means "check X".
   - The ticket says component A is used, but the code or config shows B.
   - The ticket names a company or record that doesn't exist.
   - The reporter proposes "add field Y". A proposal backed by a single example is weak evidence,
     especially when other records without Y work fine.
2. **The source of truth decides, not opinions.** Identify it explicitly: the schema or contract
   (XSD, OpenAPI, DB constraints), the reference environment, the real persisted data, or the
   actual request and response on the wire. When the source of truth says the payload is valid,
   stop suspecting the payload and move to the next layer.
3. **Look at raw evidence, not summaries.** A generic "Error 500" hides the real error. Get the
   actual stack trace, the actual response body, and the actual row in the database.
4. **Failures are explained by differences.** When something works for A and fails for B, the
   answer is in the diff between A and B: data, config, date, version, environment, code path.
5. **A fix you can't explain may be a false positive.** Ask: "Why does this change work? Would it
   still work with other values?" A past fix that worked for one value can break the next one.
6. **External rules aren't always logical.** Third-party validations are sometimes just what they
   are. Once the evidence proves it, accept the rule, apply it narrowly, and document it. Don't
   fight it or generalize it.
7. **Scope is part of the solution.** Knowing who else runs this code is as important as the fix.
8. **Write it down while working.** Keep a numbered, running log of questions, findings,
   hypotheses, dead ends, and decisions. The log turns into the final comment and into reusable
   knowledge.

---

## 2. The workflow

Follow these phases in order. Move back to an earlier phase whenever new evidence breaks an
assumption.

### Phase 0: Check it's not already solved
- Search for precedent: earlier tickets, commits, comments, or runbooks with the **same error
  message or code**. Often the same error has a history across several tasks. Reading them
  together makes the real pattern obvious. For example, three earlier fixes may show that one
  error message always means "we're sending value V1 where this provider expects V2".
- Check whether the fix is already in the code, deployed, or applied to this case, possibly under
  another ticket. If it is, the answer is a short "already fixed in X, verified with Y" and no new
  change.
- Check timing: did the failures happen **before** the fix reached production? For example, the
  failures happened the same day the fix was deployed but before the deploy. Then the right move
  is to reprocess or retest, not to re-fix.

### Phase 1: Getting the context
Write a numbered list of questions and answer each one inline (`question -> answer`). Typical
questions:
1. What is the **exact** error: message, code, and where it appears? Copy it literally.
2. **Since when?** What changed around that date: deploys, config, vendor or API version, data,
   the calendar (year rollover, a new rule coming into force)?
3. **Who is affected?** All users, tenants, or regions, or only some? What do the unaffected ones
   have that the affected ones don't?
4. Are the reporter's claims true? Verify every factual claim in the ticket against the code and
   data.
5. Is there a **real failing record** I can use to reproduce the problem? Is there a working one to
   compare with?
6. Which code path actually runs? Which class, config row, version, or override? Confirm it by
   debugging or querying, not by reading names.
7. What does the source of truth (spec, schema, documentation, reference data) say about this
   exact field or behavior?

### Phase 2: Locate where it fails
- First split: **is it failing on our side or on the external side?**
  - **Our side:** debug until the exact line fails, then inspect which value is null, wrong, or
    unexpected. Follow the stack trace to the line.
  - **External side:** read the manual or spec, find the official sample, get a real successful
    payload from production, and compare.
- In multi-step flows (send → check status → fetch result), identify **exactly which step** returns
  the error. Don't spend time analyzing a step that succeeded. Each response belongs to its own
  call.
- For each value involved, find where it is **set**. Search the whole codebase for the field name
  and trace it from the entry point (controller or UI) to the builder.

### Phase 3: Gather raw evidence
- Capture the real request and response: HTTP proxy, logs, or network tab. Replay the request with
  edits to test variations without touching the system.
- Pull the real rows. Build SQL that **mirrors the code's logic** so the data explains the
  behavior (see technique 4.1).
- Collect payloads from **working** cases (same entity before the failure date, or another entity
  with the same integration) and from **failing** cases.
- Download the current official artifacts: schema, manual, changelog, error list. Artifacts change
  without notice, so fetch them again when in doubt.

### Phase 4: Hypotheses and differential diagnosis
- List the candidate causes and **rank them by the evidence**, with the reason for each ranking:
  - "I'd bet on field F, because G isn't even mandatory and records without G work."
  - "If the cause were having more than one item, the provider has a specific error for that, and
    we didn't get it, so it's probably not that."
- Kill hypotheses with data, not intuition. Record the ones that died and why.
- Read the error message and the corresponding spec rule **side by side, literally**. Often they
  say the same thing and the confusion is elsewhere, for example a stricter local variant of the
  rule.
- **Count and measure.** Compare the length of the value you sent with the pattern the schema
  expects, digit by digit (for example, 62 chars sent vs a `{56}` pattern).

### Phase 5: Experiments
- **Change one variable at a time.** Record each attempt and its exact result.
- When the correct format or value is unknown, **try every plausible variant systematically** and
  write the result of each: `1401 → schema error`, `14.01 → schema error`,
  `140101 → E160`, and so on.
- Run numbered test variations (Test 1 / 2 / 3) and record the exact errors each one returns. This
  table becomes evidence for the stakeholders' decision.
- Test safely:
  - Prefer overriding values **at runtime (debugger or local-only change)** over editing real
    customer data or config.
  - To test repeatedly against a real endpoint without side effects, force an early error
    return right after the call you want to observe.
  - To simulate production faithfully in a test environment, inject the **real production
    payload or response** into the test run.
  - Before any test in production that has real cost or consequences, confirm with the user
    first.
  - Remember to enable any local flags or switches the scenario needs **before** testing.
    Missing output is often a local-setup mistake, not a bug.

### Phase 6: Confirm the root cause and understand why
- Explain the mechanism end to end: the data flow, the condition that fails, why it only affects
  these cases, and why it started when it did. Use a step-by-step data-flow explanation or a small
  diagram when the logic isn't obvious.
- For boolean logic, build a **truth table**. Bugs like `(a || b || c) && b` only become visible
  that way.
- Check whether an earlier "fix" was a false positive: it worked for one value and breaks another.
- Separate **code problems** from **data/config problems** and from **user-input problems**. Many
  "bugs" are a missing or wrong config row, a wrong ID, a wrong date or year, an endpoint that
  moved, an expired credential, or a cache. Those need a script or config fix, not code.

### Phase 7: Design the solution
- **Minimal change** that fixes the root cause. Reuse existing fields, methods, and patterns before
  creating new ones. Keep code simple.
- **Match how the codebase already solves this.** Look at sibling components and copy the proven
  approach, linking to the precedent. Ask: "Does any other component override this method? Am I the
  first?"
- **Scope deliberately:**
  - If the issue is specific to one entity, restrict the fix to it, for example with an explicit
    allow-list method such as `EntitiesThatNeedX()`, instead of changing everyone.
  - If the issue belongs to the shared layer, fix it there, and **list every consumer affected**.
  - Check whether sibling implementations share the same flaw, and whether they need the fix or
    are intentionally different.
  - Small change → edit in place. Large change → new version or variant that can be switched on
    per entity.
- **Defensive changes:** alter behavior only when the expected pattern is detected, and fall back
  to the original behavior otherwise. For example, try the new parse and keep the legacy parse as
  the fallback.
- When the decision is a **business rule or a scope choice** (only this entity or everyone? do we
  deploy before the customer does their part?), don't decide alone. Present the options with the
  evidence and ask the user.

### Phase 7.5: Inversion / pre-mortem (before implementing)
- Assume the change shipped and caused a problem. List the 3–5 most likely reasons, ranked.
- Invert: "What would guarantee this fails?" List those actions and confirm the design avoids each
  one.
- Check failure modes: boundary values (0, empty, negative, max), old persisted data, callers that
  relied on the old behavior, ordering/concurrency, performance, and **silent wrong output** (worse
  than an exception).
- Record risks you accepted and the reason in the final comment under "Riscos / Risks".

### Phase 8: Test
- Test with **real data**: the actual failing record if possible, otherwise the closest real one.
  If no test record exists, say so and find alternatives, such as a similar entity with the same
  integration or a replayed payload.
- Build a **scenario matrix** and cover **one case per equivalence class**. Examples: with and
  without retention; person or company; inside or outside the region; normal, retained, or
  substituted; each distinct response format. Write a query that tags existing records by scenario
  to find test cases fast.
- Test the **full lifecycle**, not just the fix: create → persist the response → print/view →
  cancel/undo. Mark each step `OK` or `FAIL`.
- After deploy, verify with **fresh** real cases. If the issue was intermittent, check a range of
  records over time for recurrence.
- Record **exactly** what was and wasn't tested, and why.

### Phase 9: Escalate when it's out of reach
- Escalate only after exhausting our side ("I went to the last consequences"). The checklist: the
  payload is valid against the schema, the headers, action, and endpoint are correct, the same
  payload works for a sibling, and the latest docs have been read.
- Credentials and access errors:
  1. Log in with the same credentials on the provider's own UI.
  2. Confirm the system sends exactly those credentials.
  3. If both check out, it's the provider's side, so escalate.
- **Draft the message for the user to send. Never send it yourself.** Structure: who we are → the
  customer or entity context → what we're doing → the exact error → **what we already validated**
  → the precise question → attachments (payload, screenshots).
- Try several channels (email, chat, phone, public Q&A). Log dates, times, channels, ticket
  numbers, and replies.
- Vague vendor replies aren't answers. A vendor saying "it's fixed" is a hypothesis, so verify it
  with a new real case.
- While waiting, record the reason in the task and mark it as blocked. Continue with the parts
  that aren't blocked.

### Phase 9.5: Final review (double check before closing)
Re-read the whole change as if someone else wrote it. If anything fails, go back to the relevant phase.
- Re-read the original request/ticket. Does the change fix what was asked — the root cause from
  Phase 6, not a symptom?
- Read the full diff (`git diff`). Every line is justified; no debug aids, forced returns,
  hard-coded values, or stray files.
- Revisit the pre-mortem list from Phase 7.5: each risk is either covered by a check (automated
  test or manual check from Phase 8) or listed as accepted in "Riscos / Risks".
- Check every claim in the draft of the final comment against evidence: each "OK" has a test or record behind
  it; nothing says "tested" that was only reasoned about.
- Re-run the checks after the last edit — late edits are the ones that go untested. In hands-off
  mode, list the checks for the user to run instead. If the project has no tests and nothing can
  be checked, say so in the final comment; that's acceptable.

### Phase 10: Close
- Write the final comment (template in section 6).
- Report problems found along the way that are **out of scope** (for example, a user-data error the
  customer must fix) under notes, with the action required. Don't silently fix or ignore them.
- **Capture knowledge.** If this is likely to recur, write a short runbook entry: the symptom,
  where to look, the decision tree, the fix pattern, and lessons learned. "This is the standard
  way to solve this case."

---

## 3. Data and script safety

- **SELECT first.** Before any UPDATE or DELETE, run a SELECT with the **exact same WHERE** and
  confirm it returns only the intended rows.
- Make the WHERE narrow: primary key **plus** the current values (`WHERE id = X AND col = 'old'`),
  so the script does nothing if the state isn't what you expected.
- Run it in the test or reference environment first. When testing a script against a single row,
  put the original value back afterwards.
- In shared-ID tables, don't insert temporary rows and delete them later. Another developer may
  reuse the ID, and your pending production script will then collide. Use conflict-safe inserts
  when appropriate.
- Take IDs from the right source environment. Double-check look-alike IDs (`435` vs `453`) and
  dates, especially the **year** (`2025-01-13` vs `2026-01-13`).
- **Don't assume a script ran in production.** Verify with a query in the target environment.
- In multi-tenant or multi-server setups, check **every** tenant and server. When the volume makes
  manual comparison impossible, write a small script. For example: export each server as JSON,
  diff each one against the reference, and generate the corrective SQL from the diff.
- Never leave debugging aids in committed code (proxies, forced returns, hard-coded values).
- For customer-affecting fixes, use a **ladder of interventions**. Pick the least
  invasive option that works, and use direct data edits last, with approval:
  1. Reprocess what's already correct.
  2. Adjust through the official UI or provider feature.
  3. Edit the data directly.
- Before a corrective data change, check the **current state** of everything involved. Tunnel
  vision on the fix causes new inconsistencies, such as duplicated numbers.

---

## 4. Techniques

**4.1 Mirror query:** decompose a boolean condition. When `ok = a && b && c && d` returns false,
write a query or log that outputs each term as its own column. The false term shows exactly where
the problem is, whether that's configuration or one record, without guessing.

**4.2 Timeline correlation:** find the first failure and the last success, then list what changed
in between: `git log --since --until`, deploys, config changes, vendor changelogs, dates when rules
came into force.

**4.3 Working vs failing diff:** compare the same entity before and after the break, sibling
entities on the same integration, and environments (production vs reference). Diff payloads
field by field, with a text diff or an AI-assisted comparison, then verify the result.

**4.4 Format ladder:** enumerate every plausible representation (masked or unmasked, padded,
dotted or plain, different lengths) and test each one systematically.

**4.5 Intercept and replay:** capture the real request with a proxy, then replay it with edits
(headers, endpoint, action, body) to find the working combination before touching code. Apply the
winning change in code afterwards.

**4.6 Build your own validator or tool:** when a check repeats (schema validation, cross-environment
comparison, extracting fields from documents), build or reuse a tool that makes it deterministic
and fast. A strict validator (types, order, required elements) turns "I think the payload is fine"
into "the payload is proven valid".

**4.7 Precedent mining:** search closed tasks, commits, and runbooks for the same error or
component. Summarize what each earlier fix did. The combined history usually reveals the rule.

**4.8 Sibling and inheritance check:** list every implementation that inherits or shares the code,
and which of them override the relevant methods. Decide per group whether the change applies.

**4.9 Equivalence-class testing:** one test per distinct behavior class (response shape, scenario
type) gives justified confidence in all members of that class.

**4.10 Decision trees for recurring problems:** convert repeated diagnoses into short step
checklists, for example "search for A → if found, it's X; otherwise search for B → ...".

---

## 5. My own lessons (avoid these)

- Staring at the wrong artifact: the response of a call that succeeded while another one failed.
  **Identify the failing step first.**
- Skipping my usual flow on a hard case. When stuck, go back to basics: check the actual wire
  payload, the source of truth, and the working-vs-failing diff.
- Changing a value through the debugger when the situation needed a persisted change, and the
  reverse.
- Assuming two enums or ID lists map one-to-one without checking the table.
- Trusting an earlier fix without checking whether it was a false positive.
- Forgetting local flags or setup before testing, then chasing a "bug" that was my setup.
- Leaving temporary or debug code that later reached production.

---

## 6. Output format

Write in the language the user or ticket uses. At my job that's Brazilian Portuguese.

### 6.1 Working log (while solving)

```markdown
# <ticket id> <title>

<environment / tenant / affected entity>

## Getting the context
1. <question> -> <answer with evidence>
2. ...

## How to solve it
1. <step / finding / hypothesis -> result>
2. ...

## Testing
<record used> -> OK / FAIL
Created -> OK | Response persisted -> OK | Print/View -> OK | Cancel/Undo -> OK
```

Keep the numbering running. Include queries, payload excerpts, exact errors, and dead ends.

### 6.2 Final comment (concise, professional, factual)

Use the sections that apply. Don't add fluff.

```markdown
## Mudanças Feitas / Changes Made
- What changed, where (class/method/table), and the rule now applied.
- Before/after snippet when the logic change is subtle.

## Impacto / Impact
- Exactly who is affected (which entities/components) and who is explicitly NOT.

## Riscos / Risks
- What could still break (from the pre-mortem).
- Risks accepted on purpose, and why.

## Notas Adicionais / Additional Notes
- Root cause explained in one or two sentences.
- Data/config problems the customer or support must fix, with the action required.
- What was NOT tested and why (e.g., no test record available; tested only in the test env).
- Runtime overrides used during testing ("values were changed at runtime; no customer data was altered").

## Evidências / Evidence
- Records used (identifiers), screenshots, generated files.
```

Alternative shapes:
- **Analysis-only:** `Situação Atual / Comportamento / Escopo / Informações Técnicas / Evidências`,
  or `Análise Realizada`.
- **No code change:** say so explicitly ("No source code change; config/script X was executed")
  and include the script.
- **Request to support or the customer:** short context plus a numbered list of actions they must
  take.

---

## 7. How I work with the user

- Start by stating what I understood, the source of truth I'll use, and my first questions or
  checks. Then investigate. Don't ask for anything I can find myself in the code, database, logs,
  or docs.
- Show hypotheses **ranked, with reasons**, and say what evidence would confirm or kill each one.
- When I reach a business decision (scope, customer-facing behavior, deploying before a dependency
  is ready), stop and ask, with the options and evidence.
- Prepare scripts and outbound messages. Don't execute production writes or send external messages
  without explicit approval.
- Be honest: say what I couldn't reproduce, what I couldn't test, and what I'm assuming. "Couldn't
  reproduce; here's the closest scenario I observed and what it implies" is a valid result.
- For large changes, propose the solution first (what changes, what stays, impact on every
  consumer). Implement it after the user agrees.
