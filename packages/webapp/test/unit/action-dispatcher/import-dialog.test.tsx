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

// The editor bundle pulls in the whole canvas. The dialog only needs the importer factory, which
// rejects an unknown type with "Unsupported type", as TextImporterFactory does.
const unsupportedType = (type: string | undefined) => {
  throw new Error(`Unsupported type ${type}`);
};
const mockCreateImporter = jest.fn<
  { import: (title: string, description?: string) => Promise<string> },
  [string | undefined]
>(unsupportedType);
jest.mock('@wisemapping/editor', () => ({
  ImportError: class ImportError extends Error {},
  TextImporterFactory: { create: (type: string | undefined) => mockCreateImporter(type) },
}));

import ImportDialog from '../../../src/components/maps-page/action-dispatcher/import-dialog';
import Client from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';

const mockImportMap = jest.fn<Promise<number>, [unknown]>();
const client = { importMap: mockImportMap } as unknown as Client;

const selectFile = (file: File): void => {
  const input = document.getElementById('contained-button-file') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
};

// React reports each warning once per run, whichever test triggers it first: keep every
// console error of this file, so the check below does not depend on the order of the tests.
const consoleErrors: string[] = [];
const originalConsoleError = console.error;

describe('ImportDialog', () => {
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      consoleErrors.push(args.map(String).join(' '));
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateImporter.mockImplementation(unsupportedType);
  });

  test('explains the supported formats when the file extension is not supported', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

      selectFile(new File(['not a map'], 'notes.txt', { type: 'text/plain' }));

      const alert = await screen.findByRole('alert');
      await waitFor(() =>
        expect(alert.textContent).toContain(
          'The file type is not supported. You can import WiseMapping, FreeMind, Freeplane, XMind, MindManager, and OPML maps.',
        ),
      );
      // The importer is not run, so its "Unsupported type" error does not replace the message.
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.getByRole('alert').textContent).not.toContain('Unsupported type');
      expect(mockCreateImporter).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });

  test('does not save a file with an unsupported extension', async () => {
    renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

    selectFile(new File(['not a map'], 'notes.txt', { type: 'text/plain' }));
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(mockImportMap).not.toHaveBeenCalled();
  });

  test('a closed dialog does not leak its file into the next one', async () => {
    mockCreateImporter.mockImplementation(() => ({
      import: (title: string) => Promise.resolve(`<map name="${title}"/>`),
    }));
    const first = renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });
    selectFile(new File(['<map/>'], 'alpha.wxml', { type: 'text/xml' }));
    await waitFor(() => expect(mockCreateImporter).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByLabelText(/Name/)).toHaveProperty('value', 'alpha'));
    first.unmount();

    renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

    expect(screen.getByLabelText(/Name/)).toHaveProperty('value', '');
    fireEvent.submit(screen.getByRole('button', { name: 'Create' }).closest('form')!);
    expect(mockImportMap).not.toHaveBeenCalled();
  });

  test('keeps what the user types while the file is being imported', async () => {
    let finishImport: (content: string) => void = () => undefined;
    mockCreateImporter.mockImplementation(() => ({
      import: () =>
        new Promise<string>((resolve) => {
          finishImport = resolve;
        }),
    }));
    mockImportMap.mockResolvedValue(1);
    renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

    selectFile(new File(['<map/>'], 'alpha.wxml', { type: 'text/xml' }));
    await waitFor(() => expect(mockCreateImporter).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { name: 'description', value: 'My notes' },
    });
    await act(async () => finishImport('<map name="alpha"/>'));

    expect(screen.getByLabelText(/Description/)).toHaveProperty('value', 'My notes');
    // Submitted directly: jsdom's constraint validation can't see the file in the required input.
    fireEvent.submit(screen.getByRole('button', { name: 'Create' }).closest('form')!);
    await waitFor(() => expect(mockImportMap).toHaveBeenCalled());
    expect(mockImportMap.mock.calls[0][0]).toEqual({
      title: 'alpha',
      description: 'My notes',
      contentType: 'application/xml',
      content: '<map name="alpha"/>',
    });
  });

  describe('a second file picked while the first is still importing', () => {
    // One pending import per file picked, settled by the test in any order.
    const pendingImports = () => {
      const imports: { resolve: (content: string) => void; reject: (e: Error) => void }[] = [];
      mockCreateImporter.mockImplementation(() => ({
        import: () =>
          new Promise<string>((resolve, reject) => {
            imports.push({ resolve, reject });
          }),
      }));
      return imports;
    };

    const pickBoth = async (): Promise<void> => {
      selectFile(new File(['<map/>'], 'alpha.wxml', { type: 'text/xml' }));
      await waitFor(() => expect(mockCreateImporter).toHaveBeenCalledTimes(1));
      selectFile(new File(['<map/>'], 'beta.wxml', { type: 'text/xml' }));
      await waitFor(() => expect(mockCreateImporter).toHaveBeenCalledTimes(2));
    };

    test('is not overwritten by the slower first import', async () => {
      const imports = pendingImports();
      mockImportMap.mockResolvedValue(1);
      renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

      await pickBoth();
      await act(async () => imports[1].resolve('<map name="beta"/>'));
      await act(async () => imports[0].resolve('<map name="alpha"/>'));

      fireEvent.submit(screen.getByRole('button', { name: 'Create' }).closest('form')!);
      await waitFor(() => expect(mockImportMap).toHaveBeenCalled());
      expect(mockImportMap.mock.calls[0][0]).toMatchObject({ content: '<map name="beta"/>' });
    });

    test('does not show the error of the first import', async () => {
      const imports = pendingImports();
      renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

      await pickBoth();
      await act(async () => imports[1].resolve('<map name="beta"/>'));
      const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      await act(async () => imports[0].reject(new Error('alpha is broken')));

      expect(screen.queryByRole('alert')).toBeNull();
      error.mockRestore();
    });

    test('is not saved with the first file while it is still loading', async () => {
      const imports = pendingImports();
      renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

      selectFile(new File(['<map/>'], 'alpha.wxml', { type: 'text/xml' }));
      await waitFor(() => expect(mockCreateImporter).toHaveBeenCalledTimes(1));
      await act(async () => imports[0].resolve('<map name="alpha"/>'));
      selectFile(new File(['<map/>'], 'beta.wxml', { type: 'text/xml' }));
      // beta is picked but not imported yet: there is nothing to save.
      fireEvent.submit(screen.getByRole('button', { name: 'Create' }).closest('form')!);

      // The mutation calls the client asynchronously.
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
      expect(mockImportMap).not.toHaveBeenCalled();
    });
  });

  test('the description field is controlled from the start', () => {
    renderWithProviders(<ImportDialog onClose={jest.fn()} />, { client });

    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { name: 'description', value: 'My notes' },
    });

    expect(screen.getByLabelText(/Description/)).toHaveProperty('value', 'My notes');
    expect(consoleErrors.filter((message) => message.includes('uncontrolled'))).toEqual([]);
  });
});
