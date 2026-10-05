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

// The compiled AST react-intl renders: 0 = literal text, 1 = an argument such as {title}.
type Element = { type: number; value: string };

const root = path.resolve(__dirname, '../../..');
const compiled = (locale: string): Record<string, Element[]> =>
  JSON.parse(fs.readFileSync(path.resolve(root, `src/compiled-lang/${locale}.json`), 'utf8'));

// The title of a duplicated map: "Copy of {title}" in English. Languages that say "the copy"
// after the name (a postposition, or "X's copy") place the title first.
const expected: Record<string, Element[]> = {
  en: [
    { type: 0, value: 'Copy of ' },
    { type: 1, value: 'title' },
  ],
  es: [
    { type: 0, value: 'Copia de ' },
    { type: 1, value: 'title' },
  ],
  fr: [
    { type: 0, value: 'Copie de ' },
    { type: 1, value: 'title' },
  ],
  de: [
    { type: 0, value: 'Kopie von ' },
    { type: 1, value: 'title' },
  ],
  it: [
    { type: 0, value: 'Copia di ' },
    { type: 1, value: 'title' },
  ],
  pt: [
    { type: 0, value: 'Cópia de ' },
    { type: 1, value: 'title' },
  ],
  ru: [
    { type: 0, value: 'Копия ' },
    { type: 1, value: 'title' },
  ],
  uk: [
    { type: 0, value: 'Копія ' },
    { type: 1, value: 'title' },
  ],
  ar: [
    { type: 0, value: 'نسخة من ' },
    { type: 1, value: 'title' },
  ],
  hi: [
    { type: 1, value: 'title' },
    { type: 0, value: ' की प्रतिलिपि' },
  ],
  ja: [
    { type: 1, value: 'title' },
    { type: 0, value: 'のコピー' },
  ],
  zh: [
    { type: 1, value: 'title' },
    { type: 0, value: '的副本' },
  ],
  'zh-CN': [
    { type: 1, value: 'title' },
    { type: 0, value: '的副本' },
  ],
};

describe('duplicate.copy-title', () => {
  test.each(Object.keys(expected))('%s places the map title in the phrase', (locale) => {
    const messages = compiled(locale);
    expect(messages['duplicate.copy-title']).toEqual(expected[locale]);
    // The prefix-only message it replaces, which the dialog always put before the title.
    expect(messages['duplicate.copy-prefix']).toBeUndefined();
  });
});
