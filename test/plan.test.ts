import { describe, expect, it } from 'vitest';
import { planSync } from '../src/plan.ts';
import type { PackageVersion } from '../src/registry.ts';

const packageVersion = (version: string): PackageVersion => ({
  version,
  tarballUrl: `https://registry.npmjs.org/pkg/-/pkg-${version}.tgz`,
});

describe('planSync', () => {
  it('should download versions missing locally', () => {
    const plan = planSync(['0.0.1'], [packageVersion('0.0.1'), packageVersion('0.0.2')]);

    expect(plan.toDownload).toEqual([packageVersion('0.0.2')]);
  });

  it('should remove local versions gone from the registry', () => {
    const plan = planSync(['0.0.1', '0.0.2'], [packageVersion('0.0.2')]);

    expect(plan.toRemove).toEqual(['0.0.1']);
  });

  it('should keep local versions still in the registry', () => {
    const plan = planSync(['0.0.1', '0.0.2'], [packageVersion('0.0.1'), packageVersion('0.0.2')]);

    expect(plan.toKeep).toEqual(['0.0.1', '0.0.2']);
    expect(plan.toDownload).toEqual([]);
    expect(plan.toRemove).toEqual([]);
  });

  it('should download everything on an empty mirror', () => {
    const plan = planSync([], [packageVersion('0.0.1')]);

    expect(plan.toDownload).toEqual([packageVersion('0.0.1')]);
    expect(plan.toRemove).toEqual([]);
    expect(plan.toKeep).toEqual([]);
  });
});
