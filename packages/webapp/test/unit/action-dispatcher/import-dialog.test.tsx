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

// The editor bundle pulls in the whole canvas. The dialog only needs the importer factory, which
// rejects an unknown type with "Unsupported type", as TextImporterFactory does.
const mockCreateImporter = jest.fn((type: string | undefined) => {
  throw new Error(`Unsupported type ${type}`);
});
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

describe('ImportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
