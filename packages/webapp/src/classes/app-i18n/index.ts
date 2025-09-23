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
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/ru';
import 'dayjs/locale/zh';
import 'dayjs/locale/ja';
import 'dayjs/locale/pt';
import 'dayjs/locale/it';
import { useFetchAccount } from '../middleware';

export class Locale {
  code: LocaleCode;
  label: string;
  message: Record<string, string>;

  constructor(code: LocaleCode, label: string, message: unknown) {
    this.code = code;
    this.label = label;
    this.message = message as Record<string, string>;
  }
}

export default abstract class AppI18n {
  private static LOCAL_STORAGE_KEY = 'user.locale';

  public static getUserLocale(): Locale {
    const path = window.location.pathname;
    // @Todo Hack: Try page must not account info. Add this to avoid 403 errors.
    const isPublicPage =
      path.endsWith('/try') || path.endsWith('/public') || path.endsWith('/embed');
    let result: Locale;
    if (!isPublicPage) {
      const account = useFetchAccount();
      result = account?.locale ? account.locale : this.getDefaultLocale();

      // If the local storage value is different, update ...
      if (account?.locale && result.code !== localStorage.getItem(AppI18n.LOCAL_STORAGE_KEY)) {
        localStorage.setItem(AppI18n.LOCAL_STORAGE_KEY, result.code);
      }
    } else {
      result = this.getDefaultLocale();
    }
    return result;
  }

  public static getBrowserLocale(): Locale {
    let localeCode = (navigator.languages && navigator.languages[0]) || navigator.language;

    // Just remove the variant ...
    localeCode = localeCode.split('-')[0];

    let result = Locales.EN;
    try {
      result = localeFromStr(localeCode);
    } catch {
      console.warn(`Unsupported languange code ${localeCode}`);
    }

    return result;
  }

  public static getDefaultLocale(): Locale {
    // Fetch local from local storage ...
    let result: Locale | null = null;
    const userLocaleCode: string | null = localStorage.getItem(AppI18n.LOCAL_STORAGE_KEY);
    if (userLocaleCode) {
      result = localeFromStr(userLocaleCode);
    }

    // Ok, use browser default ...
    if (!result) {
      result = this.getBrowserLocale();
    }
    return result;
  }
}

export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'ru' | 'zh' | 'ja' | 'pt' | 'it';

export const Locales = {
  EN: new Locale('en', 'English', require('./../../compiled-lang/en.json')), // eslint-disable-line
  ES: new Locale('es', 'Español', require('./../../compiled-lang/es.json')), // eslint-disable-line
  DE: new Locale('de', 'Deutsch', require('./../../compiled-lang/de.json')), // eslint-disable-line
  FR: new Locale('fr', 'Français', require('./../../compiled-lang/fr.json')), // eslint-disable-line
  RU: new Locale('ru', 'Pусский', require('./../../compiled-lang/ru.json')), // eslint-disable-line
  ZH: new Locale('zh', '中文 (简体)', require('./../../compiled-lang/zh.json')), // eslint-disable-line
  JA: new Locale('ja', '日本語', require('./../../compiled-lang/ja.json')), // eslint-disable-line
  PT: new Locale('pt', 'Português', require('./../../compiled-lang/pt.json')), // eslint-disable-line
  IT: new Locale('it', 'Italiano', require('./../../compiled-lang/it.json')), // eslint-disable-line
};

export const localeFromStr = (code: string): Locale => {
  const locales: Locale[] = Object.values(Locales);

  const result = locales.find((l) => l.code == code);

  if (!result) {
    throw `Language code could not be found in list of default supported: + ${code}`;
  }

  return result;
};
