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

/**
 * Supported locales for localized URLs
 */
export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'ru',
  'uk',
  'zh',
  'zh-CN',
  'ja',
  'pt',
  'it',
  'hi',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Maps locale codes to hreflang values
 * Some locales need special handling (e.g., zh-CN -> zh-CN, zh -> zh)
 */
function getHreflangCode(locale: string): string {
  // zh-CN should stay as zh-CN, zh should stay as zh
  if (locale === 'zh-CN' || locale === 'zh') {
    return locale;
  }
  // For other locales, use the first part (e.g., en-US -> en)
  return locale.split('-')[0];
}

/**
 * Extracts locale from current URL path
 * Returns the locale if found, null otherwise
 */
export function getLocaleFromPath(): SupportedLocale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const path = window.location.pathname;
  const localeMatch = path.match(/^\/(en|es|fr|de|ru|uk|zh|zh-CN|ja|pt|it|hi)\/c\//);

  if (localeMatch && localeMatch[1]) {
    const locale = localeMatch[1] as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(locale)) {
      return locale;
    }
  }

  return null;
}

/**
 * Generates canonical URL based on current path and locale
 * Always returns the non-localized version as canonical to avoid duplicate content issues.
 * Use hreflang tags for alternate language versions.
 */
export function getCanonicalUrl(
  basePath:
    | '/c/login'
    | '/c/registration'
    | '/c/forgot-password'
    | '/c/registration-success'
    | '/c/activation'
    | '/c/forgot-password-success',
): string {
  // Always return non-localized version as canonical
  // This consolidates duplicate content and prevents Google from choosing different canonicals
  return basePath;
}

/**
 * Generates alternate language URLs for hreflang tags
 * Includes all supported locales plus the non-localized version
 */
export function getAlternateLanguageUrls(
  basePath:
    | '/c/login'
    | '/c/registration'
    | '/c/forgot-password'
    | '/c/registration-success'
    | '/c/activation'
    | '/c/forgot-password-success',
): Array<{ hreflang: string; href: string }> {
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://app.wisemapping.com';

  const alternates: Array<{ hreflang: string; href: string }> = [];

  // Add non-localized version (x-default points to the default language)
  alternates.push({
    hreflang: 'x-default',
    href: `${baseUrl}${basePath}`,
  });

  // Add all localized versions
  SUPPORTED_LOCALES.forEach((locale) => {
    alternates.push({
      hreflang: getHreflangCode(locale),
      href: `${baseUrl}/${locale}${basePath}`,
    });
  });

  return alternates;
}
