/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import WorkspaceElement from './WorkspaceElement';
import ElipsePeer from './peer/svg/ElipsePeer';
import SizeType from './SizeType';
import StyleAttributes from './StyleAttributes';
import Toolkit from './Toolkit';
import PositionType from './PositionType';

class Ellipse extends WorkspaceElement<ElipsePeer> {
  constructor(attributes?: StyleAttributes) {
    const peer = Toolkit.createEllipse();
    const defaultAttributes = {
      width: 40,
      height: 40,
      x: 5,
      y: 5,
      stroke: '1 solid black',
      fillColor: 'blue',
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  getType(): string {
    return 'Ellipse';
  }

  getSize(): SizeType {
    return this.peer.getSize();
  }

  getPosition(): PositionType {
    return this.peer.getPosition();
  }

  setPosition(x: number, y: number) {
    this.peer.setPosition(x, y);
  }
}

export default Ellipse;
