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
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/ru';
import 'dayjs/locale/uk';
import 'dayjs/locale/zh';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ja';
import 'dayjs/locale/pt';
import 'dayjs/locale/it';
import 'dayjs/locale/hi';
import enMessages from '../../compiled-lang/en.json';
import esMessages from '../../compiled-lang/es.json';
import deMessages from '../../compiled-lang/de.json';
import frMessages from '../../compiled-lang/fr.json';
import ruMessages from '../../compiled-lang/ru.json';
import ukMessages from '../../compiled-lang/uk.json';
import zhMessages from '../../compiled-lang/zh.json';
import zhCnMessages from '../../compiled-lang/zh-CN.json';
import jaMessages from '../../compiled-lang/ja.json';
import ptMessages from '../../compiled-lang/pt.json';
import itMessages from '../../compiled-lang/it.json';
import hiMessages from '../../compiled-lang/hi.json';
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
  private static readonly PUBLIC_AUTH_ROUTES = new Set<string>([
    '/',
    '/c/login',
    '/c/registration',
    '/c/registration-google',
    '/c/registration-facebook',
    '/c/oauth-callback',
    '/c/registration-success',
    '/c/activation',
    '/c/forgot-password',
    '/c/forgot-password-success',
  ]);
  private static localePrefixRegex: RegExp | null = null;

  public static getUserLocale(): Locale {
    const path = window.location.pathname;

    // Check if locale is in the URL path (e.g., /en/c/login, /es/c/registration)
    const localeMatch = path.match(
      /^\/(en|es|fr|de|ru|uk|zh|zh-CN|ja|pt|it|hi)\/c\/(login|registration|forgot-password)/,
    );
    if (localeMatch && localeMatch[1]) {
      try {
        const localeFromUrl = localeFromStr(localeMatch[1]);
        // Store the locale from URL in localStorage so it persists
        localStorage.setItem(AppI18n.LOCAL_STORAGE_KEY, localeFromUrl.code);
        return localeFromUrl;
      } catch {
        // If locale from URL is invalid, fall through to default logic
      }
    }

    // @Todo Hack: Try page must not account info. Add this to avoid 403 errors.
    const isPublicPage = AppI18n.isPublicPage(path);
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
      // Unsupported language code, falling back to default
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

  /**
   * Checks if a given path is a public page that should not require authentication.
   * Used to exclude account endpoint calls on public pages to avoid 403 errors.
   * @param path - The path to check (defaults to current window location)
   * @returns true if the path is a public page, false otherwise
   */
  public static isPublicPage(path?: string): boolean {
    const currentPath = path ?? window.location.pathname;
    return (
      AppI18n.isPublicUnauthenticatedRoute(currentPath) ||
      currentPath.endsWith('/try') ||
      currentPath.endsWith('/public') ||
      currentPath.endsWith('/embed')
    );
  }

  private static isPublicUnauthenticatedRoute(path: string): boolean {
    const normalizedPath = AppI18n.stripLocaleFromPath(path);
    return AppI18n.PUBLIC_AUTH_ROUTES.has(normalizedPath);
  }

  private static stripLocaleFromPath(path: string): string {
    if (!AppI18n.localePrefixRegex) {
      AppI18n.localePrefixRegex = AppI18n.buildLocalePrefixRegex();
    }
    return path.replace(AppI18n.localePrefixRegex, '');
  }

  private static buildLocalePrefixRegex(): RegExp {
    const localePattern = Object.values(Locales)
      .map((locale) => locale.code.replace('-', '\\-'))
      .join('|');
    return new RegExp(`^/(${localePattern})(?=/)`);
  }
}

export type LocaleCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'ru'
  | 'uk'
  | 'zh'
  | 'zh-CN'
  | 'ja'
  | 'pt'
  | 'it'
  | 'hi';

export const Locales = {
  EN: new Locale('en', 'English', enMessages),
  ES: new Locale('es', 'Español', esMessages),
  DE: new Locale('de', 'Deutsch', deMessages),
  FR: new Locale('fr', 'Français', frMessages),
  RU: new Locale('ru', 'Pусский', ruMessages),
  UK: new Locale('uk', 'Українська', ukMessages),
  ZH: new Locale('zh', '中文 (简体)', zhMessages),
  ZH_CN: new Locale('zh-CN', '中文 (普通话)', zhCnMessages),
  JA: new Locale('ja', '日本語', jaMessages),
  PT: new Locale('pt', 'Português', ptMessages),
  IT: new Locale('it', 'Italiano', itMessages),
  HI: new Locale('hi', 'हिन्दी', hiMessages),
};

export const localeFromStr = (code: string): Locale => {
  const locales: Locale[] = Object.values(Locales);

  const result = locales.find((l) => l.code == code);

  if (!result) {
    throw `Language code could not be found in list of default supported: + ${code}`;
  }

  return result;
};
