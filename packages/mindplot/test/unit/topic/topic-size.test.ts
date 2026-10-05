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

import { buildTopics, stubSvgMeasurement, TEXT_WIDTH } from './Helper';

const resizeEvents = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(([type]) => type === 'topicResize');

beforeEach(() => {
  stubSvgMeasurement(TEXT_WIDTH);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Topic.setSize', () => {
  it('stores the rounded size', () => {
    const { child } = buildTopics();
    const size = child.getSize();

    expect(Number.isInteger(size.width)).toBe(true);
    expect(Number.isInteger(size.height)).toBe(true);
  });

  it('does not fire topicResize when a redraw keeps the same fractional size', () => {
    const { child } = buildTopics();

    const spy = jest.spyOn(child.getLayoutEventBus(), 'fireEvent');
    child.redraw(child.getThemeVariant(), false);
    child.redraw(child.getThemeVariant(), false);

    expect(resizeEvents(spy)).toHaveLength(0);
  });

  it('fires topicResize with the rounded size when the text grows', () => {
    const { child } = buildTopics();
    const before = { ...child.getSize() };

    const spy = jest.spyOn(child.getLayoutEventBus(), 'fireEvent');
    stubSvgMeasurement(TEXT_WIDTH + 30);
    child.redraw(child.getThemeVariant(), false);

    const events = resizeEvents(spy);
    expect(events).toHaveLength(1);
    const { size } = events[0][1];
    expect(size).toEqual(child.getSize());
    expect(size.width).toBe(before.width + 30);
  });

  // The layout manager owns topic positions and only reports nodes it moved.
  // Shifting the topic here would leave it misplaced whenever the layout keeps
  // the node where it was (for example, a single child in the tree layout).
  it('keeps the topic centred on its model position when it grows', () => {
    const { child } = buildTopics();
    const position = { ...child.getPosition() };

    stubSvgMeasurement(TEXT_WIDTH + 30);
    child.redraw(child.getThemeVariant(), false);

    expect(child.getPosition()).toEqual(position);
    const size = child.getSize();
    expect(child.get2DElement().getPosition()).toEqual({
      x: position.x - size.width / 2,
      y: position.y - size.height / 2,
    });
  });
});

describe('Topic.setSize with a failed measurement (BL-13)', () => {
  it.each([NaN, Infinity])(
    'keeps the previous size and does not fire topicResize when the text measures %s',
    (width) => {
      const { child } = buildTopics();
      const before = { ...child.getSize() };

      const spy = jest.spyOn(child.getLayoutEventBus(), 'fireEvent');
      stubSvgMeasurement(width);
      child.redraw(child.getThemeVariant(), false);
      child.redraw(child.getThemeVariant(), false);

      expect(resizeEvents(spy)).toHaveLength(0);
      expect(child.getSize()).toEqual(before);
    },
  );

  it('keeps the previous size when forced with a non-finite size', () => {
    const { child } = buildTopics();
    const before = { ...child.getSize() };

    child.setSize({ width: NaN, height: before.height }, true);

    expect(child.getSize()).toEqual(before);
  });
});
