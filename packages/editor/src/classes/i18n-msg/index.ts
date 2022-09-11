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
