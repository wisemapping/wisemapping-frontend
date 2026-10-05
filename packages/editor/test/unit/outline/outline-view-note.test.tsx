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
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ContentType, Mindmap, NoteModel } from '@wisemapping/mindplot';
import OutlineViewDialog from '../../../src/components/action-widget/pane/outline-view-dialog';

const mindmapWithNote = (text: string): Mindmap => {
  const mindmap = new Mindmap('outline-note');
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText('Central');
  mindmap.addBranch(central);
  const topic = mindmap.createNode('MainTopic', 1);
  topic.setText('Noted');
  topic.addFeature(new NoteModel({ text, contentType: ContentType.HTML }));
  central.append(topic);
  return mindmap;
};

const showNote = (text: string): HTMLElement => {
  render(
    <IntlProvider locale="en" messages={{}}>
      <OutlineViewDialog open onClose={jest.fn()} mindmap={mindmapWithNote(text)} />
    </IntlProvider>,
  );
  fireEvent.mouseEnter(screen.getByLabelText('note'));
  return screen.getByText('Note').parentElement!;
};

describe('Outline view note', () => {
  test('shows the nested lists of the note, with links opening in a new tab', () => {
    const note = showNote(
      '<ul><li>a<ul><li>b <a href="https://example.org">site</a></li></ul></li></ul>',
    );

    const link = note.querySelector('li li a')!;
    expect(link.getAttribute('href')).toBe('https://example.org');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('sanitizes the note', () => {
    const hook = jest.fn();
    (window as unknown as { __outlineXss: () => void }).__outlineXss = hook;

    const note = showNote(
      '<p>x</p><img src="x" onerror="window.__outlineXss()"><a href="javascript:alert(1)">bad</a>',
    );

    expect(note.innerHTML).not.toMatch(/onerror|javascript:/i);
    expect(hook).not.toHaveBeenCalled();
  });
});
