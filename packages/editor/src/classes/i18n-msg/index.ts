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
// Import all locale files statically
// Note: All locales are loaded upfront, but the files are small (~10-20KB each)
// This ensures synchronous access which is required for proper editor initialization
import fr from './../../compiled-lang/fr.json';
import en from './../../compiled-lang/en.json';
import es from './../../compiled-lang/es.json';
import de from './../../compiled-lang/de.json';
import ru from './../../compiled-lang/ru.json';
import uk from './../../compiled-lang/uk.json';
import zh from './../../compiled-lang/zh.json';
import ja from './../../compiled-lang/ja.json';
import pt from './../../compiled-lang/pt.json';
import it from './../../compiled-lang/it.json';
import hi from './../../compiled-lang/hi.json';

type LocaleData = Record<string, string>;

class I18nMsg {
  static loadLocaleData(locale: string): LocaleData {
    switch (locale) {
      case 'fr':
        return fr;
      case 'en':
        return en;
      case 'es':
        return es;
      case 'de':
        return de;
      case 'ru':
        return ru;
      case 'uk':
        return uk;
      case 'zh':
      case 'zh-CN':
        return zh;
      case 'ja':
        return ja;
      case 'pt':
        return pt;
      case 'it':
        return it;
      case 'hi':
        return hi;
      default:
        return en;
    }
  }
}

export default I18nMsg;
