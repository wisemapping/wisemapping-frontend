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

// Messages a locale rightly writes as English does: names, loanwords and the URL placeholder.
const SAME_AS_ENGLISH: Record<string, string[]> = {
  'link.placeholder': locales,
  'appbar.logo-aria-label': ['de'],
  'canvas-style.tab-color': ['es'],
  'color-picker.color': ['es'],
  'creator-info-pane.description': ['fr'],
  'editor-panel.link-panel-title': ['pt'],
  'editor-panel.note-panel-title': ['fr'],
  'icon-collection.connection.arc': ['fr'],
  'icon-collection.connection.neuron': ['de'],
  'icon-collection.shape.ellipse': ['de', 'fr'],
  'icon-collection.shape.rectangle': ['fr'],
  'icon-picker.emojis': ['de', 'es', 'fr', 'pt'],
  'layout.mindmap.name': ['de'],
  'outline.link': ['de', 'it', 'pt'],
  'outline.note': ['fr'],
  'shortcut-help-pane.action': ['fr'],
  'shortcut-help-pane.category-format': ['de', 'fr'],
  'shortcut-help-pane.diagram-parent': ['fr'],
  'shortcut-help-pane.navigation': ['de'],
  'theme.aurora.name': ['de', 'es', 'fr', 'it', 'pt'],
  'theme.robot.name': ['es', 'fr', 'it'],
};

describe.each(locales)('%s messages', (lang) => {
  const messages = readLang(lang);

  // BL5-176: keys added to English never reached the locales, and others were left in English.
  test('has every English message', () => {
    expect(Object.keys(en).filter((id) => !messages[id])).toEqual([]);
  });

  // BL5-195: messages removed from English stayed in every locale.
  test('has no message English does not have', () => {
    expect(Object.keys(messages).filter((id) => !en[id])).toEqual([]);
  });

  test('translates every English message', () => {
    const untranslated = Object.keys(en).filter(
      (id) =>
        messages[id]?.defaultMessage === en[id].defaultMessage &&
        !SAME_AS_ENGLISH[id]?.includes(lang),
    );
    expect(untranslated).toEqual([]);
  });

  test.each(['icon-collection.default-tooltip', 'icon-collection.border.default-tooltip'])(
    'translates %s',
    (id) => {
      expect(messages[id]?.defaultMessage).toBeDefined();
      expect(messages[id].defaultMessage).not.toBe(en[id].defaultMessage);
    },
  );

  test('names the grid size, not a grid style', () => {
    // English renamed "Grid Style" to "Grid Size"; the old translations said "style".
    const before: Record<string, string> = {
      ar: 'نمط الشبكة',
      de: 'Rasterstil',
      es: 'Estilo de cuadrícula',
      fr: 'Style de grille',
      hi: 'ग्रिड शैली',
      it: 'Stile griglia',
      ja: 'グリッドスタイル',
      pt: 'Estilo da grade',
      ru: 'Стиль сетки',
      uk: 'Стиль сітки',
      'zh-CN': '网格样式',
      zh: '网格样式',
    };
    expect(en['canvas-style.grid-style'].defaultMessage).toBe('Grid Size');
    expect(messages['canvas-style.grid-style'].defaultMessage).not.toBe(before[lang]);
  });
});
