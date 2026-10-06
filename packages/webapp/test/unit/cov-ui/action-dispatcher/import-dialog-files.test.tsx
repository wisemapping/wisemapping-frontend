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
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

type FakeImporter = { import: (title: string, description?: string) => Promise<string> };
const mockCreateImporter = jest.fn<FakeImporter, [string | undefined, unknown]>();
jest.mock('@wisemapping/editor', () => ({
  ImportError: class ImportError extends Error {},
  TextImporterFactory: {
    create: (type: string | undefined, content: unknown) => mockCreateImporter(type, content),
  },
}));

import { ImportError } from '@wisemapping/editor';
import ImportDialog from '../../../../src/components/maps-page/action-dispatcher/import-dialog';
import Client from '../../../../src/classes/client';
import { renderWithProviders } from '../../helpers/render';

const selectFile = (...files: File[]): void => {
  const input = document.getElementById('contained-button-file') as HTMLInputElement;
  files.forEach((file) => fireEvent.change(input, { target: { files: [file] } }));
};

const setup = () => {
  const importMap = jest.fn<Promise<number>, [unknown]>(() => Promise.resolve(77));
  const onClose = jest.fn();
  renderWithProviders(<ImportDialog onClose={onClose} />, {
    client: { importMap } as unknown as Client,
  });
  return { importMap, onClose };
};

const nameInput = (): HTMLInputElement =>
  screen.getByRole('textbox', { name: /Name/ }) as HTMLInputElement;

const submit = (): void => {
  fireEvent.submit(screen.getByRole('button', { name: 'Create' }).closest('form')!);
};

describe('ImportDialog files', () => {
  beforeEach(() => {
    mockCreateImporter.mockReset();
    mockCreateImporter.mockImplementation(() => ({
      import: (title: string) => Promise.resolve(`<map name="${title}"/>`),
    }));
  });

  test('imports a WiseMapping file as XML, named after the file', async () => {
    const { importMap } = setup();

    selectFile(new File(['<map/>'], 'Plan.wxml', { type: 'text/xml' }));
    await waitFor(() => expect(nameInput().value).toBe('Plan'));
    await waitFor(() => expect(mockCreateImporter).toHaveBeenCalledWith('wxml', '<map/>'));
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    fireEvent.change(screen.getByRole('textbox', { name: /Description/ }), {
      target: { value: 'imported' },
    });
    submit();

    await waitFor(() =>
      expect(importMap).toHaveBeenCalledWith({
        title: 'Plan',
        description: 'imported',
        contentType: 'application/xml',
        content: '<map name="Plan"/>',
      }),
    );
  });

  test('an XMind file is read as binary and sent as an XMind workbook', async () => {
    const { importMap } = setup();

    selectFile(new File([new Uint8Array([80, 75, 3, 4])], 'Board.xmind'));
    await waitFor(() => expect(mockCreateImporter).toHaveBeenCalled());
    const [type, content] = mockCreateImporter.mock.calls[0];
    expect(type).toBe('xmind');
    expect(content).toBeInstanceOf(ArrayBuffer);
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    submit();

    await waitFor(() => expect(importMap).toHaveBeenCalled());
    expect(importMap.mock.calls[0][0]).toMatchObject({
      title: 'Board',
      contentType: 'application/vnd.xmind.workbook',
    });
  });

  test('a file the importer rejects shows why and is not saved', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateImporter.mockImplementation(() => ({
      import: () => Promise.reject(new ImportError('the map has no central topic')),
    }));
    const { importMap } = setup();

    selectFile(new File(['<map/>'], 'Broken.mm'));

    expect(await screen.findByText('Import error the map has no central topic')).toBeTruthy();
    // An ImportError is expected: it is not logged as unexpected.
    expect(consoleError).not.toHaveBeenCalled();
    submit();
    expect(importMap).not.toHaveBeenCalled();
  });

  test('an unexpected importer failure is shown and logged', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateImporter.mockImplementation(() => {
      throw new Error('parser crashed');
    });
    setup();

    selectFile(new File(['<opml/>'], 'Outline.opml'));

    expect(await screen.findByText('Import error parser crashed')).toBeTruthy();
    expect(consoleError).toHaveBeenCalledWith(
      'Unexpected error importing the map:',
      expect.any(Error),
    );
  });

  test('a rejection that is not an Error is shown as text', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateImporter.mockImplementation(() => ({
      import: () => Promise.reject('bad zip'),
    }));
    setup();

    selectFile(new File(['x'], 'Project.mmap'));

    expect(await screen.findByText('Import error bad zip')).toBeTruthy();
  });

  test('only the last picked file is imported', async () => {
    const { importMap } = setup();

    selectFile(new File(['<first/>'], 'First.wxml'), new File(['<second/>'], 'Second.wxml'));

    await waitFor(() => expect(nameInput().value).toBe('Second'));
    await waitFor(() => expect(mockCreateImporter).toHaveBeenCalledTimes(1));
    expect(mockCreateImporter).toHaveBeenCalledWith('wxml', '<second/>');
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    submit();
    await waitFor(() => expect(importMap).toHaveBeenCalled());
    expect(importMap.mock.calls[0][0]).toMatchObject({ content: '<map name="Second"/>' });
  });

  test('a cancelled picker changes nothing', () => {
    setup();
    const input = document.getElementById('contained-button-file') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(mockCreateImporter).not.toHaveBeenCalled();
    expect(nameInput().value).toBe('');
  });

  test('shows a server error when the import is refused', async () => {
    const { importMap } = setup();
    importMap.mockRejectedValue({ msg: 'Map is too big' });

    selectFile(new File(['<map/>'], 'Plan.wxml'));
    await waitFor(() => expect(mockCreateImporter).toHaveBeenCalled());
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    submit();

    expect(await screen.findByText('Map is too big')).toBeTruthy();
  });

  test('cancel closes the dialog', () => {
    const { onClose, importMap } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(importMap).not.toHaveBeenCalled();
  });
});
