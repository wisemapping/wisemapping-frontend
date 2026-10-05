/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import fs from 'fs';
import path from 'path';
import Workspace from '../../src/components/Workspace';
import WorkspaceElement from '../../src/components/WorkspaceElement';
import ElementPeer from '../../src/components/peer/svg/ElementPeer';

/*
 * SVG golden files (layer 1 of the visual regression plan, WEB2D_REVIEW_PLAN.md section 7.3).
 *
 * A scenario renders web2d elements into jsdom; the resulting <svg> is serialized with sorted
 * attributes, numbers rounded to 2 decimals and volatile ids stripped, and compared with
 * test/unit/__goldens__/<name>.svg. The files are plain SVG, so they open in a browser.
 *
 * Update path: `yarn jest test/unit -u` or `UPDATE_GOLDENS=1 yarn test:unit`. A missing golden is
 * written on the first run, except under CI (`CI` set), where it fails like a missing snapshot.
 */

const GOLDEN_DIR = path.resolve(__dirname, '../unit/__goldens__');
const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const VOLATILE_ATTRIBUTES = new Set(['id']);

/** Rounds every decimal number in an attribute value to at most 2 decimals. */
export const roundNumbers = (value: string): string =>
  value.replace(/-?\d*\.\d+(?:e[-+]?\d+)?/gi, (match) => {
    const rounded = Number(Number.parseFloat(match).toFixed(2));
    return Object.is(rounded, -0) ? '0' : String(rounded);
  });

// Carriage returns are escaped so that the golden files survive line-ending conversion.
const escapeAttr = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\r/g, '&#13;');

const escapeText = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#13;');

const attributeName = (attr: Attr): string =>
  attr.namespaceURI === XLINK_NS ? `xlink:${attr.localName}` : attr.name;

const serializeElement = (el: Element, depth: number, isRoot: boolean): string[] => {
  const indent = '  '.repeat(depth);
  const attrs = Array.from(el.attributes)
    .filter((a) => !VOLATILE_ATTRIBUTES.has(a.name) && a.name !== 'xmlns')
    .map((a) => [attributeName(a), roundNumbers(a.value)] as const);
  if (isRoot) {
    attrs.push(['xmlns', SVG_NS], ['xmlns:xlink', XLINK_NS]);
  }
  attrs.sort(([a], [b]) => Number(a > b) - Number(a < b));
  const open = `${indent}<${el.localName}${attrs.map(([n, v]) => ` ${n}="${escapeAttr(v)}"`).join('')}`;

  const children = Array.from(el.childNodes);
  if (children.length === 0) {
    return [`${open}/>`];
  }
  if (children.every((c) => c.nodeType === c.TEXT_NODE)) {
    return [`${open}>${escapeText(el.textContent ?? '')}</${el.localName}>`];
  }
  const lines = [`${open}>`];
  children.forEach((child) => {
    if (child.nodeType === child.ELEMENT_NODE) {
      lines.push(...serializeElement(child as Element, depth + 1, false));
    } else if (child.nodeType === child.TEXT_NODE && (child.textContent ?? '').trim() !== '') {
      lines.push(`${indent}  ${escapeText(child.textContent ?? '')}`);
    }
  });
  lines.push(`${indent}</${el.localName}>`);
  return lines;
};

/** Serializes an element (normally the workspace <svg>) into stable, readable markup. */
export const serializeSvg = (el: Element): string =>
  `${serializeElement(el, 0, true).join('\n')}\n`;

const shouldUpdate = (): boolean => {
  if (process.env.UPDATE_GOLDENS === '1' || process.env.UPDATE_GOLDENS === 'true') {
    return true;
  }
  // `jest -u` sets the snapshot state to "all".
  const state = expect.getState() as { snapshotState?: { _updateSnapshot?: string } };
  return state.snapshotState?._updateSnapshot === 'all';
};

/** Compares the serialized element with test/unit/__goldens__/<name>.svg. */
export const expectGolden = (name: string, el: Element): void => {
  const actual = serializeSvg(el);
  const file = path.join(GOLDEN_DIR, `${name}.svg`);
  const exists = fs.existsSync(file);
  if (shouldUpdate() || (!exists && !process.env.CI)) {
    fs.mkdirSync(GOLDEN_DIR, { recursive: true });
    if (!exists || fs.readFileSync(file, 'utf8') !== actual) {
      fs.writeFileSync(file, actual);
    }
    return;
  }
  if (!exists) {
    throw new Error(`Missing golden ${file}. Run: UPDATE_GOLDENS=1 yarn test:unit`);
  }
  expect(actual).toBe(fs.readFileSync(file, 'utf8'));
};

/** Names of the golden files on disk, without extension. */
export const listGoldens = (): string[] =>
  fs.existsSync(GOLDEN_DIR)
    ? fs
        .readdirSync(GOLDEN_DIR)
        .filter((f) => f.endsWith('.svg'))
        .map((f) => f.replace(/\.svg$/, ''))
    : [];

export type Scene = { workspace: Workspace; svg: Element };

/**
 * Creates a workspace like the Storybook stories do: `size` px wide and high, with the given
 * coordinate size and origin.
 */
export const createScene = (
  elements: WorkspaceElement<ElementPeer>[] = [],
  {
    size = 400,
    coordSize = [400, 400] as [number, number],
    coordOrigin = [-200, -200] as [number, number],
  } = {},
): Scene => {
  const workspace = new Workspace();
  workspace.setSize(`${size}px`, `${size}px`);
  workspace.setCoordSize(coordSize[0], coordSize[1]);
  workspace.setCoordOrigin(coordOrigin[0], coordOrigin[1]);
  elements.forEach((e) => workspace.append(e));
  return { workspace, svg: workspace.getSVGElement() };
};
