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

/**
 * @jest-environment jsdom
 */
import type { IntlShape } from 'react-intl';
import type ActionConfig from '../../../src/classes/action/action-config';
import type Editor from '../../../src/classes/model/editor';
import type { SelectionSnapshot } from '../../../src/hooks/useSelection';
import { buildEditorPanelConfig } from '../../../src/components/editor-toolbar/configBuilder';

const notify = jest.fn();
jest.mock('@wisemapping/mindplot', () => ({
  $notify: (msg: string) => notify(msg),
  // `formatTooltip` reaches for this, so the stand-in has to carry it.
  isMacPlatform: () => false,
  StrokeStyle: {},
  LineType: {},
}));

// react-intl ships ESM only and this package's jest config does not transform
// node_modules, so the transitive imports in configBuilder need a stand-in.
jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage ?? '',
  }),
  FormattedMessage: () => null,
  IntlProvider: ({ children }: { children: unknown }) => children,
  defineMessages: (messages: unknown) => messages,
}));

jest.mock('../../../src/utils/analytics', () => ({
  trackRelationshipAction: jest.fn(),
  trackEditorPanelAction: jest.fn(),
  trackEditorInteraction: jest.fn(),
}));

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage ?? '',
} as unknown as IntlShape;

const makeModel = (selectedIds: number[]): Editor =>
  ({
    getDesigner: () => ({}),
    getDesignerModel: () => ({
      filterSelectedTopics: () => selectedIds.map((id) => ({ getId: () => id })),
      filterSelectedRelationships: () => [],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any as Editor;

// `buildEditorPanelConfig` takes a useSelection snapshot alongside the model,
// so the two have to agree on how much is selected.
const selectionOf = (selectedIds: number[]): SelectionSnapshot => ({
  topicCount: selectedIds.length,
  relationshipCount: 0,
  isMapLoaded: true,
});

const buildConfig = (
  selectedIds: number[],
  getDeepLink?: (nodeId: number) => string,
): ActionConfig[] =>
  buildEditorPanelConfig(makeModel(selectedIds), intl, selectionOf(selectedIds), getDeepLink);

const findCopyEntry = (config: ActionConfig[]): ActionConfig => {
  const entry = config.find((c) => c['data-testid'] === 'copy-node-link-button');
  expect(entry).toBeDefined();
  return entry!;
};

describe('Copy link to node toolbar entry', () => {
  let writeText: jest.Mock;

  beforeEach(() => {
    notify.mockClear();
    writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('is hidden when the host does not supply getDeepLink', () => {
    const entry = findCopyEntry(buildConfig([5]));

    expect(entry.visible).toBe(false);
    expect(entry.disabled!()).toBe(true);
  });

  it('is disabled while nothing is selected', () => {
    const entry = findCopyEntry(
      buildConfig([], (id) => `https://host/n/${id}`),
    );

    expect(entry.visible).toBe(true);
    expect(entry.disabled!()).toBe(true);
  });

  it('is disabled for a multi-node selection -- a link names one node', () => {
    const entry = findCopyEntry(
      buildConfig([5, 6], (id) => `https://host/n/${id}`),
    );

    expect(entry.disabled!()).toBe(true);
  });

  it('copies the link for the selected node and notifies', async () => {
    const getDeepLink = jest.fn((id: number) => `https://host/c/maps/3/edit?node=${id}`);
    const entry = findCopyEntry(buildConfig([12], getDeepLink));

    expect(entry.disabled!()).toBe(false);
    entry.onClick!(undefined as unknown as React.MouseEvent<HTMLElement>);
    await Promise.resolve();

    // The id comes from the designer's selection, not from the rendered SVG.
    expect(getDeepLink).toHaveBeenCalledWith(12);
    expect(writeText).toHaveBeenCalledWith('https://host/c/maps/3/edit?node=12');
    expect(notify).toHaveBeenCalledWith('Link to node copied to clipboard');
  });

  it('notifies the failure when the clipboard rejects', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    jest.spyOn(console, 'error').mockImplementation();

    const entry = findCopyEntry(
      buildConfig([12], (id) => `https://host/n/${id}`),
    );
    entry.onClick!(undefined as unknown as React.MouseEvent<HTMLElement>);
    await Promise.resolve();
    await Promise.resolve();

    expect(notify).toHaveBeenCalledWith('Could not copy the link to the clipboard');
    jest.restoreAllMocks();
  });

  it('notifies the failure when the Clipboard API is unavailable', () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    jest.spyOn(console, 'error').mockImplementation();

    const entry = findCopyEntry(
      buildConfig([12], (id) => `https://host/n/${id}`),
    );
    entry.onClick!(undefined as unknown as React.MouseEvent<HTMLElement>);

    expect(notify).toHaveBeenCalledWith('Could not copy the link to the clipboard');
    jest.restoreAllMocks();
  });
});
