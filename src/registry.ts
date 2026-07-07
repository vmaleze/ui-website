import { REGISTRY_URL } from './config.ts';

export interface PackageVersion {
  version: string;
  tarballUrl: string;
  integrity?: string;
}

interface Packument {
  versions?: Record<string, { dist: { tarball: string; integrity?: string } }>;
}

export const fetchPackageVersions = async (packageName: string): Promise<PackageVersion[]> => {
  const response = await fetch(`${REGISTRY_URL}/${packageName}`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  if (!response.ok) {
    throw new Error(`Registry request failed for ${packageName}: ${response.status}`);
  }
  const packument = (await response.json()) as Packument;
  const versions = Object.entries(packument.versions ?? {}).map(([version, { dist }]) => ({
    version,
    tarballUrl: dist.tarball,
    integrity: dist.integrity,
  }));
  if (versions.length === 0) {
    throw new Error(`No versions found for ${packageName}, aborting to avoid wiping the mirror`);
  }
  return versions;
};
