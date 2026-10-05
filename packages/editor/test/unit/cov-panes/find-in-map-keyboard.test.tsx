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
import { fireEvent, screen } from '@testing-library/react';
import type { Designer, Topic } from '@wisemapping/mindplot';
import FindInMapPanel from '../../../src/components/action-widget/pane/find-in-map';
import { renderPane } from './helpers';

jest.mock('@wisemapping/mindplot', () => ({
  DesignerKeyboard: { pause: jest.fn(), resume: jest.fn() },
}));

const topic = (id: number, text: string, children: Topic[] = []): Topic =>
  ({
    getId: () => id,
    getText: () => text,
    getModel: () => ({ getPlainText: () => text }),
    getChildren: () => children,
  }) as unknown as Topic;

/** Central > [Alpha node, Beta node, Gamma node]; topic 4 is missing from the designer. */
const harness = () => {
  const central = topic(1, 'Central', [
    topic(2, 'Alpha node'),
    topic(3, 'Beta node'),
    topic(4, 'Gamma node'),
  ]);
  const revealNode = jest.fn();
  const designer = {
    getModel: () => ({
      getCentralTopic: () => central,
      findTopicById: (id: number) => (id === 4 ? undefined : topic(id, `topic ${id}`)),
    }),
    revealNode,
  } as unknown as Designer;
  const closeModal = jest.fn();
  renderPane(<FindInMapPanel designer={designer} closeModal={closeModal} />);
  const revealedIds = (): number[] =>
    revealNode.mock.calls.map(([revealed]) => (revealed as Topic).getId());
  return { revealNode, revealedIds, closeModal };
};

const field = (): HTMLElement => screen.getByPlaceholderText('Find node...');
const counter = (): string => screen.getByTestId('find-in-map-counter').textContent ?? '';
const key = (k: string, extra: Partial<KeyboardEventInit> = {}): void => {
  fireEvent.keyDown(field(), { key: k, ...extra });
};

describe('FindInMapPanel keyboard and edge cases', () => {
  it('steps through matches with Enter, Shift+Enter and the arrow keys, wrapping around', () => {
    const { revealedIds, revealNode } = harness();
    fireEvent.change(field(), { target: { value: 'node' } });
    expect(counter()).toBe('1 of 3');
    revealNode.mockClear();

    key('Enter');
    expect(counter()).toBe('2 of 3');
    key('ArrowDown');
    expect(counter()).toBe('3 of 3');
    key('ArrowDown');
    expect(counter()).toBe('1 of 3');
    key('ArrowUp');
    expect(counter()).toBe('3 of 3');
    key('Enter', { shiftKey: true });
    expect(counter()).toBe('2 of 3');

    // Gamma (id 4) is not in the designer, so stepping onto it reveals nothing.
    expect(revealedIds()).toEqual([3, 2, 3]);
  });

  it('ignores other keys', () => {
    const { closeModal } = harness();
    fireEvent.change(field(), { target: { value: 'node' } });

    key('a');

    expect(counter()).toBe('1 of 3');
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('closes on Escape without letting the key reach the map', () => {
    const { closeModal } = harness();
    const mapShortcuts = jest.fn();
    document.addEventListener('keydown', mapShortcuts);

    key('Escape');

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(mapShortcuts).not.toHaveBeenCalled();
    document.removeEventListener('keydown', mapShortcuts);
  });

  it('reports no matches and does nothing on navigation keys', () => {
    const { revealNode } = harness();
    fireEvent.change(field(), { target: { value: 'missing' } });

    expect(counter()).toBe('No matches');
    expect(screen.getByText('No node matches “missing”.')).toBeTruthy();
    expect((screen.getByLabelText('Next match') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Previous match') as HTMLButtonElement).disabled).toBe(true);

    key('Enter');
    key('ArrowUp');
    expect(revealNode).not.toHaveBeenCalled();
  });

  it('highlights the matched part of each result', () => {
    harness();
    fireEvent.change(field(), { target: { value: '  BETA ' } });

    const highlighted = screen.getByText('Beta');
    expect(highlighted.parentElement?.textContent).toBe('Beta node');
    expect(highlighted.parentElement?.getAttribute('title')).toBe('Beta node');
  });

  it('clears the search from the clear button', () => {
    harness();
    expect(screen.queryByLabelText('Clear search')).toBeNull();
    fireEvent.change(field(), { target: { value: 'node' } });

    fireEvent.click(screen.getByLabelText('Clear search'));

    expect((field() as HTMLInputElement).value).toBe('');
    expect(screen.queryByTestId('find-in-map-results')).toBeNull();
    expect(screen.queryByTestId('find-in-map-counter')).toBeNull();
  });
});
