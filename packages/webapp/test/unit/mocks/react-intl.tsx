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
 * Minimal `react-intl` stand-in for the unit suite.
 *
 * `react-intl` and the `@formatjs` packages below it are ESM-only, which Jest
 * cannot `require()` without `--experimental-vm-modules`. Rather than turning
 * the whole runtime experimental, the unit suite renders the `defaultMessage`
 * declared next to every id - which is what the assertions read anyway, and
 * keeps them independent of `src/compiled-lang` output.
 */
import React from 'react';

type Descriptor = {
  id?: string;
  defaultMessage?: string;
};

type Values = Record<string, unknown>;

// English plurals: `{count, plural, one {# map} other {# maps}}`, with `=N` cases too.
const PLURAL = /\{(\w+), plural,((?:\s*(?:=\d+|zero|one|two|few|many|other)\s*\{[^{}]*\})+)\s*\}/g;

const pluralize = (message: string, values: Values): string =>
  message.replace(PLURAL, (match, key: string, cases: string) => {
    const value = Number(values[key]);
    if (values[key] === undefined || Number.isNaN(value)) {
      return match;
    }
    const options = Object.fromEntries(
      Array.from(cases.matchAll(/(=\d+|\w+)\s*\{([^{}]*)\}/g), (m) => [m[1], m[2]]),
    );
    const chosen = options[`=${value}`] ?? (value === 1 ? options.one : undefined) ?? options.other;
    return (chosen ?? match).replace(/#/g, String(value));
  });

const interpolate = (message: string, values?: Values): string =>
  values
    ? pluralize(message, values).replace(/\{(\w+)\}/g, (match, key) =>
        values[key] === undefined ? match : String(values[key]),
      )
    : message;

const formatMessage = (descriptor: Descriptor, values?: Values): string =>
  interpolate(descriptor?.defaultMessage ?? descriptor?.id ?? '', values);

export const intl = {
  locale: 'en',
  formatMessage,
  formatDate: (value: Date | number | string): string => new Date(value).toISOString(),
  formatNumber: (value: number): string => String(value),
  formatPlural: (value: number): string => (value === 1 ? 'one' : 'other'),
};

export const useIntl = (): typeof intl => intl;

export const createIntl = (): typeof intl => intl;

export const createIntlCache = (): Record<string, never> => ({});

export const IntlProvider = ({ children }: { children?: React.ReactNode }): React.ReactElement => (
  <>{children}</>
);

export const FormattedMessage = ({
  id,
  defaultMessage,
  values,
}: Descriptor & { values?: Values }): React.ReactElement => (
  <>{interpolate(defaultMessage ?? id ?? '', values)}</>
);

export const defineMessages = <T,>(messages: T): T => messages;

export const defineMessage = <T,>(message: T): T => message;
