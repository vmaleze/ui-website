Code must be in English.

## Purpose

This project mirrors every published version of the `@ippon-ui/styles` Pattern Library from the npm registry and exposes them on GitHub Pages:

- `styles/<x.y.z>/` — the `dist/` of each published version
- `styles/latest/` — a physical copy of the highest stable version
- `index.html` — landing page listing the versions
- `versions.json` — machine-readable manifest of available versions

## Commands

You should use `mise` to run commands linked to this project. If you need to add more operations or a new command, please edit the `mise.toml` file, so the command will be available.

| Task                          | Command             |
| ----------------------------- | ------------------- |
| Trust mise                    | `mise trust`        |
| Install mise                  | `mise install`      |
| Install dependencies          | `mise setup`        |
| Run the sync (build the site) | `mise build`        |
| Serve the site locally        | `mise dev`          |
| Format (fix)                  | `mise format`       |
| Format (check only)           | `mise format-ci`    |
| Lint (type check)             | `mise lint`         |
| Unit tests (not interactive)  | `mise test-unit-ci` |

## Architecture

The sync (`src/main.ts`) is an idempotent mirror of the npm registry into the non-versioned `public/` folder:

1. Fetch the versions of `@ippon-ui/styles` from the registry (`src/registry.ts`). It aborts if the request fails or the list is empty, so a registry outage can never wipe the mirror.
2. Diff the registry versions against the directories in `public/styles/` (`src/plan.ts`, pure function): a version gone from the registry is removed, a version already present is kept untouched (npm versions are immutable), a missing version is downloaded.
3. Downloads (`src/download.ts`) verify the tarball integrity, extract `package/dist/` into a `.tmp-<version>` directory, then atomically rename it to `public/styles/<version>/` — a version directory either exists complete or not at all. Leftover `.tmp-*` directories from interrupted runs are cleaned at startup.
4. `styles/latest/` is regenerated on every run as a physical copy of the highest stable version (`src/site.ts`). It must be a copy: GitHub Pages cannot serve HTTP redirects, so direct asset URLs like `styles/latest/tikui.css` have to physically exist.
5. `index.html` and `versions.json` are regenerated from the directory listing on every run.

In CI (`.github/workflows/deploy.yml`), `public/styles/` is restored from `actions/cache` so only missing versions are downloaded. A cache miss is harmless: everything is re-downloaded. The workflow runs nightly to pick up versions published from the [ui repository](https://github.com/ippontech/ui) and to keep the cache alive, then publishes `public/` with `actions/deploy-pages`.
