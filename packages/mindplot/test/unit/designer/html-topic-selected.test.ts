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
import Designer from '../../../src/components/Designer';
import HTMLTopicSelected from '../../../src/components/HTMLTopicSelected';
import type ScreenManager from '../../../src/components/ScreenManager';
import Topic from '../../../src/components/Topic';
import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import type NodeModel from '../../../src/components/model/NodeModel';
import ColorUtil from '../../../src/components/theme/ColorUtil';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

type Listener = (event?: unknown) => void;

/**
 * Stand-in for a Topic: keeps its own listener list (the real one delegates to
 * the SVG group, which needs a layout to render) but runs the real Topic
 * mousedown handler and the real Designer focus logic against it.
 */
class FakeTopic {
  readonly listeners = new Map<string, Listener[]>();

  readonly model = {};

  focused = false;

  connectionColor = '#3f96ff';

  designer: Designer | undefined;

  constructor(readonly name: string) {}

  getDesigner(): Designer | undefined {
    return this.designer;
  }

  addEvent(type: string, fn: Listener): void {
    const list = this.listeners.get(type) || [];
    list.push(fn);
    this.listeners.set(type, list);
  }

  removeEvent(type: string, fn: Listener): void {
    const list = this.listeners.get(type) || [];
    this.listeners.set(
      type,
      list.filter((l) => l !== fn),
    );
  }

  fire(type: string, event?: unknown): void {
    (this.listeners.get(type) || []).slice().forEach((fn) => fn(event));
  }

  count(type: string): number {
    return (this.listeners.get(type) || []).length;
  }

  isOnFocus(): boolean {
    return this.focused;
  }

  setOnFocus(focus: boolean): void {
    if (this.focused !== focus) {
      this.focused = focus;
      this.fire(focus ? 'ontfocus' : 'ontblur', this);
    }
  }

  isReadOnly(): boolean {
    return false;
  }

  isMouseEventsEnabled(): boolean {
    return true;
  }

  closeEditors(): void {
    // Nothing to close.
  }

  getModel(): object {
    return this.model;
  }

  getThemeVariant(): 'light' {
    return 'light';
  }

  getConnectionColor(): string {
    return this.connectionColor;
  }

  getChildren(): Topic[] {
    return [];
  }

  _getTopicEventDispatcher(): null {
    return null;
  }
}

const asTopic = (t: FakeTopic): Topic => t as unknown as Topic;

const buildDesigner = (topics: FakeTopic[]) => {
  const shadows = new Map<Topic, HTMLTopicSelected>();
  const container = document.createElement('div');
  const layoutEventBus = new LayoutEventBus();
  const designer = {
    getLayoutEventBus: () => layoutEventBus,
    isReadOnly: () => false,
    closeNodeEditors: () => undefined,
    getModel: () => ({
      getEntities: () => topics,
      getTopics: () => topics,
      findTopicByModel: (model: object) => topics.find((t) => t.getModel() === model),
      filterSelectedTopics: () => topics.filter((t) => t.isOnFocus()),
      countSelectedTopics: () => topics.filter((t) => t.isOnFocus()).length,
      filterSelectedRelationships: () => [],
      countSelectedRelationships: () => 0,
    }),
    getSelectionShadows: () => shadows,
    getScreenManager: () => ({}) as ScreenManager,
    getContainer: () => container,
    fireEvent: () => undefined,
    onObjectFocusEvent(currentObject?: Topic, event?: MouseEvent) {
      Designer.prototype.onObjectFocusEvent.call(this, currentObject, event);
    },
    selectOnClick(topic: Topic, focus: boolean, event: MouseEvent) {
      Designer.prototype.selectOnClick.call(this, topic, focus, event);
    },
  };
  // selectOnClick and onObjectFocusEvent change the selection through Designer's private batch.
  Object.assign(designer, {
    _selectionBatch: null,
    ensureNodeVisible: () => undefined,
    _setFocusOfAll(focus: boolean, except?: Topic) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Designer.prototype as any)._setFocusOfAll.call(this, focus, except);
    },
    _batchSelection(change: () => void) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Designer.prototype as any)._batchSelection.call(this, change);
    },
    _fireSelectionEvent() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Designer.prototype as any)._fireSelectionEvent.call(this);
    },
  });
  // The topics were built by this designer.
  topics.forEach((topic) => {
    topic.designer = designer as unknown as Designer;
  });
  return { designer: designer as unknown as Designer & typeof designer, container };
};

/**
 * Registers the mousedown listener a real topic gets when its shape is built: it hands the click
 * to its designer's selectOnClick.
 */
const wireTopic = (topic: FakeTopic): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Topic.prototype as any).registerDefaultListenersToElement.call(topic, topic, topic);
};

const mousedown = (topic: FakeTopic, init: MouseEventInit = {}): void => {
  topic.fire('mousedown', new MouseEvent('mousedown', init));
};

const selected = (topics: FakeTopic[]): string[] =>
  topics.filter((t) => t.isOnFocus()).map((t) => t.name);

describe('HTMLTopicSelected', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mouse selection (B-CMDCLICK)', () => {
    let topics: FakeTopic[];
    let designer: ReturnType<typeof buildDesigner>['designer'];

    beforeEach(() => {
      topics = ['a', 'b', 'c', 'd'].map((n) => new FakeTopic(n));
      ({ designer } = buildDesigner(topics));
      topics.forEach((t) => wireTopic(t));
      // Every topic has been selected once, so each one owns a shadow (3rd listener).
      topics.forEach((t) => HTMLTopicSelected.ensureTopicShadow(designer, asTopic(t)));
    });

    const select = (...names: string[]) =>
      topics.forEach((t) => t.setOnFocus(names.includes(t.name)));

    it('a plain click selects only the clicked topic', () => {
      select('a', 'b');
      mousedown(topics[3]!);
      expect(selected(topics)).toEqual(['d']);
    });

    it('a plain click on a selected topic keeps only that topic', () => {
      select('a', 'b', 'c');
      mousedown(topics[1]!);
      expect(selected(topics)).toEqual(['b']);
    });

    it('ctrl/meta-click on an unselected topic adds it to the selection', () => {
      select('a', 'b');
      mousedown(topics[3]!, { ctrlKey: true, metaKey: true });
      expect(selected(topics)).toEqual(['a', 'b', 'd']);
    });

    it('ctrl/meta-click on a selected topic removes only that topic', () => {
      select('a', 'b', 'c');
      mousedown(topics[0]!, { ctrlKey: true, metaKey: true });
      expect(selected(topics)).toEqual(['b', 'c']);
    });

    it('shift-click behaves like a plain click', () => {
      select('a', 'b');
      mousedown(topics[2]!, { shiftKey: true });
      expect(selected(topics)).toEqual(['c']);
    });
  });

  describe('listener lifecycle (B-SHADOWLEAK)', () => {
    it('dispose() removes every listener it added to the topic', () => {
      const topic = new FakeTopic('a');
      const { container } = buildDesigner([topic]);
      const before = ['ontfocus', 'ontblur', 'mousedown'].map((t) => topic.count(t));

      const shadow = new HTMLTopicSelected(asTopic(topic), container, {} as ScreenManager);
      shadow.dispose();

      expect(['ontfocus', 'ontblur', 'mousedown'].map((t) => topic.count(t))).toEqual(before);
    });

    it('re-creating a shadow does not stack topic listeners', () => {
      const topic = new FakeTopic('a');
      const { designer } = buildDesigner([topic]);

      HTMLTopicSelected.ensureTopicShadow(designer, asTopic(topic));
      const counts = ['ontfocus', 'ontblur', 'mousedown'].map((t) => topic.count(t));
      for (let i = 0; i < 3; i++) {
        HTMLTopicSelected.cleanupSelectionShadows(designer);
        HTMLTopicSelected.ensureTopicShadow(designer, asTopic(topic));
      }

      expect(['ontfocus', 'ontblur', 'mousedown'].map((t) => topic.count(t))).toEqual(counts);
    });

    it('initializing twice does not register the LayoutEventBus handlers twice', () => {
      const topic = new FakeTopic('a');
      const { designer } = buildDesigner([topic]);
      const ensure = jest.spyOn(HTMLTopicSelected, 'ensureTopicShadow');

      const first = HTMLTopicSelected.initializeSelectionShadows(designer);
      const second = HTMLTopicSelected.initializeSelectionShadows(designer);
      ensure.mockClear();

      designer.getLayoutEventBus().fireEvent('topicSelected', topic.getModel() as NodeModel);
      expect(ensure).toHaveBeenCalledTimes(1);

      first();
      second();
    });

    it('the returned unsubscribe removes the LayoutEventBus handlers', () => {
      const topic = new FakeTopic('a');
      const { designer } = buildDesigner([topic]);
      const ensure = jest.spyOn(HTMLTopicSelected, 'ensureTopicShadow');

      const unsubscribe = HTMLTopicSelected.initializeSelectionShadows(designer);
      unsubscribe();
      ensure.mockClear();

      designer.getLayoutEventBus().fireEvent('topicSelected', topic.getModel() as NodeModel);
      expect(ensure).not.toHaveBeenCalled();
    });

    it('handlers of different designers do not replace each other', () => {
      const a = new FakeTopic('a');
      const b = new FakeTopic('b');
      const first = buildDesigner([a]).designer;
      const second = buildDesigner([b]).designer;
      const ensure = jest.spyOn(HTMLTopicSelected, 'ensureTopicShadow');

      const unsubscribeFirst = HTMLTopicSelected.initializeSelectionShadows(first);
      const unsubscribeSecond = HTMLTopicSelected.initializeSelectionShadows(second);
      ensure.mockClear();

      second.getLayoutEventBus().fireEvent('topicSelected', b.getModel() as NodeModel);
      expect(ensure).toHaveBeenCalledTimes(1);
      expect(ensure).toHaveBeenCalledWith(second, b);

      unsubscribeFirst();
      unsubscribeSecond();
    });
  });

  describe('plus button hover (B-HOVER)', () => {
    // jsdom normalizes colors, so compare through a style round-trip.
    const normalize = (color: string): string => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = color;
      return probe.style.backgroundColor;
    };

    it('uses the current colors after they change', () => {
      const topic = new FakeTopic('a');
      const { container } = buildDesigner([topic]);
      const shadow = new HTMLTopicSelected(asTopic(topic), container, {} as ScreenManager);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internal = shadow as any;
      internal.ensurePlusButtons();
      const button: HTMLDivElement = internal._rightPlus;

      // Theme change: a new connection color is applied to the existing button.
      topic.connectionColor = '#ff0000';
      internal.updateColors();

      button.dispatchEvent(new MouseEvent('mouseenter'));
      expect(button.style.backgroundColor).toBe(normalize(ColorUtil.lightenColor('#ff0000', 60)));

      button.dispatchEvent(new MouseEvent('mouseleave'));
      expect(button.style.backgroundColor).toBe(normalize(ColorUtil.lightenColor('#ff0000', 40)));

      shadow.dispose();
    });
  });
});
