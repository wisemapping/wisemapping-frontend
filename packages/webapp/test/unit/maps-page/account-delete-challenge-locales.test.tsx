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

import fs from 'fs';
import path from 'path';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';

// The suite's react-intl stand-in only renders defaultMessage. This one renders a locale's compiled
// messages (literals and {arguments}) and, like react-intl, falls back to the defaultMessage of an
// id the locale does not have.
type MockElement = { type: number; value: string };
type MockDescriptor = { id: string; defaultMessage?: string };
type MockValues = Record<string, unknown>;
jest.mock('react-intl', () => {
  const ReactInContext = jest.requireActual<typeof React>('react');
  const MessagesContext = ReactInContext.createContext<Record<string, MockElement[]>>({});
  const fromDefault = (message: string, values?: MockValues): string =>
    message.replace(/\{(\w+)\}/g, (match, key) =>
      values?.[key] === undefined ? match : String(values[key]),
    );
  const formatWith =
    (messages: Record<string, MockElement[]>) =>
    ({ id, defaultMessage }: MockDescriptor, values?: MockValues): string => {
      const compiled = messages[id];
      if (!compiled) {
        return fromDefault(defaultMessage ?? id, values);
      }
      return compiled
        .map((element) => {
          if (element.type === 0) return element.value;
          if (element.type === 1) return String(values?.[element.value]);
          throw new Error(`${id}: unsupported message element ${element.type}`);
        })
        .join('');
    };
  const useIntl = () => ({
    locale: 'en',
    formatMessage: formatWith(ReactInContext.useContext(MessagesContext)),
  });
  return {
    useIntl,
    defineMessages: <T,>(messages: T): T => messages,
    IntlProvider: ({
      messages,
      children,
    }: {
      messages: Record<string, MockElement[]>;
      children?: React.ReactNode;
    }) => <MessagesContext.Provider value={messages}>{children}</MessagesContext.Provider>,
    FormattedMessage: ({ values, ...descriptor }: MockDescriptor & { values?: MockValues }) => (
      <>{useIntl().formatMessage(descriptor, values)}</>
    ),
  };
});

import { IntlProvider } from 'react-intl';
import AccountInfoDialog from '../../../src/components/maps-page/account-menu/account-info-dialog';
import Client from '../../../src/classes/client';
import { ClientContext } from '../../../src/classes/provider/client-context';
import { createAppTheme } from '../../../src/theme';

const root = path.resolve(__dirname, '../../..');
const compiled = (locale: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.resolve(root, `src/compiled-lang/${locale}.json`), 'utf8'));

// The phrase each locale asks the user to type to delete the account.
const phrases: Record<string, string> = {
  en: 'DELETE MY ACCOUNT',
  es: 'ELIMINAR MI CUENTA',
  fr: 'SUPPRIMER MON COMPTE',
  de: 'MEIN KONTO LÖSCHEN',
  it: 'ELIMINA IL MIO ACCOUNT',
  pt: 'EXCLUIR MINHA CONTA',
  ru: 'УДАЛИТЬ МОЙ АККАУНТ',
  uk: 'ВИДАЛИТИ МІЙ АКАУНТ',
  zh: '删除我的账号',
  'zh-CN': '删除我的账户',
  ja: 'アカウントを削除',
  hi: 'मेरा खाता हटाएं',
  ar: 'حذف حسابي',
};

const renderDialog = (locale: string) => {
  // Never settles: a successful delete navigates away, which jsdom cannot do.
  const deleteAccount = jest.fn(() => new Promise<void>(() => undefined));
  const client = {
    fetchAccountInfo: () =>
      Promise.resolve({
        email: 'user@example.com',
        firstname: 'Jane',
        lastname: 'Doe',
        authenticationType: 'DATABASE',
        locale,
      }),
    deleteAccount,
  } as unknown as Client;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <ThemeProvider theme={createAppTheme('light')}>
      <IntlProvider locale={locale} messages={compiled(locale) as Record<string, never>}>
        <QueryClientProvider client={queryClient}>
          <ClientContext.Provider value={client}>
            <AccountInfoDialog onClose={jest.fn()} />
          </ClientContext.Provider>
        </QueryClientProvider>
      </IntlProvider>
    </ThemeProvider>,
  );
  return { deleteAccount };
};

// Opens the delete confirmation without relying on translated button names.
const openDeleteConfirmation = async (): Promise<HTMLInputElement> => {
  const tabs = await screen.findAllByRole('tab');
  fireEvent.click(tabs[1]);
  fireEvent.click((await screen.findByTestId('DeleteForeverIcon')).closest('button')!);
  await waitFor(() =>
    expect(document.querySelector('input[name="deleteConfirmation"]')).not.toBeNull(),
  );
  return document.querySelector('input[name="deleteConfirmation"]') as HTMLInputElement;
};

// The red confirm button next to the field (the footer one is the form's submit).
const confirmButton = (): HTMLButtonElement =>
  document.querySelector('button.MuiButton-contained.MuiButton-colorError:not([type="submit"])')!;

describe.each(Object.keys(phrases))('%s account deletion', (locale) => {
  const phrase = phrases[locale];

  test('the instruction and the field label show the phrase the check accepts', async () => {
    const { deleteAccount } = renderDialog(locale);
    const input = await openDeleteConfirmation();

    const instruction = screen.getByRole('alert').textContent ?? '';
    expect(instruction).toContain(phrase);
    const label = document.querySelector(`label[for="${input.id}"]`)?.textContent ?? '';
    expect(label).toContain(phrase);
    if (locale !== 'en') {
      // Not the English phrase left untranslated in a translated sentence.
      expect(instruction).not.toContain('DELETE MY ACCOUNT');
    }

    expect(confirmButton().disabled).toBe(true);
    fireEvent.change(input, { target: { value: phrase } });
    expect(confirmButton().disabled).toBe(false);
    fireEvent.click(confirmButton());
    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
  });

  test('submitting the form accepts the phrase shown', async () => {
    const { deleteAccount } = renderDialog(locale);
    const input = await openDeleteConfirmation();

    fireEvent.change(input, { target: { value: phrase } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
  });

  test('the error message names the phrase shown', async () => {
    const { deleteAccount } = renderDialog(locale);
    const input = await openDeleteConfirmation();
    const mentions = () => (document.body.textContent ?? '').split(phrase).length - 1;
    const before = mentions();

    fireEvent.change(input, { target: { value: 'DELETE' } });
    fireEvent.submit(input.closest('form')!);

    // The error under the field repeats the phrase.
    await waitFor(() => expect(mentions()).toBeGreaterThan(before));
    expect(deleteAccount).not.toHaveBeenCalled();
  });
});
