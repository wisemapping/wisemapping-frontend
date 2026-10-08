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

import React, { useContext, useState } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import BaseDialog from '../../../src/components/maps-page/action-dispatcher/base-dialog';
import {
  KeyboardContext,
  useKeyboardContextValue,
} from '../../../src/classes/provider/keyboard-context';
import { renderWithProviders } from '../helpers/render';

const HotkeyState = (): React.ReactElement => {
  const { hotkeyEnabled } = useContext(KeyboardContext);
  return <span data-testid="hotkeys">{hotkeyEnabled ? 'enabled' : 'disabled'}</span>;
};

let setOpenDialogs: (dialogs: string[]) => void = () => undefined;

// Two dialogs open over the page, under the keyboard provider as app.tsx wires it.
const Page = (): React.ReactElement => {
  const keyboardContext = useKeyboardContextValue();
  const [dialogs, setDialogs] = useState(['first', 'second']);
  setOpenDialogs = setDialogs;
  return (
    <KeyboardContext.Provider value={keyboardContext}>
      <HotkeyState />
      {dialogs.map((title) => (
        <BaseDialog key={title} title={title} onClose={jest.fn()}>
          {title}
        </BaseDialog>
      ))}
    </KeyboardContext.Provider>
  );
};

const hotkeys = (): string | null => screen.getByTestId('hotkeys').textContent;

describe('BaseDialog', () => {
  test('keeps the hotkeys disabled until the last open dialog closes', () => {
    renderWithProviders(<Page />);
    expect(hotkeys()).toBe('disabled');

    act(() => setOpenDialogs(['first']));
    expect(hotkeys()).toBe('disabled');

    act(() => setOpenDialogs([]));
    expect(hotkeys()).toBe('enabled');
  });
});

describe('BaseDialog while its request runs', () => {
  test('Escape does not close it, as Cancel is disabled too', () => {
    // A dialog closed mid-request still acted on its result: Create or Duplicate navigated to
    // the new map, and a failed rename lost its error.
    const onClose = jest.fn();
    renderWithProviders(
      <BaseDialog title="Rename" onClose={onClose} onSubmit={jest.fn()} isLoading={true}>
        body
      </BaseDialog>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  test('Escape closes it once the request is over', () => {
    const onClose = jest.fn();
    renderWithProviders(
      <BaseDialog title="Rename" onClose={onClose} onSubmit={jest.fn()}>
        body
      </BaseDialog>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('BaseDialog header', () => {
  test('shows the title and subtitle, and closes from the close button', () => {
    const onClose = jest.fn();
    renderWithProviders(
      <BaseDialog title="Share" description="Add collaborators" onClose={onClose}>
        body
      </BaseDialog>,
    );

    expect(screen.getByRole('heading', { name: /Share/ })).toBeTruthy();
    expect(screen.getByText('Add collaborators')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('the close button waits for the request, as Cancel does', () => {
    renderWithProviders(
      <BaseDialog title="Rename" onClose={jest.fn()} onSubmit={jest.fn()} isLoading={true}>
        body
      </BaseDialog>,
    );

    expect(
      (screen.getByRole('button', { name: 'Close dialog' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
