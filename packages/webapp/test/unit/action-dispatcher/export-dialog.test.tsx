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

// The dialog only needs the exporter factories from the editor bundle.
const mockExportAndEncode = jest.fn(() => Promise.resolve('blob:export'));
const mockExporter = { exportAndEncode: () => mockExportAndEncode() };
const mockCreateTextExporter = jest.fn((_type: string, _mindmap: unknown) => mockExporter);
const mockCreateImageExporter = jest.fn(
  (_type: string, _svg: Element, _width: number, _height: number) => mockExporter,
);
jest.mock('@wisemapping/editor', () => ({
  TextExporterFactory: {
    create: (type: string, mindmap: unknown) => mockCreateTextExporter(type, mindmap),
  },
  ImageExporterFactory: {
    create: (type: string, svg: Element, width: number, height: number) =>
      mockCreateImageExporter(type, svg, width, height),
  },
}));

const mockFetchMindmap = jest.fn();
jest.mock('../../../src/components/editor-page/PersistenceManagerUtils', () => ({
  fetchMindmap: (mapId: number) => mockFetchMindmap(mapId),
}));

import type { Designer } from '@wisemapping/editor';
import ExportDialog from '../../../src/components/maps-page/action-dispatcher/export-dialog';
import Client from '../../../src/classes/client';
import { renderWithProviders } from '../helpers/render';

const client = {
  fetchMapMetadata: () => Promise.resolve({ title: 'Map' }),
} as unknown as Client;

const fakeMindmap = (name: string, theme = 'prism') => {
  const mindmap = {
    name,
    theme,
    getTheme: () => mindmap.theme,
    setTheme: jest.fn((value: string) => {
      mindmap.theme = value;
    }),
  };
  return mindmap;
};

// A designer showing its own map on its own canvas.
const fakeDesigner = (name: string, theme = 'prism') => {
  const container = document.createElement('div');
  const parent = document.createElement('div');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  container.appendChild(parent);
  parent.appendChild(svg);
  const mindmap = fakeMindmap(name, theme);
  // Like Designer.applyTheme: the theme goes to the model the editor saves.
  const applyTheme = jest.fn((value: string) => mindmap.setTheme(value));
  return {
    svg,
    mindmap,
    applyTheme,
    designer: {
      getWorkSpace: () => ({ getSVGElement: () => svg }),
      getMindmap: () => mindmap,
      applyTheme,
    } as unknown as Designer,
  };
};

const submit = (): void => {
  fireEvent.submit(screen.getByRole('button', { name: 'Export' }).closest('form')!);
};

describe('ExportDialog', () => {
  const globalWithDesigner = globalThis as unknown as { designer?: Designer };

  beforeEach(() => {
    jest.clearAllMocks();
    // Another map's designer, as the last-built one is published on globalThis.
    globalWithDesigner.designer = fakeDesigner('other map').designer;
    // jsdom has no object URLs.
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    delete globalWithDesigner.designer;
  });

  test('exports the map of its own editor, not the last designer built', async () => {
    const own = fakeDesigner('own map');
    renderWithProviders(
      <ExportDialog mapId={1} enableImgExport={true} designer={own.designer} onClose={jest.fn()} />,
      { client },
    );

    submit();

    await waitFor(() => expect(mockCreateImageExporter).toHaveBeenCalled());
    expect(mockCreateImageExporter.mock.calls[0][0]).toBe('svg');
    expect(mockCreateImageExporter.mock.calls[0][1]).toBe(own.svg);
  });

  test('from the map list, exports the selected map', async () => {
    const selected = fakeMindmap('selected map');
    mockFetchMindmap.mockResolvedValue(selected);
    renderWithProviders(<ExportDialog mapId={7} enableImgExport={false} onClose={jest.fn()} />, {
      client,
    });

    submit();

    await waitFor(() => expect(mockCreateTextExporter).toHaveBeenCalled());
    expect(mockFetchMindmap).toHaveBeenCalledWith(7);
    expect(mockCreateTextExporter).toHaveBeenCalledWith('txt', selected);
  });

  describe('from the editor, leaves the live map theme as it was', () => {
    const renderOwn = (own: ReturnType<typeof fakeDesigner>, enableImgExport = true) =>
      renderWithProviders(
        <ExportDialog
          mapId={1}
          enableImgExport={enableImgExport}
          designer={own.designer}
          onClose={jest.fn()}
        />,
        { client },
      );

    test('after an image export, rendered in the export theme', async () => {
      const own = fakeDesigner('own map', 'classic');
      let themeWhileExporting: string | undefined;
      mockExportAndEncode.mockImplementationOnce(() => {
        themeWhileExporting = own.mindmap.getTheme();
        return Promise.resolve('blob:export');
      });
      renderOwn(own);

      submit();

      await waitFor(() => expect(own.applyTheme).toHaveBeenCalledTimes(2));
      expect(themeWhileExporting).toBe('prism');
      expect(own.applyTheme.mock.calls).toEqual([['prism'], ['classic']]);
      expect(own.mindmap.getTheme()).toBe('classic');
    });

    test('after a text export', async () => {
      const own = fakeDesigner('own map', 'classic');
      renderOwn(own, false);

      submit();

      await waitFor(() => expect(mockCreateTextExporter).toHaveBeenCalled());
      await waitFor(() => expect(own.mindmap.getTheme()).toBe('classic'));
    });

    test('when the export fails', async () => {
      const own = fakeDesigner('own map', 'classic');
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      mockExportAndEncode.mockImplementationOnce(() => Promise.reject(new Error('boom')));
      renderOwn(own);

      submit();

      await waitFor(() => expect(consoleError).toHaveBeenCalled());
      expect(own.applyTheme.mock.calls).toEqual([['prism'], ['classic']]);
      expect(own.mindmap.getTheme()).toBe('classic');
    });

    test('when the exporter cannot be created', async () => {
      const own = fakeDesigner('own map', 'classic');
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      mockCreateImageExporter.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      renderOwn(own);

      submit();

      await waitFor(() => expect(consoleError).toHaveBeenCalled());
      expect(own.mindmap.getTheme()).toBe('classic');
    });

    test('without re-rendering a map already in the export theme', async () => {
      const own = fakeDesigner('own map', 'prism');
      renderOwn(own);

      submit();

      await waitFor(() => expect(mockCreateImageExporter).toHaveBeenCalled());
      await waitFor(() => expect(mockExportAndEncode).toHaveBeenCalled());
      expect(own.applyTheme).not.toHaveBeenCalled();
      expect(own.mindmap.getTheme()).toBe('prism');
    });
  });
});
