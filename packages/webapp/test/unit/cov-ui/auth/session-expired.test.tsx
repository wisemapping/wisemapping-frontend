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
import { act, fireEvent, screen } from '@testing-library/react';

jest.mock('react-router', () => jest.requireActual('../router-mock'));

import CommonAuthPage from '../../../../src/components/common-auth-page';
import CommonPage from '../../../../src/components/common-page';
import Client from '../../../../src/classes/client';
import { renderWithProviders } from '../../helpers/render';

describe.each([
  ['common-auth-page', CommonAuthPage],
  ['common-page', CommonPage],
])('%s', (_name, Page) => {
  const setup = () => {
    let expire: () => void = () => undefined;
    const client = {
      onSessionExpired: jest.fn((callback: () => void) => {
        expire = callback;
      }),
    };
    renderWithProviders(<Page />, { client: client as unknown as Client });
    return { client, expire: () => act(() => expire()) };
  };

  test('renders the nested route and no dialog while the session is alive', () => {
    const { client } = setup();

    expect(screen.getByTestId('outlet')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(client.onSessionExpired).toHaveBeenCalledTimes(1);
  });

  test('asks the user to sign in again once the session expires', () => {
    const { expire } = setup();

    expire();

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Your session has expired')).toBeTruthy();
    expect(
      screen.getByText('Your current session has expired. Please, sign in and try again.'),
    ).toBeTruthy();
    // Signing in leaves the page for the login form (jsdom can not navigate, so the dialog stays).
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
