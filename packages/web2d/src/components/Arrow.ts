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
 *
 */
import WorkspaceElement from './WorkspaceElement';
import ArrowPeer from './peer/svg/ArrowPeer';
import type PositionType from './PositionType';
import type { ElementAttributes } from './StyleAttributes';
import type { ElementType } from './types';

class Arrow extends WorkspaceElement<ArrowPeer> {
  constructor(attributes?: ElementAttributes) {
    const peer = new ArrowPeer();
    const defaultAttributes: ElementAttributes = {
      strokeColor: 'black',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 1,
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  getType(): ElementType {
    return 'Arrow';
  }

  setFrom(x: number, y: number): void {
    this.peer.setFrom(x, y);
  }

  setControlPoint(point: PositionType): void {
    this.peer.setControlPoint(point);
  }

  setStrokeColor(color: string): void {
    this.peer.setStrokeColor(color);
  }

  setStrokeWidth(width: number): void {
    this.peer.setStrokeWidth(width);
  }

  setDashed(isDashed: boolean, length: number, spacing: number): void {
    this.peer.setDashed(isDashed, length, spacing);
  }
}

export default Arrow;
