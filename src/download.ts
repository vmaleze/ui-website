import { createHash } from 'node:crypto';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { extract } from 'tar';
import type { PackageVersion } from './registry.ts';

const TARBALL_DIST_PREFIX = 'package/dist/';
const TEMPORARY_PREFIX = '.tmp-';

const verifyIntegrity = (tarball: Buffer, integrity: string): void => {
  const separator = integrity.indexOf('-');
  const algorithm = integrity.slice(0, separator);
  const expected = integrity.slice(separator + 1);
  const actual = createHash(algorithm).update(tarball).digest('base64');
  if (actual !== expected) {
    throw new Error(`Integrity check failed: expected ${integrity}, got ${algorithm}-${actual}`);
  }
};

export const cleanupTemporaryDirs = async (versionsDir: string): Promise<void> => {
  await mkdir(versionsDir, { recursive: true });
  const entries = await readdir(versionsDir, { withFileTypes: true });
  const leftovers = entries.filter((entry) => entry.name.startsWith(TEMPORARY_PREFIX));
  await Promise.all(
    leftovers.map((entry) => rm(join(versionsDir, entry.name), { recursive: true, force: true })),
  );
};

export const downloadVersion = async (
  { version, tarballUrl, integrity }: PackageVersion,
  versionsDir: string,
): Promise<void> => {
  const response = await fetch(tarballUrl);
  if (!response.ok) {
    throw new Error(`Tarball download failed for ${version}: ${response.status}`);
  }
  const tarball = Buffer.from(await response.arrayBuffer());
  if (integrity) {
    verifyIntegrity(tarball, integrity);
  }
  const temporaryDir = join(versionsDir, `${TEMPORARY_PREFIX}${version}`);
  await mkdir(temporaryDir, { recursive: true });
  await pipeline(
    Readable.from(tarball),
    extract({
      cwd: temporaryDir,
      strip: 2,
      filter: (path) => path.startsWith(TARBALL_DIST_PREFIX),
    }),
  );
  await rename(temporaryDir, join(versionsDir, version));
};

export const removeVersion = async (version: string, versionsDir: string): Promise<void> =>
  rm(join(versionsDir, version), { recursive: true, force: true });
