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

export interface LanguageConfig {
  code: LocaleCode;
  label: string;
  dayjsLocale: string;
  webappMessages: string;
  editorMessages: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    label: 'English',
    dayjsLocale: 'en',
    webappMessages: './../../compiled-lang/en.json',
    editorMessages: './../../lang/en.json',
  },
  {
    code: 'es',
    label: 'Español',
    dayjsLocale: 'es',
    webappMessages: './../../compiled-lang/es.json',
    editorMessages: './../../lang/es.json',
  },
  {
    code: 'de',
    label: 'Deutsch',
    dayjsLocale: 'de',
    webappMessages: './../../compiled-lang/de.json',
    editorMessages: './../../lang/de.json',
  },
  {
    code: 'fr',
    label: 'Français',
    dayjsLocale: 'fr',
    webappMessages: './../../compiled-lang/fr.json',
    editorMessages: './../../lang/fr.json',
  },
  {
    code: 'ru',
    label: 'Pусский',
    dayjsLocale: 'ru',
    webappMessages: './../../compiled-lang/ru.json',
    editorMessages: './../../lang/ru.json',
  },
  {
    code: 'uk',
    label: 'Українська',
    dayjsLocale: 'uk',
    webappMessages: './../../compiled-lang/uk.json',
    editorMessages: './../../lang/uk.json',
  },
  {
    code: 'zh',
    label: '中文 (简体)',
    dayjsLocale: 'zh',
    webappMessages: './../../compiled-lang/zh.json',
    editorMessages: './../../lang/zh.json',
  },
  {
    code: 'zh-CN',
    label: '中文 (普通话)',
    dayjsLocale: 'zh-cn',
    webappMessages: './../../compiled-lang/zh-CN.json',
    editorMessages: './../../lang/zh-CN.json',
  },
  {
    code: 'ja',
    label: '日本語',
    dayjsLocale: 'ja',
    webappMessages: './../../compiled-lang/ja.json',
    editorMessages: './../../lang/ja.json',
  },
  {
    code: 'pt',
    label: 'Português',
    dayjsLocale: 'pt',
    webappMessages: './../../compiled-lang/pt.json',
    editorMessages: './../../lang/pt.json',
  },
  {
    code: 'it',
    label: 'Italiano',
    dayjsLocale: 'it',
    webappMessages: './../../compiled-lang/it.json',
    editorMessages: './../../lang/it.json',
  },
  {
    code: 'hi',
    label: 'हिन्दी',
    dayjsLocale: 'hi',
    webappMessages: './../../compiled-lang/hi.json',
    editorMessages: './../../lang/hi.json',
  },
];

export const getLanguageByCode = (code: LocaleCode): LanguageConfig | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getDefaultLanguage = (): LanguageConfig => {
  return SUPPORTED_LANGUAGES[0]; // English as default
};

export const getBrowserLanguage = (): LanguageConfig => {
  let localeCode = (navigator.languages && navigator.languages[0]) || navigator.language;
  
  // Just remove the variant ...
  localeCode = localeCode.split('-')[0];
  
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === localeCode);
  return language || getDefaultLanguage();
};
