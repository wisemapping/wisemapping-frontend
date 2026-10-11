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
import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Mindmap } from '@wisemapping/mindplot';
import OutlineViewDialog from '../../../src/components/action-widget/pane/outline-view-dialog';

const mindmapWith = (id: string, centralText: string, topicText: string) => {
  const mindmap = new Mindmap(id);
  const central = mindmap.createNode('CentralTopic', 0);
  central.setText(centralText);
  mindmap.addBranch(central);
  const topic = mindmap.createNode('MainTopic', 1);
  topic.setText(topicText);
  central.append(topic);
  return { mindmap, topic };
};

const dialog = (open: boolean, mindmap: Mindmap): ReactElement => (
  <IntlProvider locale="en" messages={{}}>
    <OutlineViewDialog open={open} onClose={jest.fn()} mindmap={mindmap} />
  </IntlProvider>
);

describe('Outline view refresh', () => {
  test('rebuilds the outline from the map each time it opens', () => {
    const { mindmap, topic } = mindmapWith('outline-reopen', 'Central', 'First text');
    const { rerender } = render(dialog(true, mindmap));
    expect(screen.getByText('First text')).toBeTruthy();

    rerender(dialog(false, mindmap));
    topic.setText('Edited text');
    rerender(dialog(true, mindmap));

    expect(screen.getByText('Edited text')).toBeTruthy();
    expect(screen.queryByText('First text')).toBeNull();
  });

  test('shows another map as soon as it is given one', () => {
    const first = mindmapWith('outline-first', 'First map', 'Topic of first');
    const second = mindmapWith('outline-second', 'Second map', 'Topic of second');
    const { rerender } = render(dialog(true, first.mindmap));

    rerender(dialog(true, second.mindmap));

    expect(screen.getByText('Second map')).toBeTruthy();
    expect(screen.getByText('Topic of second')).toBeTruthy();
    expect(screen.queryByText('Topic of first')).toBeNull();
  });
});
