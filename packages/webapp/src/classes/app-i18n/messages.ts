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
import type { MessageFormatElement } from 'react-intl';
import { appLogger as log } from '../../utils/logger';
import type { LocaleCode } from '.';
// English is the fallback, so it is bundled; every other locale is a chunk of its own, loaded
// when a user needs it (together they are about 480 KB).
import enMessages from '../../compiled-lang/en.json';

export type Messages = Record<string, MessageFormatElement[]>;

type Catalog = { default: unknown };

const LOADERS: Record<Exclude<LocaleCode, 'en'>, () => Promise<Catalog>> = {
  es: () => import('../../compiled-lang/es.json'),
  de: () => import('../../compiled-lang/de.json'),
  fr: () => import('../../compiled-lang/fr.json'),
  ru: () => import('../../compiled-lang/ru.json'),
  uk: () => import('../../compiled-lang/uk.json'),
  zh: () => import('../../compiled-lang/zh.json'),
  'zh-CN': () => import('../../compiled-lang/zh-CN.json'),
  ja: () => import('../../compiled-lang/ja.json'),
  pt: () => import('../../compiled-lang/pt.json'),
  it: () => import('../../compiled-lang/it.json'),
  hi: () => import('../../compiled-lang/hi.json'),
  ar: () => import('../../compiled-lang/ar.json'),
};

const ENGLISH = enMessages as unknown as Messages;
const loaded = new Map<LocaleCode, Messages>([['en', ENGLISH]]);

/** The messages of a locale already loaded, or undefined. */
export const getLoadedMessages = (code: LocaleCode): Messages | undefined => loaded.get(code);

/**
 * Loads the messages of a locale. The root route loader calls it with the user's locale, so
 * that the first paint is in that language.
 */
export const loadMessages = async (code: LocaleCode): Promise<Messages> => {
  const ready = loaded.get(code);
  if (ready) {
    return ready;
  }
  const messages = (await LOADERS[code as Exclude<LocaleCode, 'en'>]()).default as Messages;
  loaded.set(code, messages);
  return messages;
};

/**
 * Loads the messages of a locale, falling back to English when its chunk can not be fetched
 * (a deploy replaced it): the app is then in English instead of not starting.
 */
export const preloadMessages = (code: LocaleCode): Promise<Messages> =>
  loadMessages(code).catch((error) => {
    log.error(`Messages for locale ${code} could not be loaded`, error);
    return ENGLISH;
  });

export type LocaleMessages = { locale: LocaleCode; messages: Messages };

/**
 * The locale and messages to give IntlProvider. Until the locale's messages are loaded it serves
 * English, as English: react-intl would report every message as missing for another locale.
 */
export const useLocaleMessages = (code: LocaleCode): LocaleMessages => {
  const [shown, setShown] = useState<LocaleMessages>(() => {
    const messages = loaded.get(code);
    return messages ? { locale: code, messages } : { locale: 'en', messages: ENGLISH };
  });

  // A locale already loaded is shown in the same render.
  const ready = loaded.get(code);
  if (ready && shown.messages !== ready) {
    setShown({ locale: code, messages: ready });
  }

  useEffect(() => {
    if (loaded.has(code)) {
      return undefined;
    }
    let current = true;
    preloadMessages(code).then((messages) => {
      if (current && loaded.has(code)) {
        setShown({ locale: code, messages });
      }
    });
    return () => {
      current = false;
    };
  }, [code]);

  return shown;
};
