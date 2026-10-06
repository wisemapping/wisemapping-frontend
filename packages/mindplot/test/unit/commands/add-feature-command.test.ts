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

import { buildDesigner } from './designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * Adding a feature (e.g. an icon) to several selected topics must give each
 * topic its own feature: a shared instance means changing it on one topic
 * changes it on all of them.
 */
describe('AddFeatureToTopicCommand', () => {
  it('adds a separate feature to each topic, and undo/redo restores them', async () => {
    const { designer, save, topic } = await buildDesigner();
    const dispatcher = designer.getActionDispatcher();
    const before = save();

    dispatcher.addFeatureToTopic([1, 3], 'eicon', { id: '😀' });
    const after = save();

    const [featureA] = topic(1).getModel().findFeatureByType('eicon');
    const [featureB] = topic(3).getModel().findFeatureByType('eicon');
    expect(featureA).toBeDefined();
    expect(featureB).toBeDefined();
    expect(featureA).not.toBe(featureB);
    expect(featureA!.getId()).not.toBe(featureB!.getId());

    // Changing the icon on A (as clicking it in the canvas does) leaves B alone ...
    featureA!.setIconType('😎');
    expect(topic(3).getModel().getFeatures()[0]!.getAttributes()).toEqual({ id: '😀' });
    featureA!.setIconType('😀');

    designer.undo();
    expect(topic(1).getModel().getFeatures()).toHaveLength(0);
    expect(topic(3).getModel().getFeatures()).toHaveLength(0);
    expect(save()).toEqual(before);

    // Redo brings back the same features, so later commands that refer to them by id still apply.
    designer.redo();
    expect(topic(1).getModel().getFeatures()[0]).toBe(featureA);
    expect(topic(3).getModel().getFeatures()[0]).toBe(featureB);
    expect(save()).toEqual(after);
  });
});
