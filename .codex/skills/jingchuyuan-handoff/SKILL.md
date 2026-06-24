---
name: jingchuyuan-handoff
description: Use only for the /Users/admin/Desktop/程式/jingchuyuan Astro website project when the user asks to hand off, update handoff notes, summarize current Jing Chu Yuan/靜初苑 website work, or prepare the next AI/session. Do not use for other projects. Trigger only if the current repo is jingchuyuan or the user explicitly mentions jingchuyuan, 靜初苑, this website project, or /Users/admin/Desktop/程式/jingchuyuan together with phrases such as "交接", "交接工作", "更新交接", "寫交接", "handoff", or "handover".
---

# Jing Chu Yuan Handoff

## Project

- Repo path: `/Users/admin/Desktop/程式/jingchuyuan`
- GitHub remote: `https://github.com/ivy081499/jingchuyuan.git`
- Stack: Astro static site, deployed target is Cloudflare Pages.
- Node for local commands: `/Users/admin/.local/node-versions/node-v22.16.0-darwin-arm64/bin`

## When Triggered

Use this skill only if one of these is true:

- Current working directory is `/Users/admin/Desktop/程式/jingchuyuan` or inside it.
- The user explicitly mentions `jingchuyuan`, `靜初苑`, `這個網站專案`, or `/Users/admin/Desktop/程式/jingchuyuan`.

Do not use this skill for generic handoff requests in other repositories. Other projects may have their own handoff skills.

## Git Workflow Boundaries

Cloudflare Pages production should build from `main`. All file-changing work must pass the branch gate first. Normal development and handoff have different commit/merge behavior after that gate.

### Mandatory Branch Gate

Before reading implementation files deeply, running edits, applying patches, formatting, generating assets, or otherwise changing files, perform this gate:

1. Run `git status --short --branch`, `git branch -a`, and `git branch -vv`.
2. Confirm the current work is on a short descriptive branch created from `main`.
3. If not on a correct work branch, do not edit files yet. Switch to `main`, create the correct branch, then continue.
4. If there are already local edits on the wrong branch, stash only the relevant local edits, switch to `main`, create the correct work branch, then reapply the stash.
5. If unrelated user changes are present, preserve them and do not stash, stage, commit, move, or overwrite them unless required for the current task.
6. Report the branch being used before making the first edit.

Never treat the branch gate as optional. If the gate has not been performed in the current turn, do not edit files.

### Normal Development

For normal development requests, such as changing links, copy, styles, images, or code:

1. Pass the mandatory branch gate.
2. Make the requested edits on the work branch.
3. Run appropriate verification. For website/source changes, run:

```bash
PATH=/Users/admin/.local/node-versions/node-v22.16.0-darwin-arm64/bin:$PATH npm run build
```

4. Stop there unless the user explicitly asks to commit or merge.
5. Do not commit, merge to `main`, or push for normal development requests unless the user explicitly asks in the same turn.

### Explicit Handoff

For explicit handoff requests, such as "交接", "交接工作", "更新交接", or "寫交接":

1. Pass the mandatory branch gate.
2. If `main` has unpushed commits, keep them; do not reset or discard them.
3. Use a short descriptive branch name, for example:
   - `chore/update-handoff`
   - `docs/cloudflare-notes`
   - `feat/contact-form`
4. Update the handoff files on that branch.
5. Verify appropriate checks. For website/source changes, run:

```bash
PATH=/Users/admin/.local/node-versions/node-v22.16.0-darwin-arm64/bin:$PATH npm run build
```

6. Commit on the work branch.
7. Switch back to `main`.
8. Merge the work branch into `main` using a non-interactive merge.
9. Confirm `git status --short --branch`.
10. Report:
    - branch created
    - commit hash
    - merge result
    - whether `main` is ahead of `origin/main`
    - reminder that push is left for the user

Never push. The user explicitly handles all `git push` operations for this project. Do not run `git push`, even after merging to `main`, unless the user gives a new explicit push instruction in the same turn.

When the user asks for this project handoff:

1. Work in the repo root.
2. Read `PROJECT_HANDOFF.md`, `git status --short --branch`, `git branch -a`, `git branch -vv`, recent commits, and any changed files relevant to current work.
3. Update `PROJECT_HANDOFF.md` with:
   - exact date/time if useful
   - what changed today
   - current implementation status
   - decisions made
   - unfinished work
   - next recommended steps
   - risks/blockers
   - local and remote branch state, especially extra deployment-created branches
   - file-level diff summary for any deployment-created branch, not just branch names
   - commands already verified
4. Preserve useful previous context; do not erase open tasks unless completed.
5. Follow the handoff branch workflow above.
6. Never overwrite unrelated user changes.
7. Commit handoff updates by default unless the user explicitly asks not to commit.
8. Report the commit hash, merge result, any remaining uncommitted files, and that push is left for the user.

## Current Product Context

This is a client-facing website for "靜初苑". Its purpose is to be the first public contact point for a service provider.

Business goals:

- Present the service clearly.
- Help visitors decide whether the service fits them.
- Provide contact channels such as LINE Official Account and Instagram.
- Later support a contact form, automatic provider notification, and possibly online booking.

Current recommended product direction:

- Multi-page static website, not only one-page.
- Mobile-first design.
- Calm visual style: white background, gold thin typography, generous spacing, light elegant mood, watercolor/natural image direction.
- Keep first release lightweight: service information + contact links + form UI placeholder.

Pages:

- `/` Home: hero, service summary, suitable audience, booking flow, feedback.
- `/service/`: service details, price/booking explanation.
- `/about/`: provider intro, background, philosophy, profile image.
- `/faq/`: common questions.
- `/contact/`: LINE/IG contact and form UI placeholder.

Image plan:

- `public/images/home/hero.webp`
- `public/images/home/service-intro.webp`
- `public/images/home/feedback.webp`
- `public/images/service/service-scene.webp`
- `public/images/about/profile.webp`
- `public/images/contact/contact.webp`

Supporting docs:

- `CONTENT_CHECKLIST.md`: content request checklist for client.
- `IMAGE_PLAN.md`: exact image slots, filenames, and sizing guidance.
- `PROJECT_HANDOFF.md`: persistent handoff notes.

## Current Technical Context

Use these commands:

```bash
cd /Users/admin/Desktop/程式/jingchuyuan
PATH=/Users/admin/.local/node-versions/node-v22.16.0-darwin-arm64/bin:$PATH npm run dev -- --host 127.0.0.1
PATH=/Users/admin/.local/node-versions/node-v22.16.0-darwin-arm64/bin:$PATH npm run build
```

Deployment plan:

- Push to GitHub.
- Deploy through Cloudflare Pages.
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22` or env var `NODE_VERSION=22`

## Important Boundaries

- The current contact form is visual only. It does not submit data.
- LINE/IG links are placeholders until client provides URLs.
- Online booking is not implemented.
- LINE Official Account notification is not implemented.
- Do not claim the site is fully functional until form/backend links are wired.
- Do not overwrite user-provided images or content without checking current git status first.

## Handoff Writing Style

Keep `PROJECT_HANDOFF.md` concise but specific. Prefer current facts and next actions over narrative. Use checkboxes for pending items. Include file paths when relevant.
