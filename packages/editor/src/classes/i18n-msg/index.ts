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

import { useEffect, useState } from 'react';
// English is the fallback, so it is bundled; every other locale is a chunk of its own, loaded
// when a user needs it (together they are about 245 KB).
import en from './../../compiled-lang/en.json';

type MessagePart = {
  type: number;
  value: string;
};

export type LocaleData = Record<string, MessagePart[]>;

type Catalog = { default: unknown };

const LOADERS: Record<string, () => Promise<Catalog>> = {
  fr: () => import('./../../compiled-lang/fr.json'),
  es: () => import('./../../compiled-lang/es.json'),
  de: () => import('./../../compiled-lang/de.json'),
  ru: () => import('./../../compiled-lang/ru.json'),
  uk: () => import('./../../compiled-lang/uk.json'),
  zh: () => import('./../../compiled-lang/zh.json'),
  'zh-CN': () => import('./../../compiled-lang/zh-CN.json'),
  ja: () => import('./../../compiled-lang/ja.json'),
  pt: () => import('./../../compiled-lang/pt.json'),
  it: () => import('./../../compiled-lang/it.json'),
  hi: () => import('./../../compiled-lang/hi.json'),
  ar: () => import('./../../compiled-lang/ar.json'),
};

const loaded = new Map<string, LocaleData>([['en', en as LocaleData]]);

/** The locale whose messages are served: an unsupported one falls back to English. */
const supported = (locale: string): string => (LOADERS[locale] ? locale : 'en');

class I18nMsg {
  /** The messages of a locale already loaded, or undefined. */
  static getLoaded(locale: string): LocaleData | undefined {
    return loaded.get(supported(locale));
  }

  /**
   * Loads the messages of a locale. Calling it before rendering the editor (from a route loader)
   * shows the editor in that language from its first paint.
   */
  static async load(locale: string): Promise<LocaleData> {
    const code = supported(locale);
    const ready = loaded.get(code);
    if (ready) {
      return ready;
    }
    const loader = LOADERS[code];
    if (!loader) {
      // Only English has no loader, and it is bundled.
      return en as LocaleData;
    }
    const messages = (await loader()).default as LocaleData;
    loaded.set(code, messages);
    return messages;
  }
}

/**
 * The locale and messages to give IntlProvider. Until the locale's messages are loaded it serves
 * English, as English: react-intl would report every message as missing for another locale.
 */
export const useLocaleData = (locale: string): { locale: string; messages: LocaleData } => {
  const [shown, setShown] = useState(() => {
    const messages = I18nMsg.getLoaded(locale);
    return messages ? { locale, messages } : { locale: 'en', messages: en as LocaleData };
  });

  // A locale already loaded is shown in the same render.
  const ready = I18nMsg.getLoaded(locale);
  if (ready && shown.messages !== ready) {
    setShown({ locale, messages: ready });
  }

  useEffect(() => {
    if (I18nMsg.getLoaded(locale)) {
      return undefined;
    }
    let current = true;
    I18nMsg.load(locale)
      .then((messages) => {
        if (current) {
          setShown({ locale, messages });
        }
      })
      .catch((error) => console.error(`Messages for locale ${locale} could not be loaded`, error));
    return () => {
      current = false;
    };
  }, [locale]);

  return shown;
};

export default I18nMsg;
