/** @jest-environment jsdom */
import { TextEncoder, TextDecoder } from 'util';
Object.assign(globalThis, { TextEncoder, TextDecoder });

import type { IntlShape } from 'react-intl';
import type { Designer } from '@wisemapping/mindplot';
import type Capability from '../../../src/classes/action/capability';
import { buildInspectorTopicActions } from '../../../src/components/inspector/topic-action-config';

jest.mock('@wisemapping/mindplot', () => ({
  $notify: jest.fn(),
  $msg: jest.fn((key: string) => `msg:${key}`),
}));

import { $notify, $msg } from '@wisemapping/mindplot';

type MockTopic = { getId: () => number };

const makeDesigner = () => {
  const selected: MockTopic = { getId: () => 17 };
  return {
    getModel: () => ({
      selectedTopic: jest.fn<MockTopic | undefined, []>(() => selected),
      filterSelectedTopics: jest.fn<MockTopic[], []>(() => [selected]),
    }),
    pasteClipboardAsChild: jest.fn((_id: number) => Promise.resolve()),
  };
};

const mockIntl = {
  formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage || '',
} as unknown as IntlShape;

const mockCapability = {
  isHidden: jest.fn(() => false),
  isDisabled: jest.fn(() => false),
} as unknown as Capability;

describe('buildInspectorTopicActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns two actions when a topic is selected', () => {
    const designer = makeDesigner();
    const actions = buildInspectorTopicActions({
      designer: designer as unknown as Designer,
      intl: mockIntl,
      getDeepLink: (id) => `https://app.test/c/maps/1/edit?node=${id}`,
      capability: mockCapability,
    });
    expect(actions).toHaveLength(2);
    expect(actions.map((a) => a.id)).toEqual(['paste-as-child', 'copy-link-to-node']);
  });

  it('paste-as-child calls designer.pasteClipboardAsChild with the selected id', () => {
    const designer = makeDesigner();
    const actions = buildInspectorTopicActions({
      designer: designer as unknown as Designer,
      intl: mockIntl,
      getDeepLink: (id) => `https://app.test/c/maps/1/edit?node=${id}`,
      capability: mockCapability,
    });
    const paste = actions.find((a) => a.id === 'paste-as-child')!;
    paste.onClick!({} as unknown as React.MouseEvent);
    expect(designer.pasteClipboardAsChild).toHaveBeenCalledWith(17);
  });

  it('copy-link-to-node writes a deeplink for the selected id and notifies', async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: { writeText },
    });
    const designer = makeDesigner();
    const actions = buildInspectorTopicActions({
      designer: designer as unknown as Designer,
      intl: mockIntl,
      getDeepLink: (id) => `https://app.test/c/maps/1/edit?node=${id}`,
      capability: mockCapability,
    });
    const copy = actions.find((a) => a.id === 'copy-link-to-node')!;
    copy.onClick!({} as unknown as React.MouseEvent);
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith('https://app.test/c/maps/1/edit?node=17');
    expect($msg).toHaveBeenCalledWith('DEEPLINK_COPIED');
    expect($notify).toHaveBeenCalledWith('msg:DEEPLINK_COPIED');
  });

  it('disables both actions when no topic is selected', () => {
    const designer = makeDesigner();
    const model = designer.getModel();
    model.selectedTopic.mockReturnValue(undefined);
    model.filterSelectedTopics.mockReturnValue([]);
    const actions = buildInspectorTopicActions({
      designer: { getModel: () => model } as unknown as Designer,
      intl: mockIntl,
      getDeepLink: (id) => `https://app.test/c/maps/1/edit?node=${id}`,
      capability: mockCapability,
    });
    expect(actions.every((a) => a.disabled!())).toBe(true);
  });

  it('disables copy-link-to-node when getDeepLink is undefined', () => {
    const designer = makeDesigner();
    const actions = buildInspectorTopicActions({
      designer: designer as unknown as Designer,
      intl: mockIntl,
      getDeepLink: undefined,
      capability: mockCapability,
    });
    const copy = actions.find((a) => a.id === 'copy-link-to-node')!;
    expect(copy.disabled!()).toBe(true);
  });

  it('hides actions when capability.isHidden returns true', () => {
    const designer = makeDesigner();
    const actions = buildInspectorTopicActions({
      designer: designer as unknown as Designer,
      intl: mockIntl,
      getDeepLink: (id) => `https://app.test/c/maps/1/edit?node=${id}`,
      capability: {
        isHidden: jest.fn((action: string) => action === 'paste-as-child'),
        isDisabled: jest.fn(() => false),
      } as unknown as Capability,
    });
    const paste = actions.find((a) => a.id === 'paste-as-child')!;
    const copy = actions.find((a) => a.id === 'copy-link-to-node')!;
    expect(paste.visible).toBe(false);
    expect(copy.visible).toBe(true);
  });
});
