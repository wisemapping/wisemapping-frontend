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

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import TextExporterFactory from '../../../src/components/export/TextExporterFactory';

const NO_CENTRAL_TOPIC = 'The map to export has no central topic';

// A map without topics: it can not be loaded in the editor (Designer.loadMap asserts a central
// topic), so the exporters of the topic tree reject it instead of writing an empty file.
describe('Text exporters of a map without a central topic (BL5-222)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(['md', 'mm', 'mmx', 'txt'] as const)('%s throws a clear error', async (type) => {
    const exporter = TextExporterFactory.create(type, new Mindmap('empty'));

    await expect(Promise.resolve().then(() => exporter.export())).rejects.toThrow(NO_CENTRAL_TOPIC);
  });

  test('wxml still serializes it: it is the storage format, not a view of the topic tree', async () => {
    const xml = await TextExporterFactory.create('wxml', new Mindmap('empty')).export();

    expect(xml).toContain('<map');
    expect(xml).not.toContain('<topic');
  });
});
