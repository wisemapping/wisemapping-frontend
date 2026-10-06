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
import { buildDesigner, SAMPLE_MAP } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The plus buttons of the selection overlay: one adds a child, the other a
 * sibling, depending on the layout; a tap must add one topic, not two.
 */

type PlusButtons = { _rightPlus: HTMLDivElement; _bottomPlus: HTMLDivElement };

const harnesses: Harness[] = [];
const open = async (xml = SAMPLE_MAP) => {
  const harness = await buildDesigner(xml);
  harnesses.push(harness);
  harness.designer.deselectAll();
  harness.topic(1).setOnFocus(true);
  const shadow = harness.designer
    .getSelectionShadows()
    .get(harness.topic(1)) as unknown as PlusButtons;
  return { harness, right: shadow._rightPlus, bottom: shadow._bottomPlus };
};

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const childrenOf = (harness: Harness, id: number) => harness.topic(id).getChildren().length;
const topicCount = (harness: Harness) => harness.designer.getModel().getTopics().length;

describe('Selection plus buttons on a mind map', () => {
  it('adds a child with the right button, undoably', async () => {
    const { harness, right } = await open();
    const before = harness.save();
    expect(right.title).toBe('Create child topic');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    right.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(childrenOf(harness, 1)).toBe(2);

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it('adds a sibling with the bottom button', async () => {
    const { harness, bottom } = await open();
    bottom.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(childrenOf(harness, 1)).toBe(1);
    expect(childrenOf(harness, 0)).toBe(3);
  });
});

describe('Selection plus buttons on a tree', () => {
  const TREE = SAMPLE_MAP.replace('version="tango"', 'version="tango" layout="tree"');

  it('adds a sibling with the right button and a child with the bottom one', async () => {
    const { harness, right, bottom } = await open(TREE);
    right.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(childrenOf(harness, 0)).toBe(3);

    harness.designer.deselectAll();
    harness.topic(1).setOnFocus(true);
    bottom.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(childrenOf(harness, 1)).toBe(2);
  });
});

describe('Selection plus buttons on a touch screen', () => {
  it('adds one topic for a tap, ignoring the click the browser sends after it', async () => {
    const { harness, right } = await open();
    jest.useFakeTimers();
    const count = topicCount(harness);

    right.dispatchEvent(new Event('touchstart', { bubbles: true }));
    right.dispatchEvent(new Event('touchend', { bubbles: true, cancelable: true }));
    right.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(topicCount(harness)).toBe(count + 1);

    // A later click, once the tap is over, adds another one.
    jest.advanceTimersByTime(300);
    harness.designer.deselectAll();
    harness.topic(1).setOnFocus(true);
    right.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(topicCount(harness)).toBe(count + 2);
  });

  it('shows the hover colour while touched, and the base colour after', async () => {
    const { right } = await open();
    jest.useFakeTimers();
    const colors = right as unknown as { _baseColor: string; _hoverColor: string };
    const base = right.style.backgroundColor;
    expect(colors._hoverColor).toBeTruthy();

    right.dispatchEvent(new Event('touchstart'));
    expect(right.style.backgroundColor).not.toBe(base);

    right.dispatchEvent(new Event('touchcancel'));
    expect(right.style.backgroundColor).toBe(base);

    right.dispatchEvent(new Event('touchstart'));
    right.dispatchEvent(new Event('touchend', { cancelable: true }));
    jest.advanceTimersByTime(150);
    expect(right.style.backgroundColor).toBe(base);
  });

  it('keeps a touch on a button from reaching the canvas', async () => {
    const { harness, right } = await open();
    const reached = jest.fn();
    harness.designer.getContainer().addEventListener('touchstart', reached);
    right.dispatchEvent(new Event('touchstart', { bubbles: true }));
    expect(reached).not.toHaveBeenCalled();
  });
});
