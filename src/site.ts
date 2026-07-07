import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import semver from 'semver';

export const LATEST_DIR = 'latest';

export const listLocalVersions = async (versionsDir: string): Promise<string[]> => {
  await mkdir(versionsDir, { recursive: true });
  const entries = await readdir(versionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && semver.valid(entry.name) !== null)
    .map((entry) => entry.name);
};

export const findLatestStable = (versions: string[]): string | undefined =>
  semver.rsort(versions.filter((version) => semver.prerelease(version) === null))[0];

export const updateLatest = async (versionsDir: string, latestVersion: string): Promise<void> => {
  const latestDir = join(versionsDir, LATEST_DIR);
  await rm(latestDir, { recursive: true, force: true });
  await cp(join(versionsDir, latestVersion), latestDir, { recursive: true });
};

const renderStylesheets = (styleBase?: string): string => {
  if (styleBase === undefined) {
    return '';
  }
  return `<link href="${styleBase}/fonts/open-sans/400.css" rel="stylesheet" />
    <link href="${styleBase}/fonts/open-sans/600.css" rel="stylesheet" />
    <link href="${styleBase}/fonts/open-sans/700.css" rel="stylesheet" />
    <link href="${styleBase}/fonts/saira-extra-condensed/700.css" rel="stylesheet" />
    <link href="${styleBase}/icons/ionicons.css" rel="stylesheet" />
    <link href="${styleBase}/tikui.css" rel="stylesheet" />`;
};

const renderLatestCard = (latest?: string): string => {
  if (latest === undefined) {
    return `<section class="ippon-card -border">
            <div class="ippon-v-space -gap-16 -left">
              <span class="ippon-text -label">No stable release yet</span>
              <nav class="ippon-h-space -gap-16">
                <a class="ippon-button -outline" href="versions.json">versions.json</a>
              </nav>
            </div>
          </section>`;
  }
  return `<section class="ippon-card -shadow-l2 -border">
            <div class="ippon-v-space -gap-16 -left">
              <span class="ippon-text -label">Latest stable release</span>
              <h3 class="ippon-title-display -medium">v${latest}</h3>
              <nav class="ippon-h-space -gap-16">
                <a class="ippon-button" href="styles/${LATEST_DIR}/index.html">Browse the library</a>
                <a class="ippon-button -outline" href="versions.json">versions.json</a>
              </nav>
            </div>
          </section>`;
};

const renderPrereleaseBadge = (version: string): string => {
  if (semver.prerelease(version) === null) {
    return '';
  }
  return '<span class="ippon-badge -secondary -warning">pre-release</span>';
};

const renderVersionItem = (version: string): string =>
  `<li><a class="ippon-button-card -border -full-width" href="styles/${version}/index.html"><span class="ippon-h-space -gap-16 -middle"><span class="ippon-h-space--slot -expand"><span class="ippon-text -body -bold">${version}</span></span>${renderPrereleaseBadge(version)}<span class="ippon-icon -size-24 -color-brand-primary ippon-ion-chevron-forward" role="presentation"></span></span></a></li>`;

const findStyleBase = (versions: string[], latest?: string): string | undefined => {
  if (latest !== undefined) {
    return `styles/${LATEST_DIR}`;
  }
  if (versions.length > 0) {
    return `styles/${versions[0]}`;
  }
  return undefined;
};

const renderVersionList = (versions: string[]): string => {
  if (versions.length === 0) {
    return '<p class="ippon-text -body">No versions have been published yet.</p>';
  }
  return `<ol class="ippon-v-space -gap-8">\n              ${versions.map(renderVersionItem).join('\n              ')}\n            </ol>`;
};

export const renderIndexPage = (versions: string[], latest?: string): string =>
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ippon UI Pattern Library</title>
    <meta
      name="description"
      content="Every published version of the Ippon UI Pattern Library (@ippon-ui/styles)."
    />
    ${renderStylesheets(findStyleBase(versions, latest))}
  </head>
  <body>
    <div class="ippon-layout">
      <header class="ippon-layout--header">
        <div class="ippon-header">
          <div class="ippon-header--slot">
            <span class="ippon-text -label -large">Ippon Technologies</span>
          </div>
        </div>
      </header>
      <main class="ippon-layout--body">
        <div class="ippon-container">
          <div class="ippon-v-space -gap-32">
            <header class="ippon-v-space -gap-8 -left">
              <h1 class="ippon-title-display">Ippon UI</h1>
              <p class="ippon-text -large -body">The design system behind Ippon products.</p>
            </header>
            <section class="ippon-v-space -gap-24">
              <div class="ippon-v-space -gap-8 -left">
                <h2 class="ippon-title">Styles</h2>
                <p class="ippon-text -body">
                  The Pattern Library &mdash; every published version of
                  <code>@ippon-ui/styles</code>, mirrored from npm.
                </p>
              </div>
              ${renderLatestCard(latest)}
              <section class="ippon-v-space -gap-16">
                <h3 class="ippon-title">All versions</h3>
                ${renderVersionList(versions)}
              </section>
            </section>
            <hr class="ippon-separator" />
            <footer>
              <span class="ippon-text -small -body">
                Sources: <a href="https://github.com/ippontech/ui">ippontech/ui</a> &middot;
                <a href="https://github.com/ippontech/ui-website">ippontech/ui-website</a>
              </span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  </body>
</html>
`;

export const generateSitePages = async (
  siteDir: string,
  versions: string[],
  latest?: string,
): Promise<void> => {
  const sorted = semver.rsort([...versions]);
  await writeFile(
    join(siteDir, 'versions.json'),
    `${JSON.stringify({ styles: { latest: latest ?? null, versions: sorted } }, null, 2)}\n`,
  );
  await writeFile(join(siteDir, 'index.html'), renderIndexPage(sorted, latest));
};
