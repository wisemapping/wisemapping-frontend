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
import FR from './../../compiled-lang/fr.json';
import ES from './../../compiled-lang/es.json';
import EN from './../../compiled-lang/en.json';
import DE from './../../compiled-lang/de.json';
import RU from './../../compiled-lang/ru.json';
import ZH from './../../compiled-lang/zh.json';

class I18nMsg {
  static loadLocaleData(locale: string) {
    switch (locale) {
      case 'fr':
        return FR;
      case 'en':
        return EN;
      case 'es':
        return ES;
      case 'de':
        return DE;
      case 'ru':
        return RU;
      case 'zh':
        return ZH;
      default:
        return EN;
    }
  }
}

export default I18nMsg;
