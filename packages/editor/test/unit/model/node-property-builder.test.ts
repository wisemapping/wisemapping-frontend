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

import { Designer, StrokeStyle } from '@wisemapping/mindplot';
import NodePropertyBuilder from '../../../src/classes/model/node-property-builder';

/**
 * Toolbar widgets read their property models on every selection change, the
 * deselected state included: `color-picker` reads `colorModel.getValue()` while
 * rendering, and `topic-font-editor` re-reads its models from an `onblur`
 * listener. The getters therefore have to stay total when nothing is selected
 * rather than throwing from inside a render or an event dispatch.
 */
const emptySelectionDesigner = (): { designer: Designer; changeBackgroundColor: jest.Mock } => {
  const changeBackgroundColor = jest.fn();
  const designer = {
    getModel: () => ({
      selectedTopic: () => null,
      selectedRelationship: () => null,
      filterSelectedTopics: () => [],
    }),
    getThemeVariant: () => 'light',
    changeBackgroundColor,
    changeFontSize: jest.fn(),
  } as unknown as Designer;
  return { designer, changeBackgroundColor };
};

describe('NodePropertyBuilder with an empty selection', () => {
  it('reports a font size instead of throwing', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    expect(() => builder.getFontSizeModel().getValue()).not.toThrow();
    expect(builder.getFontSizeModel().getValue()).toEqual(10);
  });

  it('does not dispatch a font size change when nothing is selected', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    builder.getFontSizeModel().switchValue!();

    expect(designer.changeFontSize).not.toHaveBeenCalled();
  });

  it('reports no background colour instead of throwing', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    expect(() => builder.getSelectedTopicColorModel().getValue()).not.toThrow();
    expect(builder.getSelectedTopicColorModel().getValue()).toBeUndefined();
  });

  it('keeps the background colour setter wired to the designer', () => {
    const { designer, changeBackgroundColor } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    builder.getSelectedTopicColorModel().setValue!('#ff0000');

    expect(changeBackgroundColor).toHaveBeenCalledWith('#ff0000');
  });

  it('reports an empty link instead of throwing', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    expect(() => builder.getLinkModel().getValue()).not.toThrow();
    expect(builder.getLinkModel().getValue()).toEqual('');
    expect(() => builder.getLinkModel().setValue!('https://example.com')).not.toThrow();
  });

  it('reports no note instead of throwing', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    expect(() => builder.getNoteModel().getValue()).not.toThrow();
    expect(builder.getNoteModel().getValue()).toBeUndefined();
    expect(() => builder.getNoteModel().setValue!('a note')).not.toThrow();
  });

  it('reports a font style instead of throwing', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    expect(() => builder.getFontStyleModel().getValue()).not.toThrow();
    expect(builder.getFontStyleModel().getValue()).toEqual('normal');
  });

  it('falls back to the relationship model defaults instead of throwing', () => {
    const { designer } = emptySelectionDesigner();
    const builder = new NodePropertyBuilder(designer);

    expect(() => builder.getRelationshipStrokeStyleModel().getValue()).not.toThrow();
    expect(builder.getRelationshipStrokeStyleModel().getValue()).toEqual(StrokeStyle.DASHED);
  });
});
