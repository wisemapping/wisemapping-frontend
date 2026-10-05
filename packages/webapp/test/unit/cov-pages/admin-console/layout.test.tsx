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
import { screen, within } from '@testing-library/react';

// react-router is ESM-only (see jest.config.js): stand in for the pieces the
// admin shell uses, recording where it links and redirects to.
const mockNavigateElement = jest.fn();
jest.mock('react-router', () => {
  const ReactActual = jest.requireActual<typeof React>('react');
  return {
    useLocation: () => ({ pathname: window.location.pathname }),
    Outlet: () => ReactActual.createElement('div', null, 'admin-outlet'),
    NavLink: ReactActual.forwardRef<HTMLAnchorElement, { to: string; children?: React.ReactNode }>(
      ({ to, children, ...rest }, ref) =>
        ReactActual.createElement('a', { ...rest, href: to, ref }, children),
    ),
    Navigate: (props: { to: string; replace?: boolean }) => {
      mockNavigateElement(props);
      return null;
    },
  };
});

import AdminLayout from '../../../../src/components/admin-console/layout';
import AdminConsole from '../../../../src/components/admin-console';
import { renderWithWrapper } from '../providers';

const renderLayout = (fetchAccountInfo: jest.Mock) =>
  renderWithWrapper(<AdminLayout />, { client: { fetchAccountInfo } });

describe('AdminConsole', () => {
  test('/c/admin redirects to the accounts page', () => {
    renderWithWrapper(<AdminConsole />);
    expect(mockNavigateElement).toHaveBeenCalledWith({ to: '/c/admin/accounts', replace: true });
  });
});

describe('AdminLayout', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/c/admin/maps');
  });

  test('shows a spinner while the account loads', () => {
    renderLayout(jest.fn(() => new Promise(() => undefined)));

    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('admin-outlet')).toBeNull();
    expect(document.title).toBe('Admin Console | WiseMapping');
  });

  test('denies access to a non-admin account', async () => {
    renderLayout(jest.fn().mockResolvedValue({ email: 'u@example.com', isAdmin: false }));

    expect(await screen.findByText('Access denied. Admin permissions required.')).toBeTruthy();
    expect(screen.queryByText('admin-outlet')).toBeNull();
  });

  test('shows the account error instead of the page', async () => {
    renderLayout(jest.fn().mockRejectedValue({ msg: 'Session expired' }));

    expect(await screen.findByText('Session expired')).toBeTruthy();
    expect(screen.queryByText('admin-outlet')).toBeNull();
  });

  test('falls back to a generic message for an account error without text', async () => {
    renderLayout(jest.fn().mockRejectedValue({}));

    expect(await screen.findByText('Failed to load account information')).toBeTruthy();
  });

  test('an admin gets the console with its menu and the current page', async () => {
    renderLayout(jest.fn().mockResolvedValue({ email: 'a@example.com', isAdmin: true }));

    expect(await screen.findByText('admin-outlet')).toBeTruthy();
    expect(screen.getAllByText('Admin Console').length).toBeGreaterThan(0);

    const links = screen.getAllByRole('link');
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Accounts', '/c/admin/accounts'],
      ['Maps', '/c/admin/maps'],
      ['System', '/c/admin/system'],
    ]);
    // The entry for the current path is the selected one.
    expect(links[1].className).toContain('Mui-selected');
    expect(links[0].className).not.toContain('Mui-selected');
    expect(within(links[1]).getByText('Maps')).toBeTruthy();
  });
});
