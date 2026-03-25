# Repository Guide For Coding Agents

Read `themes/sansoul/AGENTS.md` before making code changes.
This repository depends on a shared theme submodule, and most rendering/build logic lives there.

## Must Know First
- `themes/sansoul/` is a shared submodule, not just a local folder.
- The root repo mostly contains project-specific content, data, overrides, and deployment config.
- The root `do` script is only a thin wrapper around `themes/sansoul/do`.
- Pages are assembled through the SanSoul `tpl` system, not by one-template-per-page.
- If you do not understand the theme pipeline, read `themes/sansoul/AGENTS.md` first.

## What Lives Where
- `content/`: page, blog, taxonomy, and landing content.
- `data/`: project configuration, section definitions, styles, and type defaults.
- `assets/` and `layouts/`: project JS, SCSS, and Hugo overrides.
- `themes/sansoul/`: shared architecture, theme assets, Hugo partials, and prebuild logic.
- `public/` and `resources/`: generated output; do not hand-edit.

## Submodule Workflow
- Check submodule state: `git submodule status --recursive`
- Initialize pinned submodule commit: `git submodule update --init --recursive`
- Bring the shared theme to the latest tracked `main`: `git submodule update --init --recursive --remote themes/sansoul`
- After switching branches or pulling the parent repo, rerun: `git submodule update --init --recursive`
- Only edit `themes/sansoul/` when you intentionally want to change the shared theme.

## Build Pipeline
- The real build entrypoint is `sh do ...` from the repo root.
- Root `do` delegates to `./themes/sansoul/do`.
- The pipeline is `prebuild` first, then the actual Hugo build.
- Prebuild generates `themes/sansoul/prebuild/public/hugo.prebuild.yml`, and Hugo then combines theme defaults, optional env config, generated prebuild config, and root `hugo.yml`.

## Core Commands
- Install Node deps: `npm install`
- Dev server: `sh do server`
- Dev server without CMS HTTP cache: `sh do local`
- Run prebuild only: `sh do prebuild`
- Build using environment switch in `data/config.yml`: `sh do hugo`
- Force development build: `sh do hugo-development`
- Force production build: `sh do hugo-production`
- Serve already-built `public/`: `npm run server`
- Deploy builds use `sh do hugo`; Cloudflare Pages output is `public`

## Lint / Test Reality
- There is no real automated test suite in this repo.
- `npm test` is a placeholder and always fails.
- No Jest, Vitest, Playwright, Cypress, PHPUnit, Pytest, or Go test setup was found.
- No single-test command exists because there is no test runner configured.
- There is no repo-provided lint script; JS style is enforced through StandardJS conventions in `package.json`.

## Practical Validation Commands
- For site changes, prefer `sh do server` during development.
- For production validation, run `sh do hugo-production` or `sh do hugo`.
- For content/schema sanity, `sh do yml <arg>` exists, but it depends on sibling tools in `../_tools`.
- For scheduled publishing logic only: `node .github/scripts/flip-drafts.js`

## Important Build Caveats
- Restart the server after changing `data/remote.yml`, `data/types/`, or global config inputs used by prebuild.
- Hot reload does not reliably catch all prebuild-driving changes.
- `npm run server` only serves `public/`; it does not rebuild anything.
- Production builds need installed Node deps in the root clone; otherwise the final `sh do imgs` step fails when Node cannot resolve packages like `sharp`.
- Production builds copy `themes/sansoul/postcss.config.js` into the root before running Hugo.
- Production builds also run the image post-processing step via `sh do imgs`.

## Commands That Depend On External Tools
- `sh do normalize`, `sh do spaces`, `sh do favicon`, `sh do fonts`, `sh do gfonts`, `sh do yml`, `sh do places`, and `sh do reviews` depend on sibling scripts in `../_tools`.

## High-Level Architecture
- This project is data-driven.
- Page structure comes from `tpl` data, especially in `data/types/*.yml`, `data/section/*.yml`, and page front matter.
- Global defaults live in `data/types/all.yml`.
- Type defaults live in files like `data/types/service.yml`.
- Page-specific structure often lives in front matter under `tpl.sections`.
- Root `layouts/` is for project overrides; prefer it before changing the theme.

## Where To Edit First
- Content change: edit `content/**/*.md`
- Section layout/content blocks: edit `data/section/*.yml` or `data/types/*.yml`
- Site-wide tokens and config: edit `data/styles.yml`, `data/config.yml`, and `hugo.yml`
- Project-specific frontend overrides: edit `assets/_custom.scss`, `assets/custom.js`, and `layouts/`
- Shared rendering logic: only then consider `themes/sansoul/`

## JavaScript Style
- Follow StandardJS: 2 spaces, single quotes, no semicolons.
- Keep the existing function style with a space before parentheses: `function name () {}`.
- Use ESM `import` / `export` for new JS.
- Keep imports at the top of the file.
- Prefer relative imports without file extensions, matching the existing codebase.
- Use Hugo-provided aliases such as `@params` only where the existing theme build already supports them.
- New feature files should use kebab-case filenames.
- Exported initializers should follow the `initThing` pattern when adding DOM bootstrapping modules.
- Internal variable and helper names should be clear camelCase.

## Legacy JS Notes
- `themes/sansoul/assets/js/node/css-purge.js` is legacy CommonJS despite the broader ESM rule.
- Do not copy that pattern into new files unless you are intentionally maintaining that legacy script.
- The theme bootstraps many browser modules through dynamic imports in `themes/sansoul/assets/js/_index.js` or `themes/sansoul/assets/scripts.js`.
- Match the existing bootstrapping approach instead of inventing a second initialization system.

## SCSS / CSS Style
- Keep project-specific style overrides in `assets/_custom.scss` when possible.
- The theme still uses Sass `@import`; do not introduce one-off `@use` conversions unless doing a deliberate migration.
- Reuse existing theme variables and CSS custom properties instead of hardcoding new design tokens.
- Keep selectors scoped and consistent with current naming.
- Prefer extending the current utility/component patterns over ad hoc styles.

## Hugo / Template Style
- Preserve the current whitespace-trimmed template style: `{{- ... -}}` where the surrounding file uses it.
- Follow existing partial composition patterns instead of large inline templates.
- Use local Hugo variables with the same style already present in theme partials, commonly snake_case names prefixed with `$`.
- Respect the existing mapping between data keys and partials.
- Known key patterns include `boxes`, `steps`, `imgs`, `limgs`, `faqs`, `reviews`, `inputs`, `geos`, and `modals`.
- When adding new data structures, verify they fit the current TPL merge/render flow.

## YAML / Front Matter Style
- Most project YAML and front matter booleans use `y` / `n`, not `true` / `false`.
- Preserve the local convention of the file you are editing.
- Prefer lowercase snake_case keys in YAML.
- Keep content filenames slug-like; many localized files use suffixes such as `.es.md`.
- Preserve concise front matter ordering when touching content files.
- Common blog front matter keys include `slug`, `title`, `img`, `toc`, `draft`, `hide`, `sum`, `seo`, `llms`, `date`, and `mod`.
- Date/time values are commonly stored as `YYYY-MM-DD HH:MM:SS`.

## Naming Guidance
- Code, comments, and variable names should be in English.
- Marketing/site content may of course remain in Spanish or the target content language.
- Use descriptive, scalable names; avoid abbreviations unless already established by the TPL system.
- Keep file naming consistent with the surrounding area instead of renaming broadly.

## Error Handling Guidance
- Front-end enhancements should fail softly when possible.
- For fetch-based flows, check `response.ok` and throw a clear `Error` for bad HTTP responses.
- Surface user-facing form/network errors in the UI when the existing pattern already does so.
- Use `console.error` for non-fatal browser-side failures that should not hard-stop the page.
- For Node utility scripts, include the path or operation in the logged error message.

## Project Quirks And Shared Files
- `layouts/shortcodes/precio-electricidad-grafico.html` contains a large inline third-party chart integration with inline `<style>` and `<script>`.
- If you touch that shortcode, preserve behavior carefully and keep changes project-scoped rather than moving them into the shared theme by default.
- `assets/jsconfig.json` maps asset imports toward theme assets for editor resolution.

- Do not hand-edit `public/`, `resources/`, or generated prebuild output.
- Treat `themes/sansoul/` as shared infrastructure.
- Prefer root overrides before modifying the theme submodule.
- If you update the submodule intentionally, record that clearly in your final summary or commit message.

## Cursor / Copilot Rules
- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- No `.github/copilot-instructions.md` file was found.
- The only agent-specific docs found are this file and `themes/sansoul/AGENTS.md`.
