import { describe, expect, it } from 'vitest';
import { findLatestStable, renderIndexPage } from '../src/site.ts';

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

describe('renderIndexPage', () => {
  it('should link every version', () => {
    const html = renderIndexPage(['0.0.2', '0.0.1'], '0.0.2');
    expect(html).toContain('href="styles/0.0.2/index.html"');
    expect(html).toContain('href="styles/0.0.1/index.html"');
    expect(html).toContain('href="versions.json"');
  });

  it('should feature the latest stable version', () => {
    const html = renderIndexPage(['0.0.2'], '0.0.2');
    expect(html).toContain('href="styles/latest/index.html"');
    expect(html).toContain('v0.0.2');
  });

  it('should style the page with the pattern library of the latest stable version', () => {
    const html = renderIndexPage(['0.0.2'], '0.0.2');
    expect(html).toContain('href="styles/latest/tikui.css"');
  });

  it('should not link latest when there is no stable version', () => {
    const html = renderIndexPage(['0.1.0-beta.1']);
    expect(html).not.toContain('href="styles/latest/index.html"');
    expect(html).toContain('No stable release yet');
  });

  it('should fall back to the highest version stylesheet when there is no stable version', () => {
    const html = renderIndexPage(['0.1.0-beta.1']);
    expect(html).toContain('href="styles/0.1.0-beta.1/tikui.css"');
  });

  it('should render without a stylesheet when no version is published', () => {
    const html = renderIndexPage([]);
    expect(html).not.toContain('tikui.css');
  });

  it('should tag prereleases', () => {
    const html = renderIndexPage(['0.1.0-beta.1', '0.0.1'], '0.0.1');
    expect(html.match(/pre-release/g)).toHaveLength(1);
  });

  it('should render an empty state when no version is published', () => {
    const html = renderIndexPage([]);
    expect(html).toContain('No versions have been published yet.');
  });

  it('should only use pattern library styles', () => {
    const html = renderIndexPage(['0.0.2'], '0.0.2');
    expect(html).not.toContain('<style>');
    expect(html).not.toContain('style="');
  });
});
