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
import {
  ELEMENT_TYPES,
  POLYLINE_STYLES,
  STROKE_STYLES,
  isElementType,
  isPolyLineStyle,
  isStrokeStyle,
} from '../../src/components/types';
import ElementPeer from '../../src/components/peer/svg/ElementPeer';
import Workspace from '../../src/components/Workspace';
import Group from '../../src/components/Group';
import Rect from '../../src/components/Rect';
import Ellipse from '../../src/components/Ellipse';
import Image from '../../src/components/Image';
import Text from '../../src/components/Text';
import Arrow from '../../src/components/Arrow';
import StraightLine from '../../src/components/StraightLine';
import PolyLine from '../../src/components/PolyLine';
import CurvedLine from '../../src/components/CurvedLine';
import ArcLine from '../../src/components/ArcLine';
import HeartbeatLine from '../../src/components/HeartbeatLine';
import NeuronLine from '../../src/components/NeuronLine';

describe('as-const unions (typing T3)', () => {
  it('the guards accept exactly the listed values', () => {
    STROKE_STYLES.forEach((style) => expect(isStrokeStyle(style)).toBe(true));
    POLYLINE_STYLES.forEach((style) => expect(isPolyLineStyle(style)).toBe(true));
    ELEMENT_TYPES.forEach((type) => expect(isElementType(type)).toBe(true));
    [undefined, null, '', 'wavy', 'Solid', 1].forEach((value) => {
      expect(isStrokeStyle(value)).toBe(false);
      expect(isPolyLineStyle(value)).toBe(false);
      expect(isElementType(value)).toBe(false);
    });
  });

  it('the stroke styles are the keys of the dash table', () => {
    expect(Object.keys(ElementPeer.DASH_ARRAYS).sort()).toEqual([...STROKE_STYLES].sort());
  });

  it('every element type is returned by exactly one element class', () => {
    const types = [
      new Workspace(),
      new Group(),
      new Rect(0),
      new Ellipse(),
      new Image(),
      new Text(),
      new Arrow(),
      new StraightLine(),
      new PolyLine(),
      new CurvedLine(),
      new ArcLine(),
      new HeartbeatLine(),
      new NeuronLine(),
    ].map((element) => element.getType());
    expect(types.sort()).toEqual([...ELEMENT_TYPES].sort());
  });
});
