import type { PackageVersion } from './registry.ts';

export interface SyncPlan {
  toDownload: PackageVersion[];
  toRemove: string[];
  toKeep: string[];
}

export const planSync = (localVersions: string[], registryVersions: PackageVersion[]): SyncPlan => {
  const registryVersionNumbers = new Set(registryVersions.map(({ version }) => version));
  const local = new Set(localVersions);
  return {
    toDownload: registryVersions.filter(({ version }) => !local.has(version)),
    toRemove: localVersions.filter((version) => !registryVersionNumbers.has(version)),
    toKeep: localVersions.filter((version) => registryVersionNumbers.has(version)),
  };
};
