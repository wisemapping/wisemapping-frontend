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
import { fireEvent, screen, waitFor } from '@testing-library/react';

const mockUseFetchMapById = jest.fn();
jest.mock('../../../../src/classes/middleware', () => ({
  useFetchMapById: (id: number) => mockUseFetchMapById(id),
}));

import PublishDialog from '../../../../src/components/maps-page/action-dispatcher/publish-dialog';
import Client, { MapInfo } from '../../../../src/classes/client';
import { renderWithProviders } from '../../helpers/render';
import { initAppConfig } from '../helpers';

const map = (isPublic: boolean): MapInfo => ({
  id: 12,
  title: 'Public map',
  description: '',
  starred: false,
  labels: [],
  createdBy: 'ana@wisemapping.com',
  creationTime: '',
  lastModificationBy: '',
  lastModificationTime: '',
  public: isPublic,
  role: 'owner',
});

const PUBLIC_URL = 'http://localhost/c/maps/12/public';

const setup = (isPublic = false) => {
  mockUseFetchMapById.mockReturnValue({ isLoading: false, error: null, data: map(isPublic) });
  const updateMapToPublic = jest.fn<Promise<void>, [number, boolean]>(() => Promise.resolve());
  const onClose = jest.fn();
  renderWithProviders(<PublishDialog mapId={12} onClose={onClose} />, {
    client: { updateMapToPublic } as unknown as Client,
  });
  return { updateMapToPublic, onClose };
};

const publicSwitch = (): HTMLInputElement =>
  screen.getByRole('switch', { name: 'Enable public sharing' }) as HTMLInputElement;

// Whether the sharing tabs are hidden (an ancestor has display: none).
const sharingHidden = (): boolean => {
  for (
    let node: HTMLElement | null = screen.getByRole('tablist', { hidden: true });
    node;
    node = node.parentElement
  ) {
    if (node.style.display === 'none') {
      return true;
    }
  }
  return false;
};

describe('PublishDialog', () => {
  const writeText = jest.fn<Promise<void>, [string]>();

  beforeAll(async () => {
    await initAppConfig();
  });

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  test('a private map hides the sharing links until it is published', () => {
    setup(false);

    expect(publicSwitch().checked).toBe(false);
    expect(sharingHidden()).toBe(true);
  });

  test('publishing the map calls the server at once and shows the public URL', async () => {
    const { updateMapToPublic, onClose } = setup(false);

    fireEvent.click(publicSwitch());

    await waitFor(() => expect(updateMapToPublic).toHaveBeenCalledWith(12, true));
    await waitFor(() => expect(publicSwitch().checked).toBe(true));
    expect(sharingHidden()).toBe(false);
    expect(screen.getByDisplayValue(PUBLIC_URL)).toBeTruthy();
    // The dialog stays open so the link can be copied.
    expect(onClose).not.toHaveBeenCalled();
  });

  test('unpublishing a public map', async () => {
    const { updateMapToPublic } = setup(true);
    expect(publicSwitch().checked).toBe(true);

    fireEvent.click(publicSwitch());

    await waitFor(() => expect(updateMapToPublic).toHaveBeenCalledWith(12, false));
  });

  test('a failed update shows the error and puts the switch back', async () => {
    const { updateMapToPublic } = setup(false);
    updateMapToPublic.mockRejectedValue({ msg: 'Map can not be published' });

    fireEvent.click(publicSwitch());

    expect(await screen.findByText('Map can not be published')).toBeTruthy();
    await waitFor(() => expect(publicSwitch().checked).toBe(false));
  });

  test('clicking the public URL copies it to the clipboard', async () => {
    setup(true);

    fireEvent.click(screen.getByDisplayValue(PUBLIC_URL));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(PUBLIC_URL));
    expect(await screen.findByText('Copied to clipboard!')).toBeTruthy();
  });

  test('the embedded tab copies an iframe pointing at the embed page', async () => {
    setup(true);

    fireEvent.click(screen.getByRole('tab', { name: 'Embedded' }));
    const textarea = (
      await screen.findByText('Click the code below to copy it to your clipboard:')
    ).parentElement!.querySelector('textarea:not([aria-hidden])') as HTMLTextAreaElement;
    expect(textarea.value).toContain('src="http://localhost/c/maps/12/embed?zoom=1.0"');

    fireEvent.click(textarea);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(textarea.value));
  });

  test('falls back to a copy command when the clipboard API refuses', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    const execCommand = jest.fn(() => true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
    setup(true);

    fireEvent.click(screen.getByDisplayValue(PUBLIC_URL));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
    expect(await screen.findByText('Copied to clipboard!')).toBeTruthy();
    // The temporary textarea is removed again.
    expect(document.body.querySelectorAll('body > textarea')).toHaveLength(0);
  });

  test('while the map is loading it is shown as private', () => {
    mockUseFetchMapById.mockReturnValue({ isLoading: true, error: null, data: undefined });
    renderWithProviders(<PublishDialog mapId={12} onClose={jest.fn()} />, {
      client: {} as Client,
    });

    expect(publicSwitch().checked).toBe(false);
    expect(sharingHidden()).toBe(true);
  });

  test('close button closes the dialog', () => {
    const { onClose } = setup(false);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
