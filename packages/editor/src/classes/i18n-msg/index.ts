/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
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
        return require('./../../compiled-lang/fr.json');
      case 'en':
        return require('./../../compiled-lang/en.json');
      case 'es':
        return require('./../../compiled-lang/es.json');
      case 'de':
        return require('./../../compiled-lang/de.json');
      case 'ru':
        return require('./../../compiled-lang/ru.json');
      case 'zh':
        return require('./../../compiled-lang/zh.json');
      case 'ja':
        return require('./../../compiled-lang/ja.json');
      case 'pt':
        return require('./../../compiled-lang/pt.json');
      default:
        return require('./../../compiled-lang/en.json');
    }
  }
}

export default I18nMsg;
