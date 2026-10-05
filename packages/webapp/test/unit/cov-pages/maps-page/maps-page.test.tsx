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

// The list, the dialogs and the header menus have their own suites: stand-ins
// expose what the page hands them.
jest.mock('../../../../src/components/maps-page/maps-list', () => ({
  MapsList: ({ filter }: { filter: { type: string; label?: { title: string } } }) => (
    <div data-testid="maps-list">
      {filter.type}
      {filter.label ? `:${filter.label.title}` : ''}
    </div>
  ),
}));

jest.mock('../../../../src/components/maps-page/action-dispatcher', () => ({
  __esModule: true,
  default: ({ action, onClose }: { action?: string; onClose: () => void }) =>
    action ? (
      <div data-testid="dispatcher">
        {action}
        <button onClick={onClose}>close-dispatcher</button>
      </div>
    ) : null,
}));

jest.mock('../../../../src/components/maps-page/account-menu', () => ({
  __esModule: true,
  default: () => <span>account-menu</span>,
}));
jest.mock('../../../../src/components/maps-page/help-menu', () => ({
  __esModule: true,
  default: () => <span>help-menu</span>,
}));
jest.mock('../../../../src/components/maps-page/language-menu', () => ({
  __esModule: true,
  default: () => <span>language-menu</span>,
}));
jest.mock('../../../../src/components/common/theme-toggle-button', () => ({
  __esModule: true,
  default: () => <span>theme-toggle</span>,
}));
jest.mock('../../../../src/components/seo', () => ({
  SEOHead: () => null,
}));
// DrawerNav reads the colour mode for its logo; the real hook needs AppThemeProvider.
jest.mock('../../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({ mode: 'light' }),
}));

import MapsPage from '../../../../src/components/maps-page';
import { Label } from '../../../../src/classes/client';
import { renderWithWrapper } from '../providers';

const research: Label = { id: 7, title: 'Research', color: '#ff0000' };
const travel: Label = { id: 8, title: 'Travel', color: '' };

const buildClient = () => ({
  fetchLabels: jest.fn().mockResolvedValue([research, travel]),
  fetchAccountInfo: jest.fn().mockResolvedValue({
    firstname: 'Ada',
    lastname: 'Lovelace',
    email: 'ada@example.com',
  }),
  deleteLabel: jest.fn().mockResolvedValue(undefined),
  fetchAllMaps: jest.fn().mockResolvedValue([]),
});

const renderPage = (client = buildClient()) => {
  const utils = renderWithWrapper(<MapsPage />, { client });
  return { ...utils, client };
};

const listFilter = (): string => screen.getByTestId('maps-list').textContent ?? '';

/** The permanent (desktop) drawer: the temporary one is kept mounted but hidden. */
const desktopNav = (): HTMLElement => screen.getAllByRole('navigation')[0];

describe('MapsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    // The account is only fetched on private pages, which "/" is not.
    window.history.pushState({}, '', '/c/maps/');
    // jsdom does not implement scrolling; the page scrolls to the top on mount.
    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  /** The label delete buttons are only shown while the drawer is expanded. */
  const openDesktopDrawer = () => localStorage.setItem('desktopDrawerOpen', 'true');

  test('titles the page, scrolls to the top and starts on the "All" filter', async () => {
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderPage();

    expect(document.title).toBe('My Maps | WiseMapping');
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    expect(listFilter()).toBe('all');
    expect(screen.getByRole('region', { name: 'Maps list' })).toBeTruthy();
    expect(screen.getByText('account-menu')).toBeTruthy();
  });

  test('the drawer lists the fixed filters followed by the account labels', async () => {
    renderPage();

    const nav = desktopNav();
    for (const name of ['All', 'My Maps', 'Starred', 'Shared with me', 'Public']) {
      expect(within(nav).getByText(name)).toBeTruthy();
    }
    expect(await within(nav).findByText('Research')).toBeTruthy();
    expect(within(nav).getByText('Travel')).toBeTruthy();
  });

  test('choosing a drawer entry filters the list and reloads the maps', async () => {
    const { client, queryClient } = renderPage();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    fireEvent.click(within(desktopNav()).getByText('Shared with me'));
    expect(listFilter()).toBe('shared');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });

    fireEvent.click(await within(desktopNav()).findByText('Research'));
    expect(listFilter()).toBe('label:Research');
    expect(client.fetchLabels).toHaveBeenCalled();
  });

  test('"New map" and "Import" open the matching dialog, which can be closed', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('create'));
    expect(screen.getByTestId('dispatcher').textContent).toContain('create');
    fireEvent.click(screen.getByText('close-dispatcher'));
    expect(screen.queryByTestId('dispatcher')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Import from other tools' }));
    expect(screen.getByTestId('dispatcher').textContent).toContain('import');
  });

  test('the AI Copilot dialog opens the copilot in a new tab', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Start a mindmap with ChatGPT-powered AI Copilot' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'ChatGPT-powered Mindmap Copilot' });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Open Copilot' }));

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://chatgpt.com/g/'),
      '_blank',
      'noopener,noreferrer',
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'ChatGPT-powered Mindmap Copilot' })).toBeNull(),
    );
  });

  test('the AI Copilot dialog can be dismissed without opening anything', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Start a mindmap with ChatGPT-powered AI Copilot' }),
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('the desktop drawer toggle remembers its state', () => {
    renderPage();

    const toggle = document.getElementById('open-desktop-drawer') as HTMLElement;
    expect(within(toggle).getByTestId('NavigateNextIcon')).toBeTruthy();
    // Collapsed: the account box is not shown.
    expect(screen.queryByText('ada@example.com')).toBeNull();

    fireEvent.click(toggle);
    expect(localStorage.getItem('desktopDrawerOpen')).toBe('true');
    expect(within(toggle).getByTestId('NavigateBeforeIcon')).toBeTruthy();

    fireEvent.click(toggle);
    expect(localStorage.getItem('desktopDrawerOpen')).toBeNull();
  });

  test('starts with the desktop drawer open when it was left open', async () => {
    localStorage.setItem('desktopDrawerOpen', 'true');
    renderPage();

    const toggle = document.getElementById('open-desktop-drawer') as HTMLElement;
    expect(within(toggle).getByTestId('NavigateBeforeIcon')).toBeTruthy();
    expect((await screen.findAllByText('ada@example.com')).length).toBeGreaterThan(0);
  });

  test('the mobile drawer opens and closes once a filter is picked', async () => {
    renderPage();

    const mobileDrawer = (): HTMLElement =>
      document.querySelector('.MuiDrawer-modal') as HTMLElement;
    expect(mobileDrawer().classList.contains('MuiModal-hidden')).toBe(true);

    fireEvent.click(document.getElementById('open-main-drawer') as HTMLElement);
    expect(mobileDrawer().classList.contains('MuiModal-hidden')).toBe(false);
    // The open temporary drawer also expands its entries (the account box is shown).
    expect(await within(mobileDrawer()).findByText('ada@example.com')).toBeTruthy();

    fireEvent.click(within(mobileDrawer()).getByText('Starred'));
    expect(listFilter()).toBe('starred');
    await waitFor(() => expect(mobileDrawer().classList.contains('MuiModal-hidden')).toBe(true));
  });

  test('deleting a label asks first, then deletes it and reloads labels and maps', async () => {
    openDesktopDrawer();
    const { client, queryClient } = renderPage();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    await within(desktopNav()).findByText('Research');

    fireEvent.click(within(desktopNav()).getAllByRole('button', { name: 'Delete' })[0]);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Research/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(client.deleteLabel).toHaveBeenCalledWith(7));
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['labels'] }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['maps'] });
  });

  test('cancelling the label deletion keeps the label', async () => {
    openDesktopDrawer();
    const { client } = renderPage();
    await within(desktopNav()).findByText('Research');

    fireEvent.click(within(desktopNav()).getAllByRole('button', { name: 'Delete' })[1]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Travel/)).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(client.deleteLabel).not.toHaveBeenCalled();
  });

  test('a failed label deletion is logged', async () => {
    openDesktopDrawer();
    const client = buildClient();
    client.deleteLabel.mockRejectedValue('server down');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPage(client);
    await within(desktopNav()).findByText('Research');

    fireEvent.click(within(desktopNav()).getAllByRole('button', { name: 'Delete' })[0]);
    fireEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }),
    );

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Unexpected error server down'));
  });
});
