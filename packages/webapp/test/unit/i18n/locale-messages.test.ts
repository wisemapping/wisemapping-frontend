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

// Messages a locale rightly writes as English does: brand and technical names, the copyright
// line, and words the language uses as is (French Description, German Name, Italian Password...).
const SAME_AS_ENGLISH: Record<string, string[]> = {
  'accountinfo.email': ['it'],
  'action.info': ['it'],
  'action.rename-description-placeholder': ['fr'],
  'action.rename-name-placeholder': ['de'],
  'admin.auth.database': ['it'],
  'admin.auth.facebook': locales,
  'admin.auth.google': locales,
  'admin.auth.ldap': locales,
  'admin.maps.description': ['fr'],
  'admin.maps.filter.spam': ['de', 'es', 'fr', 'it', 'pt'],
  'admin.maps.table.actions': ['fr'],
  'admin.maps.table.description': ['fr'],
  'admin.maps.spam-label': ['de', 'es', 'fr', 'it', 'pt'],
  'admin.maps.table.spam': ['de', 'es', 'fr', 'it', 'pt'],
  'admin.maps.table.status': ['de', 'pt'],
  'admin.menu.system': ['de'],
  'admin.public': ['fr'],
  'admin.system.app.name': ['de'],
  'admin.system.app.port': ['de', 'fr'],
  'admin.system.application': ['fr'],
  'admin.system.database': ['it'],
  'admin.system.database.info': ['it'],
  'admin.system.db.ddl': locales,
  'admin.system.db.driver': ['it', 'pt'],
  'admin.system.db.url': ['de', 'es', 'fr', 'hi', 'it', 'ja', 'pt', 'ru', 'uk', 'zh', 'zh-CN'],
  'admin.system.jvm': locales,
  'admin.user-info.status': ['de', 'pt'],
  'changepwd.password': ['it'],
  'common.email': ['it'],
  'footer.col-community': ['de'],
  'footer.col-support': ['de'],
  'footer.copyright': locales,
  'footer.faq': ['it'],
  'footer.feedback': ['de', 'it', 'pt'],
  'footer.news': ['de'],
  'footer.opensource': ['de', 'it'],
  'footer.twitter': locales,
  'forgot.email': ['it'],
  'info.description': ['fr'],
  'info.name': ['de'],
  'info.title': ['it'],
  'login.email': ['it'],
  'login.page-title': ['it'],
  'login.password': ['it'],
  'map.actions': ['fr'],
  'map.labels': ['de'],
  'map.name': ['de'],
  'menu.account': ['it'],
  'registration.email': ['it'],
  'registration.password': ['it'],
  'role.editor': ['es', 'it', 'pt'],
  'share.message': ['fr'],
  'share.table.actions': ['fr'],
};

describe.each(locales)('%s messages', (lang) => {
  const messages = readLang(lang);

  // BL5-201 / BL5-218: a third of the English keys were missing from every locale and fell back to
  // English.
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
});

// Common characters only Traditional Chinese uses: their Simplified forms differ.
const TRADITIONAL_ONLY =
  /[預設體開關點擊選擇編輯檔圖畫線顏網頁樣題節級層連適佈視縮鍵刪註認們為個這與對時後從進]/;

// BL5-194: zh, Simplified Chinese, mixed in Traditional characters.
describe.each(['zh', 'zh-CN'])('%s messages', (lang) => {
  test('are written in Simplified characters', () => {
    const messages = readLang(lang);
    const traditional = Object.keys(messages)
      .filter((id) => TRADITIONAL_ONLY.test(messages[id].defaultMessage))
      .map((id) => `${id}: ${messages[id].defaultMessage}`);
    expect(traditional).toEqual([]);
  });
});
