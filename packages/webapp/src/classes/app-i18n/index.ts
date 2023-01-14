import { useFetchAccount } from './../../redux/clientSlice';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/de';
import 'dayjs/locale/ru';
import 'dayjs/locale/zh';

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
    // @Todo Hack: Try page must not account info. Add this to avoid 403 errors.
    const isTryPage = window.location.pathname.endsWith('/try');
    let result: Locale;
    if (!isTryPage) {
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

export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'ru' | 'zh';

export const Locales = {
  EN: new Locale('en', 'English', require('./../../compiled-lang/en.json')), // eslint-disable-line
  ES: new Locale('es', 'Español', require('./../../compiled-lang/es.json')), // eslint-disable-line
  DE: new Locale('fr', 'Français', require('./../../compiled-lang/fr.json')), // eslint-disable-line
  FR: new Locale('de', 'Deutsch', require('./../../compiled-lang/de.json')), // eslint-disable-line
  RU: new Locale('ru', 'Pусский', require('./../../compiled-lang/ru.json')), // eslint-disable-line
  ZH: new Locale('zh', '中文 (简体)', require('./../../compiled-lang/zh.json')), // eslint-disable-line
};

export const localeFromStr = (code: string): Locale => {
  const locales: Locale[] = Object.values(Locales);

  const result = locales.find((l) => l.code == code);

  if (!result) {
    throw `Language code could not be found in list of default supported: + ${code}`;
  }

  return result;
};
