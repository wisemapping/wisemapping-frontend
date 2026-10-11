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
import { readStorage, writeStorage } from '../../utils/storage';
// Its messages are loaded on demand: see ./messages.
export class Locale {
  code: LocaleCode;
  label: string;

  constructor(code: LocaleCode, label: string) {
    this.code = code;
    this.label = label;
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
  private static localePrefixRegex: RegExp | undefined;

  public static getUserLocale(accountLocale?: Locale): Locale {
    const path = window.location.pathname;

    // Check if locale is in the URL path (e.g., /en/c/login, /es/c/registration)
    const localeMatch = path.match(
      /^\/(en|es|fr|de|ru|uk|zh|zh-CN|ja|pt|it|hi|ar)\/c\/(login|registration|forgot-password)/,
    );
    if (localeMatch && localeMatch[1]) {
      try {
        const localeFromUrl = localeFromStr(localeMatch[1]);
        // Store the locale from URL in localStorage so it persists
        writeStorage(AppI18n.LOCAL_STORAGE_KEY, localeFromUrl.code);
        return localeFromUrl;
      } catch {
        // If locale from URL is invalid, fall through to default logic
      }
    }

    // @Todo Hack: Try page must not account info. Add this to avoid 403 errors.
    const isPublicPage = AppI18n.isPublicPage(path);
    let result: Locale;
    if (!isPublicPage) {
      result = accountLocale ?? this.getDefaultLocale();

      // If the local storage value is different, update ...
      if (accountLocale && result.code !== readStorage(AppI18n.LOCAL_STORAGE_KEY)) {
        writeStorage(AppI18n.LOCAL_STORAGE_KEY, result.code);
      }
    } else {
      result = this.getDefaultLocale();
    }
    return result;
  }

  public static getBrowserLocale(): Locale {
    let localeCode = (navigator.languages && navigator.languages[0]) || navigator.language;

    // Just remove the variant ...
    localeCode = localeCode.split('-')[0] ?? localeCode;

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
    let result: Locale | undefined;
    const userLocaleCode = readStorage(AppI18n.LOCAL_STORAGE_KEY);
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
  'en' | 'es' | 'fr' | 'de' | 'ru' | 'uk' | 'zh' | 'zh-CN' | 'ja' | 'pt' | 'it' | 'hi' | 'ar';

export const Locales = {
  EN: new Locale('en', 'English'),
  ES: new Locale('es', 'Español'),
  DE: new Locale('de', 'Deutsch'),
  FR: new Locale('fr', 'Français'),
  RU: new Locale('ru', 'Pусский'),
  UK: new Locale('uk', 'Українська'),
  ZH: new Locale('zh', '中文 (简体)'),
  ZH_CN: new Locale('zh-CN', '中文 (普通话)'),
  JA: new Locale('ja', '日本語'),
  PT: new Locale('pt', 'Português'),
  IT: new Locale('it', 'Italiano'),
  HI: new Locale('hi', 'हिन्दी'),
  AR: new Locale('ar', 'العربية'),
};

export const localeFromStr = (code: string): Locale => {
  const locales: Locale[] = Object.values(Locales);

  const result = locales.find((l) => l.code == code);

  if (!result) {
    throw `Language code could not be found in list of default supported: + ${code}`;
  }

  return result;
};
