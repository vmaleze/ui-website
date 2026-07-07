import { PACKAGE_NAME, SITE_DIR, STYLES_DIR } from './config.ts';
import { cleanupTemporaryDirs, downloadVersion, removeVersion } from './download.ts';
import { planSync } from './plan.ts';
import { fetchPackageVersions } from './registry.ts';
import { findLatestStable, generateSitePages, listLocalVersions, updateLatest } from './site.ts';

const main = async (): Promise<void> => {
  const registryVersions = await fetchPackageVersions(PACKAGE_NAME);
  await cleanupTemporaryDirs(STYLES_DIR);
  const localVersions = await listLocalVersions(STYLES_DIR);
  const { toDownload, toRemove, toKeep } = planSync(localVersions, registryVersions);
  console.log(
    `${PACKAGE_NAME}: ${toKeep.length} kept, ${toDownload.length} to download, ${toRemove.length} to remove`,
  );
  for (const version of toRemove) {
    console.log(`Removing ${version} (gone from the registry)`);
    await removeVersion(version, STYLES_DIR);
  }
  for (const packageVersion of toDownload) {
    console.log(`Downloading ${packageVersion.version}`);
    await downloadVersion(packageVersion, STYLES_DIR);
  }
  const versions = await listLocalVersions(STYLES_DIR);
  const latest = findLatestStable(versions);
  if (latest !== undefined) {
    await updateLatest(STYLES_DIR, latest);
  }
  await generateSitePages(SITE_DIR, versions, latest);
  console.log(`Site generated with ${versions.length} versions (latest: ${latest ?? 'none'})`);
};

await main();
