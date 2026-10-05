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
import Bundle from '../../../src/components/lang/Bundle';

const enKeys = Object.keys(Bundle.en).sort();
const locales = Object.keys(Bundle).filter((l) => l !== 'en');

describe('mindplot language bundles', () => {
  it.each(locales)('%s has exactly the English key set', (locale) => {
    expect(Object.keys(Bundle[locale]).sort()).toEqual(enKeys);
  });

  it.each(Object.keys(Bundle))('%s has a non-empty translation for every key', (locale) => {
    const empty = Object.entries(Bundle[locale])
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('defines every key the sources pass to $msg', () => {
    const srcDir = path.resolve(__dirname, '../../../src');
    const used = new Set<string>();
    const walk = (dir: string): void => {
      fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (/\.tsx?$/.test(entry.name)) {
          const source = fs.readFileSync(full, 'utf8');
          [...source.matchAll(/\$msg\(\s*'([^']+)'/g)].forEach((m) => used.add(m[1]));
        }
      });
    };
    walk(srcDir);

    // Topic placeholder texts are looked up through the theme style msgKey.
    ['MAIN_TOPIC', 'SUB_TOPIC', 'CENTRAL_TOPIC', 'ISOLATED_TOPIC'].forEach((k) => used.add(k));

    const missing = [...used].filter((key) => !(key in Bundle.en)).sort();
    expect(missing).toEqual([]);
    expect(used.has('LINK')).toBe(true);
    expect(used.has('NOTE')).toBe(true);
  });

  it('labels link and note tooltips in English', () => {
    expect(Bundle.en.LINK).toBe('Link');
    expect(Bundle.en.NOTE).toBe('Note');
  });
});
