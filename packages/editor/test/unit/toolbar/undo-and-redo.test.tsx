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
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import UndoAndRedo from '../../../src/components/action-widget/button/undo-and-redo';
import type Model from '../../../src/classes/model/editor';

type Listener = (event?: unknown) => void;

/** A Model stand-in whose designer records its modelUpdate listeners. */
const createModel = (loaded = true) => {
  const listeners: Listener[] = [];
  const state = { loaded };
  const designer = {
    addEvent: (_type: string, listener: Listener) => {
      listeners.push(listener);
    },
    removeEvent: (_type: string, listener: Listener) => {
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    },
  };
  const model = {
    isMapLoadded: () => state.loaded,
    getDesigner: () => designer,
  } as unknown as Model;

  return {
    model,
    state,
    listeners,
    fire: (undoSteps: number) =>
      act(() => {
        [...listeners].forEach((l) => l({ undoSteps, redoSteps: 0 }));
      }),
  };
};

const Undo = ({ model }: { model: Model | undefined }) => (
  <UndoAndRedo
    configuration={{ icon: <UndoOutlinedIcon />, ariaLabel: 'Undo', onClick: jest.fn() }}
    disabledCondition={(event) => event.undoSteps > 0}
    model={model}
  />
);

const undoButton = () => screen.getByRole('button', { name: 'Undo' });

describe('UndoAndRedo (BL4-58)', () => {
  it('enables the button when the designer reports undo steps', () => {
    const { model, fire } = createModel();
    render(<Undo model={model} />);
    expect(undoButton()).toBeDisabled();

    fire(1);

    expect(undoButton()).toBeEnabled();
  });

  it('removes its modelUpdate listener when it unmounts', () => {
    const { model, listeners } = createModel();
    const { unmount } = render(<Undo model={model} />);
    expect(listeners).toHaveLength(1);

    unmount();

    expect(listeners).toHaveLength(0);
  });

  it('subscribes once the map has loaded', () => {
    const { model, state, listeners, fire } = createModel(false);
    const { rerender } = render(<Undo model={model} />);
    expect(listeners).toHaveLength(0);

    state.loaded = true;
    rerender(<Undo model={model} />);
    fire(1);

    expect(listeners).toHaveLength(1);
    expect(undoButton()).toBeEnabled();
  });

  it('follows a new model, and drops the listener on the previous one', () => {
    const first = createModel();
    const second = createModel();
    const { rerender } = render(<Undo model={first.model} />);

    rerender(<Undo model={second.model} />);

    expect(first.listeners).toHaveLength(0);
    expect(second.listeners).toHaveLength(1);
  });
});
