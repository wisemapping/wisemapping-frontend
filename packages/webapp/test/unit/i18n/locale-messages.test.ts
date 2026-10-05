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

type Source = Record<string, { defaultMessage: string }>;

const langDir = path.resolve(__dirname, '../../../lang');
const readLang = (lang: string): Source =>
  JSON.parse(fs.readFileSync(path.join(langDir, `${lang}.json`), 'utf8')) as Source;

const en = readLang('en');
const locales = fs
  .readdirSync(langDir)
  .map((file) => path.basename(file, '.json'))
  .filter((lang) => lang !== 'en');

describe.each(locales)('%s messages', (lang) => {
  // BL5-195: messages removed from English stayed in every locale.
  test('has no message English does not have', () => {
    expect(Object.keys(readLang(lang)).filter((id) => !en[id])).toEqual([]);
  });
});
