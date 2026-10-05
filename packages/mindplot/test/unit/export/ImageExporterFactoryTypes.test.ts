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
import { describe, expect, it, jest } from '@jest/globals';

const pdfExporter = jest.fn();
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {
    constructor(...args: unknown[]) {
      pdfExporter(...args);
    }
  },
}));

// eslint-disable-next-line import/first
import BinaryImageExporter from '../../../src/components/export/BinaryImageExporter';
// eslint-disable-next-line import/first
import ImageExporterFactory from '../../../src/components/export/ImageExporterFactory';
// eslint-disable-next-line import/first
import PDFExporter from '../../../src/components/export/PDFExporter';

describe('ImageExporterFactory', () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  it.each([
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
  ] as const)('creates a %s binary exporter', (type, contentType) => {
    const exporter = ImageExporterFactory.create(type, svg, 800, 600);
    expect(exporter).toBeInstanceOf(BinaryImageExporter);
    expect(exporter.getContentType()).toBe(contentType);
  });

  it('creates a pdf exporter with the fit and the background', () => {
    const exporter = ImageExporterFactory.create('pdf', svg, 800, 600, false, '#000');
    expect(exporter).toBeInstanceOf(PDFExporter);
    expect(pdfExporter).toHaveBeenCalledWith(svg, false, '#000');
  });

  it('rejects an unknown type', () => {
    expect(() => ImageExporterFactory.create('gif' as 'png', svg, 1, 1)).toThrow(
      'Unsupported encoding gif',
    );
  });
});
