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

const mockExportAndEncode = jest.fn(() => Promise.resolve('blob:export'));
const mockExporter = { exportAndEncode: () => mockExportAndEncode() };
const mockCreateTextExporter = jest.fn((..._args: unknown[]) => mockExporter);
const mockCreateImageExporter = jest.fn((..._args: unknown[]) => mockExporter);
jest.mock('@wisemapping/editor', () => ({
  TextExporterFactory: { create: (...args: unknown[]) => mockCreateTextExporter(...args) },
  ImageExporterFactory: { create: (...args: unknown[]) => mockCreateImageExporter(...args) },
}));
const mockFetchMindmap = jest.fn();
jest.mock('../../../../src/components/editor-page/PersistenceManagerUtils', () => ({
  fetchMindmap: (mapId: number) => mockFetchMindmap(mapId),
}));
jest.mock('../../../../src/utils/analytics', () => ({ trackExport: jest.fn() }));

import type { Designer } from '@wisemapping/editor';
import ExportDialog from '../../../../src/components/maps-page/action-dispatcher/export-dialog';
import Client from '../../../../src/classes/client';
import { trackExport } from '../../../../src/utils/analytics';
import { renderWithProviders } from '../../helpers/render';

const mockFetchMapMetadata = jest.fn(() => Promise.resolve({ title: 'Plan' }));
const client = { fetchMapMetadata: mockFetchMapMetadata } as unknown as Client;

const fakeMindmap = (theme: string) => {
  const mindmap = {
    theme,
    getTheme: () => mindmap.theme,
    setTheme: jest.fn((value: string) => {
      mindmap.theme = value;
    }),
  };
  return mindmap;
};

const fakeDesigner = (background?: string) => {
  const container = document.createElement('div');
  if (background) {
    container.style.backgroundColor = background;
  }
  const parent = document.createElement('div');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  container.appendChild(parent);
  parent.appendChild(svg);
  const mindmap = fakeMindmap('prism');
  return {
    svg,
    designer: {
      getWorkSpace: () => ({ getSVGElement: () => svg }),
      getMindmap: () => mindmap,
      applyTheme: jest.fn(),
    } as unknown as Designer,
  };
};

const submit = (): void => {
  fireEvent.submit(screen.getByRole('button', { name: 'Export' }).closest('form')!);
};

const radio = (label: RegExp): HTMLInputElement => screen.getByLabelText(label) as HTMLInputElement;

const pickFormat = async (option: string): Promise<void> => {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: option }));
};

describe('ExportDialog options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  test('from the map list, image formats are disabled and explained', () => {
    renderWithProviders(<ExportDialog mapId={3} enableImgExport={false} onClose={jest.fn()} />, {
      client,
    });

    expect(
      screen.getByText(
        'Exporting to Image (SVG,PNG,JPEG,PDF) is only available in the editor toolbar.',
      ),
    ).toBeTruthy();
    expect(radio(/^Image/).disabled).toBe(true);
    expect(radio(/^Document/).checked).toBe(true);
  });

  test('switching group picks that group default format', async () => {
    const own = fakeDesigner();
    renderWithProviders(
      <ExportDialog mapId={3} enableImgExport={true} designer={own.designer} onClose={jest.fn()} />,
      { client },
    );
    expect(screen.getByRole('combobox').textContent).toBe('Scalable Vector Graphics (SVG)');

    fireEvent.click(radio(/^Document/));
    expect(screen.getByRole('combobox').textContent).toBe('Plain Text File (TXT)');

    fireEvent.click(radio(/^Mindmap Tools/));
    expect(screen.getByRole('combobox').textContent).toBe('WiseMapping (WXML)');

    fireEvent.click(radio(/^Image/));
    expect(screen.getByRole('combobox').textContent).toBe('Scalable Vector Graphics (SVG)');
    expect(screen.getByLabelText('Center and zoom to fit')).toBeTruthy();
  });

  test('an image export uses the chosen format, the zoom option and the canvas background', async () => {
    const own = fakeDesigner('rgb(10, 20, 30)');
    const onClose = jest.fn();
    renderWithProviders(
      <ExportDialog mapId={3} enableImgExport={true} designer={own.designer} onClose={onClose} />,
      { client },
    );

    await pickFormat('Portable Network Graphics (PNG)');
    fireEvent.click(screen.getByLabelText('Center and zoom to fit'));
    submit();

    await waitFor(() => expect(mockCreateImageExporter).toHaveBeenCalled());
    const [format, svg, , , zoomToFit, background] = mockCreateImageExporter.mock.calls[0];
    expect(format).toBe('png');
    expect(svg).toBe(own.svg);
    expect(zoomToFit).toBe(false);
    expect(background).toBe('rgb(10, 20, 30)');
    await waitFor(() => expect(trackExport).toHaveBeenCalledWith('png', 'image'));
    expect(onClose).toHaveBeenCalled();
  });

  test('a transparent canvas exports on white', async () => {
    const own = fakeDesigner('transparent');
    renderWithProviders(
      <ExportDialog mapId={3} enableImgExport={true} designer={own.designer} onClose={jest.fn()} />,
      { client },
    );

    submit();

    await waitFor(() => expect(mockCreateImageExporter).toHaveBeenCalled());
    expect(mockCreateImageExporter.mock.calls[0][5]).toBe('#ffffff');
  });

  test('from the map list, a map in another theme is exported in the export theme', async () => {
    const mindmap = fakeMindmap('classic');
    mockFetchMindmap.mockResolvedValue(mindmap);
    renderWithProviders(<ExportDialog mapId={3} enableImgExport={false} onClose={jest.fn()} />, {
      client,
    });

    await pickFormat('Markdown (MD)');
    submit();

    await waitFor(() => expect(mockCreateTextExporter).toHaveBeenCalledWith('md', mindmap));
    expect(mindmap.setTheme).toHaveBeenCalledWith('prism');
    await waitFor(() => expect(trackExport).toHaveBeenCalledWith('md', 'document'));
  });

  test('the downloaded file is named after the map', async () => {
    mockFetchMindmap.mockResolvedValue(fakeMindmap('prism'));
    const names: string[] = [];
    jest.mocked(HTMLAnchorElement.prototype.click).mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      names.push(`${this.download} ${this.href}`);
    });
    renderWithProviders(<ExportDialog mapId={3} enableImgExport={false} onClose={jest.fn()} />, {
      client,
    });
    // Let the map metadata (its title) load.
    await waitFor(() => expect(mockFetchMapMetadata).toHaveBeenCalledWith(3));
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    submit();

    await waitFor(() => expect(names).toEqual(['Plan.txt blob:export']));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export');
  });

  test('cancel closes without exporting', () => {
    const onClose = jest.fn();
    renderWithProviders(<ExportDialog mapId={3} enableImgExport={false} onClose={onClose} />, {
      client,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockFetchMindmap).not.toHaveBeenCalled();
  });
});
