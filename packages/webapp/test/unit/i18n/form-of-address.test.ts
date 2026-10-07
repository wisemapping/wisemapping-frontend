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

/**
 * German and Spanish address the user informally ("du", "tú"), as most of their messages and the
 * editor's already did; a few older ones used the formal "Sie" and "usted". The formal markers
 * below never mean anything else in a UI message: third-person "sie" and "su" are lower case or
 * ambiguous, so they are not listed. ALLOWED takes ids that rightly use one of these words.
 */
const FORMAL: Record<string, RegExp> = {
  de: /\b(Sie|Ihnen|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres)\b/,
  es: /\b(usted|ustedes|Ingrese|Introduzca|Seleccione|Haga|Inténtelo|Regístrese|Contáctenos|Contacte|Espere|Use|Utilice|Elija|Escriba|Revise|Vuelva|Proporcione|Complete|Le|le enviaremos|le hemos)\b/,
};
const INFORMAL: Record<string, RegExp> = {
  de: /\b(du|dich|dir|dein|deine|deinen|deinem|deiner|deines)\b/i,
  es: /\b(tú|tu|tus|te|puedes|necesitas|quieres|Inténtalo|Haz|Regístrate|Inicia)\b/i,
};
const ALLOWED: Record<string, string[]> = { de: [], es: [] };

describe.each(Object.keys(FORMAL))('%s messages', (lang) => {
  const messages = readLang(lang);

  test('address the user informally', () => {
    const formal = Object.keys(messages)
      .filter((id) => FORMAL[lang].test(messages[id].defaultMessage))
      .filter((id) => !ALLOWED[lang].includes(id))
      .map((id) => `${id}: ${messages[id].defaultMessage}`);
    expect(formal).toEqual([]);
    expect(
      Object.values(messages).filter(({ defaultMessage }) => INFORMAL[lang].test(defaultMessage))
        .length,
    ).toBeGreaterThan(20);
  });
});
