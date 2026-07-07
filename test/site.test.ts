import { describe, expect, it } from 'vitest';
import { findLatestStable } from '../src/site.ts';

describe('findLatestStable', () => {
  it('should return the highest version', () => {
    expect(findLatestStable(['0.0.2', '0.0.10', '0.0.3'])).toBe('0.0.10');
  });

  it('should ignore prereleases', () => {
    expect(findLatestStable(['0.0.2', '0.1.0-beta.1'])).toBe('0.0.2');
  });

  it('should return undefined when there is no stable version', () => {
    expect(findLatestStable(['0.1.0-beta.1'])).toBeUndefined();
    expect(findLatestStable([])).toBeUndefined();
  });
});
