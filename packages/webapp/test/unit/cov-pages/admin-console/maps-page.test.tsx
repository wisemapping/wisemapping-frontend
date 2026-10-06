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
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import MapsManagement from '../../../../src/components/admin-console/maps-page';
import AppConfig from '../../../../src/classes/app-config';
import type { AdminClientInterface } from '../../../../src/classes/client/admin-client';
import { renderWithWrapper } from '../providers';
import { BURST_TEXT, typeInBurst } from '../../burst-typing';
import { buildAdminClient, makeAdminMap, makeUser, MockAdminClient, page } from './fixtures';

const plainMap = makeAdminMap({
  id: 11,
  title: 'Plain map',
  description: '',
  createdBy: 'owner@example.com',
  createdById: 50,
  collaboratorCount: 3,
});
const busyMap = makeAdminMap({
  id: 12,
  title: 'Busy map',
  public: true,
  starred: true,
  isLocked: true,
  isLockedBy: 'eve',
  spam: true,
  spamType: 'LINKS',
  isCreatorSuspended: true,
  createdBy: 'spammer@example.com',
  createdById: 60,
});

let client: MockAdminClient;

const setup = ({ maps = [plainMap, busyMap], totalPages = 1 } = {}) => {
  client.getAdminMaps.mockResolvedValue(page(maps, totalPages));
  return renderWithWrapper(<MapsManagement />);
};

const lastParams = () => client.getAdminMaps.mock.calls.at(-1)?.[0];

const rowOf = (title: string): HTMLElement => screen.getByText(title).closest('tr') as HTMLElement;

const waitForRows = () => screen.findByText('Plain map');

const chooseOption = async (combobox: HTMLElement, option: string) => {
  fireEvent.mouseDown(combobox);
  const listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByRole('option', { name: option }));
};

/** The four filter selects, in page order: public, locked, spam, date range. */
const filterSelects = () => screen.getAllByRole('combobox');

const dialogClosed = () => waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

describe('MapsManagement', () => {
  beforeEach(() => {
    client = buildAdminClient();
    jest
      .spyOn(AppConfig, 'getAdminClient')
      .mockReturnValue(client as unknown as AdminClientInterface);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('lists the maps of the last month, sorted by title', async () => {
    setup();
    await waitForRows();

    expect(lastParams()).toEqual({
      page: 0,
      pageSize: 50,
      search: undefined,
      sortBy: 'title',
      sortOrder: 'asc',
      filterPublic: undefined,
      filterLocked: undefined,
      filterSpam: undefined,
      dateFilter: '1',
    });
    expect(screen.getByText('Maps Management')).toBeTruthy();

    const plain = rowOf('Plain map');
    expect(within(plain).getByRole('link', { name: '#11' })).toHaveProperty(
      'href',
      expect.stringContaining('/c/maps/11/public'),
    );
    expect(within(plain).getByText('No description')).toBeTruthy();
    expect(within(plain).getByText('3')).toBeTruthy();
    expect(within(plain).getByText('Private')).toBeTruthy();
    expect(within(plain).getByText('Unlocked')).toBeTruthy();
    expect(within(plain).getByText('Clean')).toBeTruthy();
    expect(within(plain).getByRole('button', { name: 'Suspend user' })).toBeTruthy();

    const busy = rowOf('Busy map');
    expect(within(busy).getByText('Public')).toBeTruthy();
    expect(within(busy).getByText('Locked by eve')).toBeTruthy();
    expect(within(busy).getByLabelText('Currently being edited by eve')).toBeTruthy();
    expect(within(busy).getByText('Suspended')).toBeTruthy();
    expect(within(busy).getByText('Spam (LINKS)')).toBeTruthy();
    expect(within(busy).getByTestId('StarIcon')).toBeTruthy();
    // A suspended creator can not be suspended again.
    expect(within(busy).queryByRole('button', { name: 'Suspend user' })).toBeNull();
  });

  test('says so when no map matches', async () => {
    setup({ maps: [] });
    expect(await screen.findByText('No maps found')).toBeTruthy();
  });

  test('shows the load error after the retry fails', async () => {
    jest.useFakeTimers();
    client.getAdminMaps.mockRejectedValue(new Error('Server unreachable'));
    renderWithWrapper(<MapsManagement />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });
    expect(screen.getByText('Failed to load maps: Server unreachable')).toBeTruthy();
  });

  test('an error without a message reads "Unknown error"', async () => {
    jest.useFakeTimers();
    client.getAdminMaps.mockRejectedValue({});
    renderWithWrapper(<MapsManagement />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });
    expect(screen.getByText('Failed to load maps: Unknown error')).toBeTruthy();
  });

  test.each([
    ['#123', 'Searching by Map ID'],
    ['owner@example.com', 'Searching by Creator Email'],
    ['roadmap', 'Searching in titles and descriptions'],
    ['#abc', 'Searching in titles and descriptions'],
  ])('the search box explains how "%s" is matched', async (term, hint) => {
    setup();
    await waitForRows();

    fireEvent.change(screen.getByPlaceholderText(/Search maps/), { target: { value: term } });
    expect(screen.getByText(new RegExp(hint))).toBeTruthy();
  });

  test('the search is sent once the user stops typing', async () => {
    setup();
    await waitForRows();
    jest.useFakeTimers();

    fireEvent.change(screen.getByPlaceholderText(/Search maps/), { target: { value: '#11' } });
    expect(lastParams()?.search).toBeUndefined();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(500);
    });
    expect(lastParams()?.search).toBe('#11');
  });

  test('the search box takes 200 characters typed in one burst, as Cypress types them', async () => {
    setup();
    await waitForRows();
    const search = screen.getByPlaceholderText(/Search maps/) as HTMLInputElement;

    expect(await typeInBurst(search)).toEqual([]);

    await waitFor(() => expect(lastParams()?.search).toBe(BURST_TEXT), { timeout: 2000 });
  });

  test('the filters are sent to the server', async () => {
    setup();
    await waitForRows();

    await chooseOption(filterSelects()[0], 'Public');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterPublic: true }));
    await waitForRows();
    await chooseOption(filterSelects()[0], 'Private');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterPublic: false }));

    await waitForRows();
    await chooseOption(filterSelects()[1], 'Locked');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterLocked: true }));
    await waitForRows();
    await chooseOption(filterSelects()[1], 'Unlocked');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterLocked: false }));

    await waitForRows();
    await chooseOption(filterSelects()[2], 'Spam');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterSpam: true }));
    await waitForRows();
    await chooseOption(filterSelects()[2], 'Not Spam');
    await waitFor(() => expect(lastParams()).toMatchObject({ filterSpam: false }));

    await waitForRows();
    await chooseOption(screen.getByRole('combobox', { name: 'Date Range' }), 'All Time');
    await waitFor(() => expect(lastParams()).toMatchObject({ dateFilter: 'all' }));
  });

  test('the sortable headers change the requested order', async () => {
    setup();
    await waitForRows();

    fireEvent.click(screen.getByRole('button', { name: 'Title' }));
    await waitFor(() => expect(lastParams()).toMatchObject({ sortBy: 'title', sortOrder: 'desc' }));

    for (const [header, field] of [
      ['Map ID', 'id'],
      ['Created', 'creationTime'],
      ['Modified', 'lastModificationTime'],
    ]) {
      fireEvent.click(screen.getByRole('button', { name: header }));
      await waitFor(() => expect(lastParams()).toMatchObject({ sortBy: field, sortOrder: 'asc' }));
    }
  });

  test('the pagination requests the chosen page; "Refresh" reloads', async () => {
    setup({ totalPages: 2 });
    await waitForRows();

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    await waitFor(() => expect(lastParams()).toMatchObject({ page: 1 }));

    const calls = client.getAdminMaps.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(client.getAdminMaps.mock.calls.length).toBe(calls + 1));
  });

  describe('editing', () => {
    test('saves the edited title, description, visibility and lock', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Edit' }));
      const dialog = await screen.findByRole('dialog', { name: 'Edit Map' });
      expect((within(dialog).getByLabelText('Title') as HTMLInputElement).value).toBe('Plain map');

      fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'Renamed' } });
      fireEvent.change(within(dialog).getByLabelText('Description'), {
        target: { value: 'Now described' },
      });
      const [visibility, lock] = within(dialog).getAllByRole('combobox');
      await chooseOption(visibility, 'Public');
      await chooseOption(lock, 'Locked');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(client.updateAdminMap).toHaveBeenCalledWith(11, {
          id: 11,
          title: 'Renamed',
          description: 'Now described',
          public: true,
          isLocked: true,
        }),
      );
      await dialogClosed();
    });

    test('its fields take 200 characters typed in one burst, as Cypress types them', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Edit' }));
      const dialog = await screen.findByRole('dialog', { name: 'Edit Map' });
      const field = (label: string) => within(dialog).getByLabelText(label) as HTMLInputElement;

      expect(await typeInBurst(field('Title'))).toEqual([]);
      expect(await typeInBurst(field('Description'))).toEqual([]);
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(client.updateAdminMap).toHaveBeenCalledWith(11, {
          id: 11,
          title: `Plain map${BURST_TEXT}`,
          description: BURST_TEXT,
          public: false,
          isLocked: false,
        }),
      );
      await dialogClosed();
      // jsdom lays out the multiline description slowly: 200 keys there take a few seconds.
    }, 20000);

    test('refuses an empty title and can be cancelled', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Edit' }));
      const dialog = await screen.findByRole('dialog', { name: 'Edit Map' });
      fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: '  ' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(within(dialog).getByText('Title is required')).toBeTruthy();
      expect(client.updateAdminMap).not.toHaveBeenCalled();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });

    test('a failed update is reported in the dialog', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.updateAdminMap.mockRejectedValue(new Error('nope'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Busy map')).getByRole('button', { name: 'Edit' }));
      const dialog = await screen.findByRole('dialog', { name: 'Edit Map' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(
        await within(dialog).findByText('Failed to update map. Please try again.'),
      ).toBeTruthy();
    });
  });

  describe('XML viewer', () => {
    test('shows the map XML indented and copies it', async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      client.getAdminMapXml.mockResolvedValue('<map><topic central="true"/><topic/></map>');
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'View XML' }));
      const dialog = await screen.findByRole('dialog', { name: /Map XML Content/ });
      expect(within(dialog).getByText('Plain map (ID: 11)')).toBeTruthy();

      const expected = '<map>\n  <topic central="true"/>\n  <topic/>\n</map>';
      await waitFor(() =>
        expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toBe(expected),
      );

      fireEvent.click(within(dialog).getByRole('button', { name: 'Copy Formatted XML' }));
      expect(writeText).toHaveBeenCalledWith(expected);

      fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
      await dialogClosed();
    });

    test('whitespace-only XML shows an empty viewer', async () => {
      client.getAdminMapXml.mockResolvedValue('   ');
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'View XML' }));
      const dialog = await screen.findByRole('dialog', { name: /Map XML Content/ });

      await waitFor(() =>
        expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toBe(''),
      );
    });

    test('shows the load progress, then the error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      let reject: (error: unknown) => void = () => undefined;
      client.getAdminMapXml.mockReturnValue(
        new Promise((_resolve, rej) => {
          reject = rej;
        }),
      );
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'View XML' }));
      const dialog = await screen.findByRole('dialog', { name: /Map XML Content/ });
      expect(within(dialog).getByText('Loading XML content...')).toBeTruthy();
      expect(
        (within(dialog).getByRole('button', { name: 'Copy Formatted XML' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);

      await act(async () => reject(new Error('forbidden')));
      await waitFor(() =>
        expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toBe(
          'Error loading XML: forbidden',
        ),
      );
    });

    test('an error without a message reads "Unknown error"', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.getAdminMapXml.mockRejectedValue({});
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'View XML' }));
      const dialog = await screen.findByRole('dialog', { name: /Map XML Content/ });
      await waitFor(() =>
        expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toBe(
          'Error loading XML: Unknown error',
        ),
      );
    });

    // formatXml used to raise the indent for a whole element on one line such as
    // `<text>Idea</text>` (and for the XML declaration), so every following line drifted one
    // level to the right.
    test('keeps the indentation of an element that holds inline text', async () => {
      client.getAdminMapXml.mockResolvedValue(
        '<?xml version="1.0"?><topic><text>Idea</text><!-- c --></topic>',
      );
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'View XML' }));
      const dialog = await screen.findByRole('dialog', { name: /Map XML Content/ });

      await waitFor(() =>
        expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toBe(
          '<?xml version="1.0"?>\n<topic>\n  <text>Idea</text>\n  <!-- c -->\n</topic>',
        ),
      );
    });
  });

  describe('row actions', () => {
    test('marking as spam asks first and then updates the map', async () => {
      const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'mark-spam' }));
      expect(confirm).toHaveBeenCalledWith('Are you sure you want to mark as spam this map?');
      await waitFor(() =>
        expect(client.updateMapSpamStatus).toHaveBeenCalledWith(11, { spam: true }),
      );

      fireEvent.click(within(rowOf('Busy map')).getByRole('button', { name: 'mark-not-spam' }));
      expect(confirm).toHaveBeenCalledWith('Are you sure you want to mark as not spam this map?');
      await waitFor(() =>
        expect(client.updateMapSpamStatus).toHaveBeenCalledWith(12, { spam: false }),
      );
    });

    test('declining the spam confirmation changes nothing; a failure is logged', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
      client.updateMapSpamStatus.mockRejectedValue(new Error('denied'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'mark-spam' }));
      expect(client.updateMapSpamStatus).not.toHaveBeenCalled();

      confirm.mockReturnValue(true);
      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'mark-spam' }));
      await waitFor(() =>
        expect(errorSpy).toHaveBeenCalledWith('Failed to update spam status:', expect.any(Error)),
      );
    });

    test('deleting asks first', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Delete' }));
      expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete the map "Plain map"?');
      expect(client.deleteAdminMap).not.toHaveBeenCalled();

      confirm.mockReturnValue(true);
      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Delete' }));
      await waitFor(() => expect(client.deleteAdminMap).toHaveBeenCalledWith(11));

      client.deleteAdminMap.mockRejectedValue(new Error('denied'));
      fireEvent.click(within(rowOf('Busy map')).getByRole('button', { name: 'Delete' }));
      await waitFor(() =>
        expect(errorSpy).toHaveBeenCalledWith('Failed to delete map:', expect.any(Error)),
      );
    });

    test('suspending the creator is a manual-review suspension', async () => {
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Suspend user' }));
      const dialog = await screen.findByRole('dialog', { name: 'Suspend User Account' });
      expect(within(dialog).getByText(/"owner@example.com" \(ID: 50\)/)).toBeTruthy();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Suspend User' }));
      await waitFor(() =>
        expect(client.updateUserSuspension).toHaveBeenCalledWith(50, {
          suspended: true,
          suspensionReason: 'MANUAL_REVIEW',
        }),
      );
      await dialogClosed();
      // Not opened from an owner dialog: no owner to reload.
      expect(client.getAdminUser).not.toHaveBeenCalled();
    });

    test('the suspension can be cancelled, and a failure is logged', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.updateUserSuspension.mockRejectedValue(new Error('denied'));
      setup();
      await waitForRows();

      fireEvent.click(within(rowOf('Plain map')).getByRole('button', { name: 'Suspend user' }));
      const dialog = await screen.findByRole('dialog', { name: 'Suspend User Account' });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Suspend User' }));
      await waitFor(() =>
        expect(errorSpy).toHaveBeenCalledWith('Failed to suspend user:', expect.any(Error)),
      );

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      await dialogClosed();
    });
  });

  describe('owner maps dialog', () => {
    const owner = makeUser({ id: 50, email: 'owner@example.com' });
    const ownerMaps = [
      makeAdminMap({ id: 21, title: 'Owner first', public: true }),
      makeAdminMap({ id: 22, title: 'Owner second', spam: true, isCreatorSuspended: true }),
    ];

    const openOwner = async () => {
      fireEvent.click(
        within(rowOf('Plain map')).getByRole('button', { name: 'owner@example.com' }),
      );
      const dialog = await screen.findByRole('dialog', { name: /Maps owned by owner@example.com/ });
      await within(dialog).findByText('Owner first');
      return dialog;
    };

    beforeEach(() => {
      client.getAdminUser.mockResolvedValue(owner);
      client.getUserMaps.mockResolvedValue(ownerMaps);
    });

    test('loads the owner and their maps, with the page chips', async () => {
      setup();
      await waitForRows();

      const dialog = await openOwner();
      expect(client.getAdminUser).toHaveBeenCalledWith(50);
      expect(client.getUserMaps).toHaveBeenCalledWith(50);
      expect(within(dialog).getByText('User Information')).toBeTruthy();
      expect(within(dialog).getAllByText('Unlocked')).toHaveLength(2);
      expect(within(dialog).getByText('Suspended')).toBeTruthy();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
      await dialogClosed();
    });

    test('a failed load leaves the dialog empty and logs it', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.getUserMaps.mockRejectedValue(new Error('down'));
      setup();
      await waitForRows();

      fireEvent.click(
        within(rowOf('Plain map')).getByRole('button', { name: 'owner@example.com' }),
      );
      const dialog = await screen.findByRole('dialog');
      expect(await within(dialog).findByText('This user has no maps.')).toBeTruthy();
      expect(errorSpy).toHaveBeenCalledWith('Failed to load owner info/maps:', expect.any(Error));
      expect(within(dialog).getByText('Loading user...')).toBeTruthy();
    });

    test('its row actions reach the same handlers as the table', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      setup();
      await waitForRows();

      let dialog = await openOwner();
      fireEvent.click(within(dialog).getByRole('button', { name: 'mark-not-spam' }));
      await waitFor(() =>
        expect(client.updateMapSpamStatus).toHaveBeenCalledWith(22, { spam: false }),
      );
      fireEvent.click(within(dialog).getAllByRole('button', { name: 'Delete' })[0]);
      await waitFor(() => expect(client.deleteAdminMap).toHaveBeenCalledWith(21));

      fireEvent.click(within(dialog).getAllByRole('button', { name: 'Edit' })[1]);
      const edit = await screen.findByRole('dialog', { name: 'Edit Map' });
      expect((within(edit).getByLabelText('Title') as HTMLInputElement).value).toBe('Owner second');
      fireEvent.click(within(edit).getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit Map' })).toBeNull());

      dialog = screen.getByRole('dialog', { name: /Maps owned by/ });
      fireEvent.click(within(dialog).getAllByRole('button', { name: 'View XML' })[0]);
      expect(await screen.findByRole('dialog', { name: /Map XML Content/ })).toBeTruthy();
      await waitFor(() => expect(client.getAdminMapXml).toHaveBeenCalledWith(21));
    });

    test('suspending the owner from the dialog reloads the owner afterwards', async () => {
      setup();
      await waitForRows();

      const dialog = await openOwner();
      fireEvent.click(within(dialog).getByText('Active'));
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Suspend user' }));

      const suspend = await screen.findByRole('dialog', { name: 'Suspend User Account' });
      expect(within(suspend).getByText(/"owner@example.com" \(ID: 50\)/)).toBeTruthy();
      fireEvent.click(within(suspend).getByRole('button', { name: 'Suspend User' }));

      await waitFor(() => expect(client.updateUserSuspension).toHaveBeenCalled());
      await waitFor(() => expect(client.getAdminUser).toHaveBeenCalledTimes(2));
    });

    test('lifting the owner suspension reloads the owner; a failure is logged', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      client.getAdminUser.mockResolvedValue({ ...owner, isSuspended: true });
      setup();
      await waitForRows();

      const dialog = await openOwner();
      // The first "Suspended" chip is the owner's status in the info card.
      fireEvent.click(within(dialog).getAllByText('Suspended', { selector: '.MuiChip-label' })[0]);
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));

      await waitFor(() => expect(client.unsuspendAdminUser).toHaveBeenCalledWith(50));
      await waitFor(() => expect(client.getAdminUser).toHaveBeenCalledTimes(2));

      // Reloading the owner can fail too.
      client.getAdminUser.mockRejectedValue(new Error('gone'));
      client.unsuspendAdminUser.mockRejectedValueOnce(new Error('denied'));
      fireEvent.click(within(dialog).getAllByText('Suspended', { selector: '.MuiChip-label' })[0]);
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));
      await waitFor(() =>
        expect(errorSpy).toHaveBeenCalledWith('Failed to unsuspend user:', expect.any(Error)),
      );

      fireEvent.click(within(dialog).getAllByText('Suspended', { selector: '.MuiChip-label' })[0]);
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));
      await waitFor(() =>
        expect(errorSpy).toHaveBeenCalledWith('Failed to fetch owner info:', expect.any(Error)),
      );
    });
  });
});
