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
import ArcLine from '../../src/components/ArcLine';
import Arrow from '../../src/components/Arrow';
import CurvedLine from '../../src/components/CurvedLine';
import Ellipse from '../../src/components/Ellipse';
import Group from '../../src/components/Group';
import HeartbeatLine from '../../src/components/HeartbeatLine';
import Image from '../../src/components/Image';
import NeuronLine from '../../src/components/NeuronLine';
import PolyLine from '../../src/components/PolyLine';
import Rect from '../../src/components/Rect';
import Text from '../../src/components/Text';
import Workspace from '../../src/components/Workspace';
import ElementPeer from '../../src/components/peer/svg/ElementPeer';

/*
 * Deterministic performance counts (WEB2D_REVIEW_PLAN.md section 5, rollout W2). Each test counts
 * calls rather than timing them, so it is stable on any machine.
 */

type Counter = { n: number; restore: () => void };

/** Counts the calls to `obj[name]` for which `filter` holds. The method still runs. */
const countCalls = (
  obj: object,
  name: string,
  filter: (self: unknown, args: unknown[]) => boolean = () => true,
): Counter => {
  const target = obj as Record<string, (...args: unknown[]) => unknown>;
  const original = target[name]!;
  const counter: Counter = {
    n: 0,
    restore: () => {
      target[name] = original;
    },
  };
  target[name] = function counted(this: unknown, ...args: unknown[]) {
    if (filter(this, args)) {
      counter.n += 1;
    }
    return original.apply(this, args);
  };
  return counter;
};

const createWorkspace = (): Workspace => {
  const workspace = new Workspace();
  document.body.append(workspace._getHtmlContainer());
  return workspace;
};

/** A group shaped like a mindplot topic, plus its connection line, appended to the workspace. */
const addTopic = (workspace: Workspace, i: number): void => {
  const group = new Group({ width: 100, height: 40, coordSizeWidth: 100, coordSizeHeight: 40 });
  workspace.append(group);
  group.append(new Rect(0.3, { width: 104, height: 44 }));
  group.append(new Rect(0.3, { width: 100, height: 40 }));
  const text = new Text();
  group.append(text);
  text.setText('Topic');
  const icons = new Group({ width: 30, height: 15, coordSizeWidth: 0, coordSizeHeight: 15 });
  group.append(icons);
  icons.append(new Image({ width: 15, height: 15 }));
  icons.append(new Image({ width: 15, height: 15 }));
  icons.setCoordSize(30, 15);
  group.append(new Ellipse({ width: 6, height: 6 }));
  const line = new CurvedLine();
  workspace.append(line);
  line.moveToBack();
  group.setSize(100, 40);
  group.setPosition(i, i);
};

describe('W-BROADCAST: no subtree walk on append, setSize or setCoordSize', () => {
  // The VML change broadcast walked the subtree (getChildren on every node) on each append,
  // setSize and setCoordSize, and an append to the workspace walked the whole workspace. Building
  // this scene used to cost 9,068,001 visits, and every zoom step visited every element again.
  it('building 1000 topic-like groups visits no element', () => {
    const workspace = createWorkspace();
    const visits = countCalls(ElementPeer.prototype, 'getChildren');
    try {
      for (let i = 0; i < 1000; i++) {
        addTopic(workspace, i);
      }
      workspace.setCoordSize(1000, 1000);
      workspace.setCoordSize(2000, 2000);
    } finally {
      visits.restore();
    }
    expect(visits.n).toBe(0);
    expect(workspace.getSVGElement().querySelectorAll('g')).toHaveLength(2000);
    expect(workspace.getSVGElement().querySelectorAll('path')).toHaveLength(1000);
  });

  it('the broadcast API is gone', () => {
    const proto = ElementPeer.prototype as unknown as Record<string, unknown>;
    expect(proto.attachChangeEventListener).toBeUndefined();
    expect(proto.getChangeEventListeners).toBeUndefined();
    expect(proto.updateStrokeStyle).toBeUndefined();
  });
});

/** The calls on `root` or any node inside it. */
const inside =
  (root: Element) =>
  (self: unknown): boolean =>
    self instanceof Node && (self === root || root.contains(self));

/** The DOM writes made on `root` and its descendants, by kind. */
const countWrites = (root: Element) => {
  const counters = [
    countCalls(Element.prototype, 'setAttribute', inside(root)),
    countCalls(Element.prototype, 'removeAttribute', inside(root)),
    countCalls(Node.prototype, 'appendChild', inside(root)),
    countCalls(Node.prototype, 'removeChild', inside(root)),
  ];
  return {
    total: () => counters.reduce((sum, c) => sum + c.n, 0),
    restore: () => counters.forEach((c) => c.restore()),
  };
};

/** The text part of mindplot's Topic.redraw (Topic.ts:1306-1351, 1461-1481). */
const redrawTopicText = (text: Text, label: string): void => {
  text.setColor('#222222');
  text.setFontSize(10);
  text.setWeight('bold');
  text.setStyle('normal');
  text.setFontName('Arial');
  text.setText(label);
  text.getShapeWidth();
  text.getShapeHeight();
  text.getFontHeight();
  text.setVisibility(true);
  text.setPosition(10.5, 20.25);
};

describe('Text redraw', () => {
  const setup = () => {
    const workspace = createWorkspace();
    const group = new Group();
    workspace.append(group);
    const text = new Text();
    group.append(text);
    redrawTopicText(text, 'Hello\nworld');
    return text;
  };

  // Before: 22 setAttribute calls, plus 2 tspans removed and 2 created, on every redraw.
  it('an unchanged redraw makes 0 DOM writes', () => {
    const text = setup();
    const writes = countWrites(text.peer._native);
    const opacity = text.peer._native.style.opacity;
    try {
      redrawTopicText(text, 'Hello\nworld');
    } finally {
      writes.restore();
    }
    expect(writes.total()).toBe(0);
    expect(text.peer._native.style.opacity).toBe(opacity);
  });

  it('a redraw that changes one line rewrites only that line', () => {
    const text = setup();
    const writes = countWrites(text.peer._native);
    const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent')!;
    const content = {
      n: 0,
      restore: () => Object.defineProperty(Node.prototype, 'textContent', descriptor),
    };
    Object.defineProperty(Node.prototype, 'textContent', {
      ...descriptor,
      set(this: Node, value: string) {
        content.n += 1;
        descriptor.set!.call(this, value);
      },
    });
    try {
      redrawTopicText(text, 'Hello\nthere');
    } finally {
      writes.restore();
      content.restore();
    }
    expect(writes.total()).toBe(0);
    expect(content.n).toBe(1);
  });

  // Before: 3 getBBox calls (getShapeWidth, getShapeHeight, getFontHeight) on every redraw, each
  // forcing a synchronous layout.
  it('measures once per change, and not at all on an unchanged redraw', () => {
    const text = setup();
    const bbox = countCalls(window.SVGElement.prototype, 'getBBox', inside(text.peer._native));
    try {
      redrawTopicText(text, 'Hello\nworld');
      expect(bbox.n).toBe(0);
      redrawTopicText(text, 'Hello\nthere');
      expect(bbox.n).toBe(1);
      text.setFontSize(12);
      text.getShapeWidth();
      text.getShapeHeight();
      expect(bbox.n).toBe(2);
    } finally {
      bbox.restore();
    }
  });
});

describe('Line redraw', () => {
  // Before: an unchanged curved-line redraw rewrote `d` once (setFill), and a polyline rewrote
  // `points` 4 times (setFrom, setTo, setStyle, setOrientation).
  it('an unchanged curved-line redraw builds and writes no path', () => {
    const workspace = createWorkspace();
    const line = new CurvedLine();
    workspace.append(line);
    const redraw = () => {
      line.setFrom(0, 0);
      line.setTo(100, 50);
      line.setSrcControlPoint({ x: 30, y: 0 });
      line.setDestControlPoint({ x: -30, y: 0 });
      line.setWidth(10);
      line.setFill('red', 1);
      line.setStroke(1, 'solid', 'red', 1);
    };
    redraw();
    const builds = countCalls(Object.getPrototypeOf(line.peer) as object, '_renderPath');
    const writes = countWrites(line.peer._native);
    try {
      redraw();
    } finally {
      builds.restore();
      writes.restore();
    }
    expect(builds.n).toBe(0);
    expect(writes.total()).toBe(0);
  });

  it('an unchanged polyline redraw builds and writes no points', () => {
    const workspace = createWorkspace();
    const line = new PolyLine();
    workspace.append(line);
    const redraw = () => {
      line.setFrom(0, 0);
      line.setTo(100, 50);
      line.setStyle('Curved');
      line.setOrientation('horizontal');
      line.setStroke(1, 'solid', 'blue', 1);
    };
    redraw();
    const builds = countCalls(Object.getPrototypeOf(line.peer) as object, '_updatePath');
    const writes = countWrites(line.peer._native);
    try {
      redraw();
    } finally {
      builds.restore();
      writes.restore();
    }
    expect(builds.n).toBe(0);
    expect(writes.total()).toBe(0);
  });

  it('an unchanged arrow, arc, heartbeat and neuron redraw writes nothing', () => {
    const workspace = createWorkspace();
    const arrow = new Arrow();
    const arc = new ArcLine();
    const heartbeat = new HeartbeatLine();
    const neuron = new NeuronLine();
    [arrow, arc, heartbeat, neuron].forEach((e) => workspace.append(e));
    const redraw = () => {
      arrow.setFrom(10, 10);
      arrow.setControlPoint({ x: 5, y: 5 });
      arrow.setStrokeColor('red');
      arc.setFrom(0, 0);
      arc.setTo(50, 80);
      arc.setOrientation('vertical');
      [heartbeat, neuron].forEach((l) => {
        l.setFrom(0, 0);
        l.setTo(120, 40);
        l.setStroke(2, 'dash', 'green', 1);
      });
    };
    redraw();
    const writes = countWrites(workspace.getSVGElement());
    try {
      redraw();
    } finally {
      writes.restore();
    }
    expect(writes.total()).toBe(0);
  });
});
