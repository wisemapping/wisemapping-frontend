export class Locale {
    code: LocaleCode;
    label: string;

    constructor(code: LocaleCode) {
        this.code = code;

        const label = LocalToStr.get(code);
        this.label = label ? label : 'Undefined';
    }
}

export default class AppLocale {

    private localeCode: LocaleCode = 'en';

    constructor(locale?: LocaleCode) {
        this.localeCode = locale ? locale : this.defaultLocale();
    }

    toString(): string {
        const result = LocalToStr.get(this.localeCode);
        if (result == null) {
            throw `Locale could not be translated: ${this.localeCode}`
        }
        return result ? result : 'Undefined';
    }

    private defaultLocale(): LocaleCode {
        const browserLocale = (navigator.languages && navigator.languages[0])
            || navigator.language;

        // Is a supported language ?
        let result:LocaleCode = 'en';
        if (LocalToStr.get(browserLocale as LocaleCode)) {
            result = browserLocale as LocaleCode;
        }

        return result;
    }
}
const LocalToStr = new Map<LocaleCode, string>([["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"]]);
export type LocaleCode = 'en' | 'es' | 'fr' | 'de';

export const Locales =
{
    EN: new Locale('en'),
    ES: new Locale('es'),
    DE: new Locale('de'),
    FR: new Locale('fr'),
}