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
class I18nMsg {
  static loadLocaleData(locale: string): Record<string, string> {
    switch (locale) {
      case 'fr':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/fr.json');
      case 'en':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/en.json');
      case 'es':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/es.json');
      case 'de':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/de.json');
      case 'ru':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/ru.json');
      case 'uk':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/uk.json');
      case 'zh':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/zh.json');
      case 'zh-CN':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/zh.json');
      case 'ja':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/ja.json');
      case 'pt':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/pt.json');
      case 'it':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/it.json');
      case 'hi':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/hi.json');
      default:
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('./../../compiled-lang/en.json');
    }
  }
}

export default I18nMsg;
