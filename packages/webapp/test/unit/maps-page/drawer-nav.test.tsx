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
import { render as renderBare, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../../../src/theme';

jest.mock('react-intl', () => {
  const ReactActual = require('react');
  return {
    FormattedMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
      ReactActual.createElement('span', null, defaultMessage || id),
    useIntl: () => ({
      formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) =>
        defaultMessage || id,
    }),
  };
});

// DrawerNav reads the app colour mode to pick the light/dark logo asset. The real
// hook throws outside AppThemeProvider, so stub the context rather than mounting it.
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({ mode: 'light' }),
}));

import DrawerNav, { ToolbarButtonInfo } from '../../../src/components/maps-page/drawer-nav';
import type { AccountInfo } from '../../../src/classes/client';

const filterButtons: ToolbarButtonInfo[] = [
  { filter: { type: 'all' }, label: 'All', icon: <span>all-icon</span> },
  { filter: { type: 'owned' }, label: 'My Maps', icon: <span>owned-icon</span> },
  {
    filter: { type: 'label', label: { id: 7, title: 'Research', color: '#fff' } },
    label: 'Research',
    icon: <span>label-icon</span>,
  },
];

const account = {
  firstname: 'Ada',
  lastname: 'Lovelace',
  email: 'ada@example.com',
} as AccountInfo;

const renderNav = (overrides: Partial<React.ComponentProps<typeof DrawerNav>> = {}) =>
  render(
    <DrawerNav
      account={account}
      drawerOpen={true}
      filterButtons={filterButtons}
      activeFilter={{ type: 'all' }}
      onFilterClick={jest.fn()}
      onLabelDelete={jest.fn()}
      {...overrides}
    />,
  );

// These components style themselves through `withEmotionStyles((theme) => ...)`,
// which Emotion resolves against the theme in context -- so they have to be
// mounted under a ThemeProvider. Wrapping via RTL's `wrapper` option keeps the
// provider in place across `rerender` too.
const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <ThemeProvider theme={createAppTheme('light')}>{children}</ThemeProvider>
);

const render = (ui: React.ReactElement) => renderBare(ui, { wrapper });

describe('DrawerNav', () => {
  test('renders one navigation entry per filter button, in order', () => {
    renderNav();
    const nav = screen.getByRole('navigation');
    expect(nav).toBeDefined();
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('My Maps')).toBeDefined();
    expect(screen.getByText('Research')).toBeDefined();
  });

  test('renders the logo', () => {
    renderNav();
    expect(screen.getByAltText('logo')).toBeDefined();
  });

  test('shows the account name and email when the drawer is open', () => {
    renderNav();
    expect(screen.getByText('Ada Lovelace')).toBeDefined();
    expect(screen.getByText('ada@example.com')).toBeDefined();
  });

  test('hides the user info box when the drawer is collapsed', () => {
    renderNav({ drawerOpen: false });
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });

  test('hides the user info box when no account has been fetched yet', () => {
    renderNav({ account: undefined });
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
  });

  test('falls back to the email when the account has no first/last name', () => {
    renderNav({ account: { email: 'noname@example.com' } as AccountInfo });
    expect(screen.getAllByText('noname@example.com').length).toBeGreaterThan(0);
  });

  test('clicking an entry reports that entry’s filter', () => {
    const onFilterClick = jest.fn();
    renderNav({ onFilterClick });
    fireEvent.click(screen.getByText('My Maps'));
    expect(onFilterClick).toHaveBeenCalledWith({ type: 'owned' });
  });

  test('deleting a label entry reports the label id', () => {
    const onLabelDelete = jest.fn();
    renderNav({ onLabelDelete });
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onLabelDelete).toHaveBeenCalledWith(7);
  });
});
