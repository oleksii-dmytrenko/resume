---
name: flow-review
description: >-
  Launch an adversary review of the current branch against main. CODESTYLE.md
  applies to code; AGENTS.md applies to everything. Use when the user asks to
  run /flow-review, adversary review, style review, or to gate apply
  complete / archive.
---
# Review Agent

Use this skill when the user asks to run `/flow-review`.

Launch exactly one isolated adversary reviewer. Do not review in the parent turn.

Launch it with the isolated-subagent mechanism of the current host:

- Cursor: agent tool, `subagent_type: "generalPurpose"`, `description: "Adversary Review"`, `run_in_background: false`.
- Claude Code: Task tool, `subagent_type: "general-purpose"`.
- ZCode: Agent tool, `subagent_type: "general-purpose"`, `run_in_background: false`.
- Codex: spawn one subagent thread (built-in `default` agent type) and wait for its result.
- Any other host: the equivalent isolated general-purpose subagent with the same prompt.

Before launching, run `git fetch origin main` so `origin/main` is current.

Then run `git status --porcelain`. If it is non-empty, list those uncommitted
paths and ask whether to continue. Do not launch the reviewer until the user
explicitly confirms. Silence or a negative answer means stop with no review
and leave the working tree unchanged. A yes means review
`git diff origin/main...HEAD` without committing; uncommitted files stay
uncommitted.

Review the currently checked-out branch against `origin/main`, scoped to the
merge-base (`git diff origin/main...HEAD`, three dots) — not a raw diff against
`origin/main`'s tip, which would also show anything merged there after this
branch forked. Do not switch branches. Do not compute the diff yourself — the
subagent does that from the repository path (the active workspace root).

Use this exact prompt, substituting the workspace root's absolute path for
`<absolute repository path>` and changing nothing else:

```text
Full Repository Path: <absolute repository path>
Diff: git diff origin/main...HEAD (merge-base, three dots — not origin/main's tip)
Base Branch: origin/main
Custom Instructions: Adversary review of this branch versus origin/main, scoped to commits since the merge-base. Read CODESTYLE.md and AGENTS.md at the repository root. Apply CODESTYLE.md only to code (application source and app config files that sit with it: TypeScript, Svelte, backend, `.env.example` — not markdown, skills, specs, or docs). Apply AGENTS.md to every changed file. You are an adversary, not a collaborator. For code, assume the diff is hiding style violations, wrong-layer code, defensive branches, swallowed errors, `any`/`as`, speculative flexibility, and regexes used for validation. For everything else, report only AGENTS.md violations. Report only concrete violations with file:line, the broken rule, and the fix. Do not praise. Do not suggest optional polish. Do not invent issues outside the diff. Severity: blocking (must remediate or user-justify before treating apply as complete) or n/a — there is no advisory tier. If there are no violations, the entire response is the single token CLEAN.
```

If the subagent fails because the prompt was invoked incorrectly, retry once immediately. If it fails again, or fails for any other reason, stop. Tell the user the review could not complete and include the short error. Do not keep retrying. Do not compensate with an alternate diff mode.

After the subagent finishes:

- Empty diff: one sentence that there was no diff to review.
- No violations: the entire reply to the user is the single token `CLEAN`.
- Violations: a compact markdown table, one row per finding, columns Severity, Location (file:line), Finding.

Unresolved findings block treating apply as complete (including archive) until each finding is remediated or the user explicitly justifies keeping it. They do not require withholding the first commit. Do not create commits, continue `flow-apply`, or treat the change as done while blocking findings remain without that justification.

Do not fix findings or rerun review unless the user explicitly asks for that next step.
