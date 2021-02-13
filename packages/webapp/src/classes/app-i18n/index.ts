export class Locale {
    code: LocaleCode;
    label: string;

    constructor(code: LocaleCode, label: string) {
        this.code = code;
        this.label = label;
    }
}

export default class AppI18n {
    private locale: Locale = Locales.EN;

    constructor(localeCode: string) {
        try {
            this.locale = localeFromStr(localeCode)
        } catch {
            this.locale = this.browserLocale();
        }
    }

    getLocale(): Locale {
        return this.locale;
    }

    resourceBundle(): string {
        return `./compiled-lang/${this.locale.code}.json`;
    }

    private browserLocale(): Locale {
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
    EN: new Locale('en', 'English'),
    ES: new Locale('es', 'Español'),
    DE: new Locale('de', 'Français'),
    FR: new Locale('fr', 'Deutsch'),
}

export const localeFromStr = (code: string): Locale => {
    const locales: Locale[] = Object
        .values(Locales);

    const result = locales
        .find((l) => l.code == code);

    if (!result) {
        throw `Langunage code could not be found in list of default supported: + ${code}`
    }

    return result;
}