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

import path from 'path';
import { expect, test, describe, jest } from '@jest/globals';
import { parseXMLFile, setupBlob } from './Helper';

// Stub PDFExporter to avoid pulling in jspdf (which needs TextEncoder in node).
jest.mock('../../../src/components/export/PDFExporter', () => {
  return {
    __esModule: true,
    default: class {},
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/first
import ImageExporterFactory from '../../../src/components/export/ImageExporterFactory';
// eslint-disable-next-line import/first
import SVGExporter from '../../../src/components/export/SVGExporter';

setupBlob();

describe('ImageExporterFactory background color forwarding', () => {
  const loadSvg = (): Element => {
    const svgPath = path.resolve(__dirname, './input/welcome.svg');
    return parseXMLFile(svgPath, 'image/svg+xml').documentElement;
  };

  test('SVG exporter receives custom background color', async () => {
    const exporter = ImageExporterFactory.create(
      'svg',
      loadSvg(),
      800,
      600,
      true,
      '#123456',
    );
    expect(exporter).toBeInstanceOf(SVGExporter);

    const result = await (exporter as SVGExporter).export();
    expect(result).toContain('background-color:#123456');
  });

  test('SVG exporter defaults to white when color omitted', async () => {
    const exporter = ImageExporterFactory.create('svg', loadSvg(), 800, 600, true);

    const result = await (exporter as SVGExporter).export();
    expect(result).toContain('background-color:white');
  });
});
