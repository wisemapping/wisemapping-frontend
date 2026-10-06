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
import WidgetBuilder from '../../../src/components/WidgetBuilder';
import LinkModel from '../../../src/components/model/LinkModel';
import NoteModel from '../../../src/components/model/NoteModel';
import type LinkIcon from '../../../src/components/LinkIcon';
import type NoteIcon from '../../../src/components/NoteIcon';
import type Topic from '../../../src/components/Topic';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

class TestWidgetBuilder extends WidgetBuilder {
  buildEditorForLink(): React.ReactElement {
    throw new Error('not used');
  }

  buidEditorForNote(): React.ReactElement {
    throw new Error('not used');
  }
}

type Listener = (evt: Event) => void;

/** An icon whose element records the listeners the widget builder registers on it. */
const fakeIcon = () => {
  const listeners: Record<string, Listener> = {};
  const icon = {
    getElement: () => ({
      addEvent: (type: string, listener: Listener) => {
        listeners[type] = listener;
      },
    }),
  };
  const fire = (type: 'mouseenter' | 'mouseleave') => {
    const target = document.createElement('span');
    listeners[type]!({ target, stopPropagation: () => {} } as unknown as Event);
    jest.runOnlyPendingTimers();
  };
  return { icon, fire };
};

type Map = { harness: Harness; host: HTMLElement; shadowRoot: ShadowRoot };

/** A map in a web component: its canvas is in the shadow DOM of `host`. */
const buildInShadowRoot = async (id?: string): Promise<Map> => {
  const host = document.body.appendChild(document.createElement('div'));
  if (id) {
    host.id = id;
  }
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const container = shadowRoot.appendChild(document.createElement('div'));
  return { harness: await buildDesigner(undefined, container), host, shadowRoot };
};

const tooltipOf = (map: Map): HTMLElement | null =>
  map.shadowRoot.getElementById('mindplot-svg-tooltip');

// BL5-192: the tooltips were placed in the web component with id mindmap-comp, whatever the map.
describe('WidgetBuilder tooltips with two designers on the page', () => {
  let first: Map;
  let second: Map;

  beforeEach(async () => {
    // The first map has the editor's id: the tooltips of the second must not go there.
    first = await buildInShadowRoot('mindmap-comp');
    second = await buildInShadowRoot();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    [first, second].forEach(({ harness }) => harness.designer.dispose());
    document.body.innerHTML = '';
  });

  const hoverLink = (topic: Topic, url: string) => {
    const { icon, fire } = fakeIcon();
    new TestWidgetBuilder().createTooltipForLink(
      topic,
      new LinkModel({ url }),
      icon as unknown as LinkIcon,
    );
    fire('mouseenter');
    return fire;
  };

  const hoverNote = (topic: Topic, text: string) => {
    const { icon, fire } = fakeIcon();
    new TestWidgetBuilder().configureTooltipForNode(
      topic,
      new NoteModel({ text }),
      icon as unknown as NoteIcon,
    );
    fire('mouseenter');
    return fire;
  };

  it("shows a link tooltip in its own map's web component", () => {
    hoverLink(second.harness.topic(1), 'https://second.example.org');

    expect(tooltipOf(first)).toBeNull();
    expect(tooltipOf(second)?.style.display).toBe('block');
    expect(second.shadowRoot.getElementById('mindplot-svg-tooltip-content-link')?.textContent).toBe(
      'https://second.example.org',
    );
  });

  it("shows a note tooltip in its own map's web component", () => {
    hoverNote(first.harness.topic(1), 'first note');
    hoverNote(second.harness.topic(2), 'second note');

    expect(first.shadowRoot.getElementById('mindplot-svg-tooltip-content-note')?.textContent).toBe(
      'first note',
    );
    expect(second.shadowRoot.getElementById('mindplot-svg-tooltip-content-note')?.textContent).toBe(
      'second note',
    );
  });

  it('hides the tooltip of the map it was shown in', () => {
    const fire = hoverLink(second.harness.topic(1), 'https://second.example.org');

    fire('mouseleave');

    expect(tooltipOf(second)?.style.display).toBe('none');
  });

  it("measures the topic's own web component", () => {
    second.host.getBoundingClientRect = () => ({ width: 320, height: 240 }) as DOMRect;

    expect(new TestWidgetBuilder().getContainerSize(second.harness.topic(1))).toEqual({
      width: 320,
      height: 240,
    });
  });
});
