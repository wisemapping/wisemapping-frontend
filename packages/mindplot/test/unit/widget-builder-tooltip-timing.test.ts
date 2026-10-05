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
import LinkIcon from '../../src/components/LinkIcon';
import LinkModel from '../../src/components/model/LinkModel';
import Topic from '../../src/components/Topic';
import WidgetBuilder, { WidgetEventType } from '../../src/components/WidgetBuilder';

class TestWidgetBuilder extends WidgetBuilder {
  buildEditorForLink(): React.ReactElement {
    throw new Error('not used');
  }

  buidEditorForNote(): React.ReactElement {
    throw new Error('not used');
  }
}

type Listener = (evt: Event) => void;

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;

/** An icon whose element records the listeners, hovered at `iconRect` in the page. */
const fakeIcon = (iconRect: DOMRect) => {
  const listeners: Record<string, Listener> = {};
  const target = document.createElement('span');
  target.getBoundingClientRect = () => iconRect;
  const icon = {
    getElement: () => ({
      addEvent: (type: string, listener: Listener) => {
        listeners[type] = listener;
      },
    }),
  };
  const fire = (type: string) => {
    const event = { target, stopPropagation: jest.fn() } as unknown as Event;
    listeners[type](event);
    return event;
  };
  return { icon: icon as unknown as LinkIcon, fire };
};

const topic = {} as Topic;
let host: HTMLElement;
let shadowRoot: ShadowRoot;

const tooltip = () => shadowRoot.getElementById('mindplot-svg-tooltip')!;

/** Shows a link tooltip for an icon at `iconRect`, in a 400 x 300 map at the page origin. */
const hoverLink = (iconRect: DOMRect, size = { width: 100, height: 40 }) => {
  const builder = new TestWidgetBuilder();
  const { icon, fire } = fakeIcon(iconRect);
  builder.createTooltipForLink(topic, new LinkModel({ url: 'https://example.org' }), icon);
  Object.defineProperty(tooltip(), 'offsetWidth', { configurable: true, value: size.width });
  Object.defineProperty(tooltip(), 'offsetHeight', { configurable: true, value: size.height });
  return { builder, fire };
};

beforeEach(() => {
  jest.useFakeTimers();
  host = document.createElement('div');
  host.id = 'mindmap-comp';
  host.getBoundingClientRect = () => rect(0, 0, 400, 300);
  shadowRoot = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('WidgetBuilder tooltip timing', () => {
  it('shows the tooltip only after the hover delay', () => {
    const { fire } = hoverLink(rect(100, 100, 20, 20));
    const event = fire('mouseenter');
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(tooltip().style.display).not.toBe('block');

    jest.advanceTimersByTime(600);
    expect(tooltip().style.display).toBe('block');
  });

  it('does not show the tooltip when the pointer leaves before the delay', () => {
    const { fire } = hoverLink(rect(100, 100, 20, 20));
    fire('mouseenter');
    jest.advanceTimersByTime(300);
    fire('mouseleave');
    jest.advanceTimersByTime(2000);
    expect(tooltip().style.display).not.toBe('block');
  });

  it('hides the tooltip a second after the pointer leaves the icon', () => {
    const { fire } = hoverLink(rect(100, 100, 20, 20));
    fire('mouseenter');
    jest.advanceTimersByTime(600);
    fire('mouseleave');
    jest.advanceTimersByTime(900);
    expect(tooltip().style.display).toBe('block');
    jest.advanceTimersByTime(200);
    expect(tooltip().style.display).toBe('none');
  });

  it('stays open while the pointer is over the tooltip, and hides after it leaves', () => {
    const { fire } = hoverLink(rect(100, 100, 20, 20));
    fire('mouseenter');
    jest.advanceTimersByTime(600);
    fire('mouseleave');

    tooltip().dispatchEvent(new MouseEvent('mouseover'));
    jest.advanceTimersByTime(2000);
    expect(tooltip().style.display).toBe('block');

    tooltip().dispatchEvent(new MouseEvent('mouseleave'));
    jest.advanceTimersByTime(1000);
    expect(tooltip().style.display).toBe('none');
  });

  it('builds the tooltip once for every icon', () => {
    hoverLink(rect(0, 0, 10, 10));
    hoverLink(rect(0, 0, 10, 10));
    expect(shadowRoot.querySelectorAll('#mindplot-svg-tooltip')).toHaveLength(1);
  });

  it('warns and does nothing without the web component', () => {
    document.body.innerHTML = '';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { icon } = fakeIcon(rect(0, 0, 10, 10));
    new TestWidgetBuilder().createTooltipForLink(
      topic,
      new LinkModel({ url: 'https://a.b' }),
      icon,
    );
    expect(warn).toHaveBeenCalledWith('mindmap-comp element or shadowRoot not found');
  });
});

describe('WidgetBuilder tooltip position', () => {
  const show = (iconRect: DOMRect, size?: { width: number; height: number }) => {
    const { fire } = hoverLink(iconRect, size);
    fire('mouseenter');
    jest.advanceTimersByTime(600);
    return { top: tooltip().style.top, left: tooltip().style.left };
  };

  it('is centred below the icon', () => {
    // Icon centre x = 110: left = 110 - 50; top = icon bottom + 8.
    expect(show(rect(100, 100, 20, 20))).toEqual({ top: '128px', left: '60px' });
  });

  it('goes above an icon near the bottom of the map', () => {
    // Below would end at 290 + 8 + 40 > 300: above, at 280 - 40 - 8.
    expect(show(rect(100, 280, 20, 10))).toEqual({ top: '232px', left: '60px' });
  });

  it('stays inside the map horizontally', () => {
    expect(show(rect(0, 100, 20, 20)).left).toBe('0px');
    expect(show(rect(390, 100, 10, 20)).left).toBe('300px');
  });

  it('stays inside the map vertically when it fits neither above nor below', () => {
    // A 280 px tall tooltip: below ends past 300, above has no room: clamped to 300 - 280.
    expect(show(rect(100, 30, 20, 20), { width: 100, height: 280 }).top).toBe('20px');
  });
});

describe('WidgetBuilder events and container size', () => {
  it('sends the events to the handler', () => {
    const builder = new TestWidgetBuilder();
    const events: [WidgetEventType, Topic | undefined][] = [];
    builder.fireEvent('link', topic);
    builder.addHander((event, target) => events.push([event, target]));
    builder.fireEvent('note', topic);
    builder.fireEvent('none');
    expect(events).toEqual([
      ['note', topic],
      ['none', undefined],
    ]);
  });

  it('measures the web component, or else the window', () => {
    const builder = new TestWidgetBuilder();
    expect(builder.getContainerSize()).toEqual({ width: 400, height: 300 });
    document.body.innerHTML = '';
    expect(builder.getContainerSize()).toEqual({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });
});
