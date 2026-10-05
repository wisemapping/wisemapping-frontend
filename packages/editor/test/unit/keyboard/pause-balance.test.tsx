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
import React from 'react';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import type { Designer, Topic, PersistenceManager } from '@wisemapping/mindplot';
import type MapInfo from '../../../src/classes/model/map-info';
import type { EditorOptions } from '../../../src/hooks/useEditor';

// DesignerKeyboard counts its pauses (BL-36): the shortcuts stay off until every
// pause() has had its resume(). This stand-in does the same, so an unbalanced
// caller shows up as shortcuts coming back too early.
const keyboard = { pauses: 0 };
jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: {
    pause: () => {
      keyboard.pauses += 1;
    },
    resume: () => {
      keyboard.pauses = Math.max(0, keyboard.pauses - 1);
    },
    isDisabled: () => keyboard.pauses > 0,
  },
}));

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage ?? '',
  }),
  FormattedMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage ?? null,
}));

// useEditor builds these only once the canvas exists, which never happens here.
jest.mock('../../../src/classes/model/editor', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../../src/classes/default-widget-manager', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../src/classes/persistence/BootstrapPersistenceManager', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../src/classes/action/capability', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../src/utils/error-logger', () => ({ logCriticalError: jest.fn() }));

import Input from '../../../src/components/action-widget/input';
import FindInMapPanel from '../../../src/components/action-widget/pane/find-in-map';
import { useEditor } from '../../../src/hooks/useEditor';

const shortcutsPaused = (): boolean => keyboard.pauses > 0;

const designer = (): Designer => {
  const central = {
    getId: () => 1,
    getText: () => 'Central',
    getModel: () => ({ getPlainText: () => 'Central' }),
    getChildren: () => [],
  } as unknown as Topic;
  return {
    getModel: () => ({ getCentralTopic: () => central }),
    revealNode: jest.fn(),
  } as unknown as Designer;
};

/** A pane that pauses the shortcuts while open, with a text field inside it. */
const PaneWithInput = ({ showInput }: { showInput: boolean }) => (
  <>
    <FindInMapPanel designer={designer()} closeModal={jest.fn()} />
    {showInput && <Input slotProps={{ htmlInput: { 'aria-label': 'nested field' } }} />}
  </>
);

describe('Input keyboard pause (BL-36)', () => {
  beforeEach(() => {
    keyboard.pauses = 0;
  });

  it('pauses the shortcuts while focused and resumes them on blur', () => {
    render(<Input slotProps={{ htmlInput: { 'aria-label': 'field' } }} />);
    const field = screen.getByLabelText('field');

    fireEvent.focus(field);
    expect(shortcutsPaused()).toBe(true);

    fireEvent.blur(field);
    expect(shortcutsPaused()).toBe(false);
  });

  it('resumes the shortcuts when it unmounts while focused', () => {
    const { unmount } = render(<Input slotProps={{ htmlInput: { 'aria-label': 'field' } }} />);
    fireEvent.focus(screen.getByLabelText('field'));

    unmount();

    expect(shortcutsPaused()).toBe(false);
  });

  it('keeps the shortcuts paused while the pane is open, after a field in it blurs and unmounts', () => {
    const { rerender, unmount } = render(<PaneWithInput showInput />);
    const field = screen.getByLabelText('nested field');

    fireEvent.focus(field);
    fireEvent.blur(field);
    rerender(<PaneWithInput showInput={false} />);

    expect(shortcutsPaused()).toBe(true);

    unmount();
    expect(shortcutsPaused()).toBe(false);
  });

  it('keeps the shortcuts paused while the pane is open, after a field that never had the focus unmounts', () => {
    const { rerender, unmount } = render(<PaneWithInput showInput />);

    rerender(<PaneWithInput showInput={false} />);

    expect(shortcutsPaused()).toBe(true);

    unmount();
    expect(shortcutsPaused()).toBe(false);
  });

  it('keeps the shortcuts paused while the pane is open, after a focused field unmounts', () => {
    const { rerender, unmount } = render(<PaneWithInput showInput />);
    fireEvent.focus(screen.getByLabelText('nested field'));

    rerender(<PaneWithInput showInput={false} />);

    expect(shortcutsPaused()).toBe(true);

    unmount();
    expect(shortcutsPaused()).toBe(false);
  });
});

describe('useEditor keyboard pause (BL-36)', () => {
  const mapInfo = { isLocked: () => false, getId: () => '1' } as unknown as MapInfo;
  const persistenceManager = {} as PersistenceManager;
  const props = (enableKeyboardEvents: boolean) => ({
    mapInfo,
    persistenceManager,
    options: { enableKeyboardEvents } as EditorOptions,
  });

  beforeEach(() => {
    keyboard.pauses = 0;
  });

  it('leaves the shortcuts alone while keyboard events are enabled', () => {
    renderHook(() => useEditor(props(true)));

    expect(shortcutsPaused()).toBe(false);
  });

  it('does not lift a pause already held when it mounts with keyboard events enabled', () => {
    const { unmount } = render(<FindInMapPanel designer={designer()} closeModal={jest.fn()} />);
    renderHook(() => useEditor(props(true)));

    expect(shortcutsPaused()).toBe(true);
    unmount();
  });

  it('pauses the shortcuts while keyboard events are disabled, and gives them back', () => {
    const { rerender } = renderHook(({ enabled }) => useEditor(props(enabled)), {
      initialProps: { enabled: true },
    });

    rerender({ enabled: false });
    expect(shortcutsPaused()).toBe(true);

    rerender({ enabled: true });
    expect(shortcutsPaused()).toBe(false);
  });

  it('keeps a pane pause after a dialog disables and re-enables keyboard events', () => {
    const { rerender } = renderHook(({ enabled }) => useEditor(props(enabled)), {
      initialProps: { enabled: true },
    });
    const pane = render(<FindInMapPanel designer={designer()} closeModal={jest.fn()} />);

    rerender({ enabled: false });
    rerender({ enabled: true });

    expect(shortcutsPaused()).toBe(true);
    pane.unmount();
    expect(shortcutsPaused()).toBe(false);
  });

  it('gives the shortcuts back when the editor unmounts with keyboard events disabled', () => {
    const { unmount } = renderHook(() => useEditor(props(false)));
    expect(shortcutsPaused()).toBe(true);

    unmount();

    expect(shortcutsPaused()).toBe(false);
  });
});
