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
import DesignerKeyboard from '../../../src/components/DesignerKeyboard';
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
    // Before: 'onfocus:3', fired when topic 4 was selected and the others not yet unselected,
    // then 'onfocus:1'.
    expect(events).toEqual(['onfocus:1']);
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
    // Before: 'onfocus:2', then 'onfocus:1'.
    expect(events).toEqual(['onfocus:1']);
  });

  it('a Ctrl or Cmd click that adds a topic reports the larger selection once', async () => {
    const { events, mouseDown } = await open();
    mouseDown(1);
    mouseDown(3, { ctrlKey: true });
    events.splice(0);

    mouseDown(4, { ctrlKey: true });

    expect(events).toEqual(['onfocus:3']);
  });

  it('a click on the background reports the empty selection once', async () => {
    const { designer, events, mouseDown } = await open();
    mouseDown(1);
    mouseDown(3, { ctrlKey: true });
    events.splice(0);

    designer.getWorkSpace().getScreenManager().fireEvent('click');

    expect(events).toEqual(['onblur:0']);
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

describe('Designer selection on a click with a modifier', () => {
  /*
   * The multi-selection modifier is the platform's shortcut key, as for every other shortcut:
   * Cmd on a Mac, Ctrl elsewhere. A Mac shows a context menu on Ctrl-click (the right click of a
   * one-button mouse), so there it is a plain click, as the Windows key is elsewhere. The topic
   * and the designer decide it together: the topic whether to toggle, the designer whether to keep
   * the rest of the selection.
   */
  const onPlatform = (platform: string) => {
    Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
  };

  afterEach(() => {
    // Back to the jsdom getter, on Navigator.prototype.
    delete (window.navigator as { platform?: string }).platform;
  });

  it('a Cmd click on a Mac adds a topic and a second one removes it', async () => {
    onPlatform('MacIntel');
    const { designer, mouseDown, topic } = await open();
    mouseDown(1);

    mouseDown(3, { metaKey: true });
    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(1), topic(3)]);

    mouseDown(3, { metaKey: true });
    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(1)]);
  });

  it('a Ctrl click on a Mac is a plain click: it selects that topic alone', async () => {
    onPlatform('MacIntel');
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(1);
    events.splice(0);

    mouseDown(3, { ctrlKey: true });

    // Before: topic 1 stayed selected, and a second Ctrl click could not unselect topic 3.
    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(3)]);
    expect(events).toEqual(['onfocus:1']);
  });

  it('a click with the Windows key elsewhere is a plain click: it selects that topic alone', async () => {
    onPlatform('Win32');
    const { designer, mouseDown, topic } = await open();
    mouseDown(1);

    mouseDown(3, { metaKey: true });

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(3)]);
  });
});

describe('Designer selection events on the keyboard', () => {
  const move = (designer: Harness['designer'], direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    const keyboard = Object.create(DesignerKeyboard.prototype);
    keyboard._moveSelection(designer, direction);
  };

  it('an arrow with nothing selected reports the central topic once', async () => {
    const { designer, events, topic } = await open();

    move(designer, 'RIGHT');

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(0)]);
    // Before: 'onfocus:1' only because deselectAll had nothing to unselect.
    expect(events).toEqual(['onfocus:1']);
  });

  it('an arrow to a child reports that child alone, once', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(0);
    events.splice(0);

    move(designer, 'RIGHT');

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(1)]);
    // Before: 'onblur:0' from deselectAll, then 'onfocus:1'.
    expect(events).toEqual(['onfocus:1']);
  });

  it('an arrow to the parent reports that parent alone, once', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(2);
    events.splice(0);

    move(designer, 'LEFT');

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(1)]);
    // Before: 'onblur:0' from deselectAll, then 'onfocus:1'.
    expect(events).toEqual(['onfocus:1']);
  });

  it('going to a node keeps it alone selected, with one event', async () => {
    const { designer, events, mouseDown, topic } = await open();
    mouseDown(1);
    mouseDown(3, { ctrlKey: true });
    events.splice(0);

    designer.goToNode(topic(4));

    expect(designer.getModel().filterSelectedTopics()).toEqual([topic(4)]);
    // Before: 'onfocus:3', then 'onfocus:1'.
    expect(events).toEqual(['onfocus:1']);
  });
});
