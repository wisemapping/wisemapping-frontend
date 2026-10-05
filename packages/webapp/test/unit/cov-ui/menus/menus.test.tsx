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

import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

jest.mock('react-router', () => jest.requireActual('../router-mock'));

import LanguageMenu from '../../../../src/components/maps-page/language-menu';
import AccountMenu from '../../../../src/components/maps-page/account-menu';
import HelpMenu from '../../../../src/components/maps-page/help-menu';
import Client, { AccountInfo, AuthenticationType } from '../../../../src/classes/client';
import { Locales } from '../../../../src/classes/app-i18n';
import { renderWithProviders } from '../../helpers/render';
import { resetRouter, routerState, setLocation } from '../router-mock';

const account = (extra: Partial<AccountInfo> = {}): AccountInfo => ({
  firstname: 'Jane',
  lastname: 'Doe',
  email: 'jane@wisemapping.com',
  locale: Locales.ES,
  authenticationType: AuthenticationType.DATABASE,
  isAdmin: false,
  ...extra,
});

beforeEach(() => {
  resetRouter();
  setLocation('/c/maps');
  localStorage.clear();
});

describe('LanguageMenu', () => {
  const setup = (info: AccountInfo = account()) => {
    const client = {
      fetchAccountInfo: jest.fn(() => Promise.resolve(info)),
      updateAccountLanguage: jest.fn<Promise<void>, [string]>(() => Promise.resolve()),
    };
    renderWithProviders(<LanguageMenu />, { client: client as unknown as Client });
    return client;
  };

  const openMenu = async (): Promise<HTMLElement> => {
    fireEvent.click(await screen.findByRole('button', { name: 'Change Language' }));
    return screen.findByRole('menu');
  };

  test("shows the account's language", async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Change Language' }).textContent).toBe('Español'),
    );
  });

  test('lists the languages, then the call for translators', async () => {
    setup();
    const menu = await openMenu();
    const labels = within(menu)
      .getAllByRole('menuitem')
      .map((item) => item.textContent);
    expect(labels).toEqual([
      ...Object.values(Locales).map((locale) => locale.label),
      'Help to Translate',
    ]);
  });

  // The items come from the supported locales; Ukrainian used to be missing from a hand-written
  // list.
  test('offers every supported language, Ukrainian included', async () => {
    setup();
    const menu = await openMenu();
    expect(within(menu).getByRole('menuitem', { name: Locales.UK.label })).toBeTruthy();
  });

  test('picking a language saves it to the account and refreshes it', async () => {
    const client = setup();
    const menu = await openMenu();

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Deutsch' }));

    await waitFor(() => expect(client.updateAccountLanguage).toHaveBeenCalledWith('de'));
    await waitFor(() => expect(client.fetchAccountInfo).toHaveBeenCalledTimes(2));
  });

  test('a failed language change is logged', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = setup();
    client.updateAccountLanguage.mockRejectedValue('offline');
    const menu = await openMenu();

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Italiano' }));

    await waitFor(() => expect(consoleError).toHaveBeenCalledWith('Unexpected error offline'));
    expect(client.updateAccountLanguage).toHaveBeenCalledWith('it');
  });

  test('"Help to Translate" explains how to help', async () => {
    setup();
    const menu = await openMenu();

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Help to Translate' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Help us to support more languages !')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByText('Help us to support more languages !')).toBeNull(),
    );
  });
});

describe('AccountMenu', () => {
  const setup = (info: AccountInfo = account()) => {
    const client = {
      fetchAccountInfo: jest.fn(() => Promise.resolve(info)),
      logout: jest.fn(() => Promise.resolve()),
    };
    renderWithProviders(<AccountMenu />, { client: client as unknown as Client });
    return client;
  };

  const openMenu = async (): Promise<HTMLElement> => {
    fireEvent.click(await screen.findByRole('button', { name: 'Jane Doe <jane@wisemapping.com>' }));
    return screen.findByRole('menu');
  };

  test('names the signed-in user on the account button', async () => {
    setup();
    expect(
      await screen.findByRole('button', { name: 'Jane Doe <jane@wisemapping.com>' }),
    ).toBeTruthy();
  });

  test('a regular user has no admin console', async () => {
    setup();
    const menu = await openMenu();
    expect(within(menu).queryByRole('menuitem', { name: 'Admin Console' })).toBeNull();
    expect(within(menu).getByRole('menuitem', { name: 'Account' })).toBeTruthy();
  });

  test('an admin can open the admin console', async () => {
    setup(account({ isAdmin: true }));
    const menu = await openMenu();

    fireEvent.click(await within(menu).findByRole('menuitem', { name: 'Admin Console' }));

    expect(routerState.navigate).toHaveBeenCalledWith('/c/admin');
  });

  test('Account opens the account settings', async () => {
    setup();
    const menu = await openMenu();

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Account' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText('Account Settings').length).toBeGreaterThan(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  test('Sign Out logs out and goes to login', async () => {
    const client = setup();
    const menu = await openMenu();

    fireEvent.click(within(menu).getByRole('link', { name: 'Sign Out' }));

    expect(client.logout).toHaveBeenCalledTimes(1);
    expect(routerState.navigate).toHaveBeenCalledWith('/c/login');
  });
});

describe('HelpMenu', () => {
  test('opens the support links and closes on choosing one', async () => {
    renderWithProviders(<HelpMenu />);

    fireEvent.click(screen.getByRole('button', { name: 'Support' }));

    const menu = await screen.findByRole('menu');
    const hrefs = within(menu)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual([
      'https://www.wisemapping.com/termsofuse.html',
      'https://www.wisemapping.com/privacy',
      'https://www.paypal.com/donate/?hosted_button_id=CF7GJ7T6E4RS4',
      'mailto:team@wisemapping.com',
      'mailto:feedback@wisemapping.com',
      'https://www.wisemapping.com/aboutus.html',
    ]);

    fireEvent.click(within(menu).getAllByRole('menuitem')[1]);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});
