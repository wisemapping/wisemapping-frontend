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
import CurvedLine from '../../src/components/CurvedLine';
import Ellipse from '../../src/components/Ellipse';
import Group from '../../src/components/Group';
import Image from '../../src/components/Image';
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
