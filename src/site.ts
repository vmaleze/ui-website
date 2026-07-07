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

const renderIndexPage = (versions: string[], latest?: string): string => {
  const latestLink = latest
    ? `<li><a href="styles/${LATEST_DIR}/index.html">latest</a> (${latest})</li>\n      `
    : '';
  const versionLinks = versions
    .map((version) => `<li><a href="styles/${version}/index.html">${version}</a></li>`)
    .join('\n      ');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ippon UI Pattern Library</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        max-width: 40rem;
        margin: 3rem auto;
        padding: 0 1rem;
        line-height: 1.6;
      }
      h1 {
        font-size: 1.5rem;
      }
    </style>
  </head>
  <body>
    <h1>Ippon UI Pattern Library</h1>
    <p>Published versions of <code>@ippon-ui/styles</code>:</p>
    <ul>
      ${latestLink}${versionLinks}
    </ul>
    <p>Versions are also listed in <a href="versions.json">versions.json</a>.</p>
  </body>
</html>
`;
};

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
