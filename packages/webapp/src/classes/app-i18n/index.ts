import { fetchAccount } from './../../redux/clientSlice';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

export class Locale {
    code: LocaleCode;
    label: string;
    message: any;

    constructor(code: LocaleCode, label: string, message: any) {
        this.code = code;
        this.label = label;
        this.message = message;
    }
}

export default class AppI18n {

    constructor() {

    }

    public getUserLocale(): Locale {
        const account = fetchAccount();
        return account ? account.locale : this.getBrowserLocale();
    }

    public getBrowserLocale(): Locale {
        let localeCode = (navigator.languages && navigator.languages[0])
            || navigator.language;

        // Just remove the variant ...
        localeCode = localeCode.split('-')[0];

        let result = Locales.EN;
        try {
            result = localeFromStr(localeCode)
        } catch {
            console.warn(`Unsupported languange code ${localeCode}`);
        }

        return result;
    }
}

export type LocaleCode = 'en' | 'es' | 'fr' | 'de';

export const Locales =
{
    EN: new Locale('en', 'English', require('./../../compiled-lang/en.json')),
    ES: new Locale('es', 'Español', require('./../../compiled-lang/es.json')),
    DE: new Locale('fr', 'Français', require('./../../compiled-lang/fr.json')),
    FR: new Locale('de', 'Deutsch', require('./../../compiled-lang/de.json')),
}

export const localeFromStr = (code: string): Locale => {
    const locales: Locale[] = Object
        .values(Locales);

    const result = locales
        .find((l) => l.code == code);

    if (!result) {
        throw `Language code could not be found in list of default supported: + ${code}`
    }

    return result;
}