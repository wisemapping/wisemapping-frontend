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
import { createIntl, createIntlCache } from 'react-intl';
import { buildEditorPanelConfig } from '../../../src/components/editor-toolbar/configBuilder';
import { SelectionSnapshot } from '../../../src/hooks/useSelection';
import type Editor from '../../../src/classes/model/editor';

const intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());

const model = {
  getDesigner: () => ({
    getThemeVariant: () => 'light',
    getMindmap: () => ({ getCanvasStyle: () => ({}) }),
    getModel: () => ({
      selectedTopic: () => undefined,
      selectedRelationship: () => undefined,
      filterSelectedTopics: () => [],
    }),
  }),
} as unknown as Editor;

const selection = (topicCount: number, relationshipCount: number): SelectionSnapshot => ({
  topicCount,
  relationshipCount,
  isMapLoaded: true,
});

const build = (topicCount: number, relationshipCount = 0) =>
  buildEditorPanelConfig(model, intl, selection(topicCount, relationshipCount));

/** Tooltip is the only stable human-readable handle on these entries. */
const byTooltip = (
  config: ReturnType<typeof buildEditorPanelConfig>,
  fragment: string,
): (() => boolean) | undefined =>
  config.find((entry) => entry.tooltip?.includes(fragment))?.disabled;

/**
 * Every topic-scoped entry used to carry
 * `disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0`,
 * polled during render. They now read a selection snapshot, so what these
 * assert is that the snapshot -- and nothing else -- decides the state.
 */
describe('buildEditorPanelConfig disabled state', () => {
  const TOPIC_SCOPED = [
    'Style Topic & Connections',
    'Font Style',
    'Add Relationship',
    'Add Link',
    'Add Note',
    'Add Icon',
    'Add Topic Image',
  ];

  it.each(TOPIC_SCOPED)('disables %s with no topic selected', (tooltip) => {
    const disabled = byTooltip(build(0), tooltip);
    expect(disabled).toBeDefined();
    expect(disabled!()).toBe(true);
  });

  it.each(TOPIC_SCOPED)('enables %s with one topic selected', (tooltip) => {
    expect(byTooltip(build(1), tooltip)!()).toBe(false);
  });

  it.each(TOPIC_SCOPED)('enables %s with several topics selected', (tooltip) => {
    // Multi-select used to be invisible to the chrome because Designer only
    // fired 'onfocus' for an exactly-one selection.
    expect(byTooltip(build(4), tooltip)!()).toBe(false);
  });

  it('gates relationship styling on the relationship selection, not the topic one', () => {
    expect(byTooltip(build(3, 0), 'Relationship Style')!()).toBe(true);
    expect(byTooltip(build(0, 1), 'Relationship Style')!()).toBe(false);
  });

  it('leaves the canvas background always available', () => {
    // Background styling is map-scoped, so it carries no disabled thunk.
    const entry = build(0).find((e) => e.tooltip?.includes('Background'));
    expect(entry).toBeDefined();
    expect(entry!.disabled).toBeUndefined();
  });

  it('does not consult the designer to decide disabled state', () => {
    const filterSelectedTopics = jest.fn().mockReturnValue([]);
    const spyModel = {
      getDesigner: () => ({
        getThemeVariant: () => 'light',
        getMindmap: () => ({ getCanvasStyle: () => ({}) }),
        getModel: () => ({
          selectedTopic: () => undefined,
          selectedRelationship: () => undefined,
          filterSelectedTopics,
        }),
      }),
      getDesignerModel: () => {
        throw new Error('disabled state must come from the snapshot');
      },
    } as unknown as Editor;

    const config = buildEditorPanelConfig(spyModel, intl, selection(2, 0));

    // getDesignerModel() throws, so reaching for it at all would surface here.
    expect(() => config.forEach((entry) => entry.disabled?.())).not.toThrow();

    // And the snapshot alone produced the right answers: two topics, no
    // relationship, so the topic entries are live and the relationship one is not.
    TOPIC_SCOPED.forEach((tooltip) => expect(byTooltip(config, tooltip)!()).toBe(false));
    expect(byTooltip(config, 'Relationship Style')!()).toBe(true);
    expect(filterSelectedTopics).not.toHaveBeenCalled();
  });
});
