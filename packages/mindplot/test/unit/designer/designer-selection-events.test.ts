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
import type { Harness } from '../commands/designer-harness';
import { buildDesigner } from '../commands/designer-harness';
import type Topic from '../../../src/components/Topic';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/*
 * The editor reads the selection again only on the designer's 'onfocus' and 'onblur' events
 * (useSelection, the font pane). After the last event of a click, what it reads must be the
 * selection the click left.
 */

const groupOf = (topic: Topic): SVGElement =>
  (topic.get2DElement() as unknown as { peer: { _native: SVGElement } }).peer._native;

const harnesses: Harness[] = [];

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  jest.restoreAllMocks();
});

/** A designer with nothing selected, and the selected topic count at each designer event. */
const open = async () => {
  const harness = await buildDesigner();
  harnesses.push(harness);
  const { designer, topic } = harness;
  designer.deselectAll();
  const events: string[] = [];
  const record = (type: string) => () => {
    events.push(`${type}:${designer.getModel().countSelectedTopics()}`);
  };
  designer.addEvent('onfocus', record('onfocus'));
  designer.addEvent('onblur', record('onblur'));
  const mouseDown = (id: number, init: MouseEventInit = {}) => {
    groupOf(topic(id)).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, ...init }));
  };
  return { ...harness, events, mouseDown };
};

describe('Designer selection events on a click', () => {
  it('a click on a topic of a multi-selection reports the one topic left selected', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(1);
    mouseDown(3, { ctrlKey: true });
    mouseDown(4, { ctrlKey: true });
    expect(designer.getModel().countSelectedTopics()).toBe(3);
    events.splice(0);

    mouseDown(3);

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(3)]);
    // Before: no event, so the editor kept showing three topics selected.
    expect(events).toEqual(['onfocus:1']);
  });

  it('a click on a topic outside the selection ends reporting that topic alone', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(1);
    mouseDown(3, { ctrlKey: true });
    events.splice(0);

    mouseDown(4);

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(4)]);
    // Before: only 'onfocus:3', fired when topic 4 was selected and the others not yet unselected.
    expect(events[events.length - 1]).toBe('onfocus:1');
  });

  it('a click on the only selected topic fires nothing', async () => {
    const { events, mouseDown } = await open();
    mouseDown(1);
    events.splice(0);

    mouseDown(1);

    expect(events).toEqual([]);
  });

  it('a click on another topic than the only selected one ends reporting that topic', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(1);
    events.splice(0);

    mouseDown(3);

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(3)]);
    expect(events[events.length - 1]).toBe('onfocus:1');
  });

  it('a Ctrl or Cmd click that unselects one topic of a multi-selection reports the rest', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(1);
    mouseDown(3, { ctrlKey: true });
    mouseDown(4, { ctrlKey: true });
    events.splice(0);

    mouseDown(3, { ctrlKey: true });

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(1), topic(4)]);
    // Before: no event, so the editor kept showing three topics selected.
    expect(events).toEqual(['onfocus:2']);
  });

  it('a Ctrl or Cmd click that unselects the last selected topic reports an empty selection', async () => {
    const { events, mouseDown } = await open();
    mouseDown(1);
    events.splice(0);

    mouseDown(1, { ctrlKey: true });

    expect(events).toEqual(['onblur:0']);
  });

  it('selecting all and deselecting all still fire one event each', async () => {
    const { designer, events } = await open();

    designer.selectAll();
    designer.deselectAll();

    expect(events).toEqual(['onfocus:6', 'onblur:0']);
  });
});
