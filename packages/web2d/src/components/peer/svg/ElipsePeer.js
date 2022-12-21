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
import { $defined } from '@wisemapping/core-js';
import ElementPeer from './ElementPeer';

class ElipsePeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'ellipse');
    super(svgElement);
    this.attachChangeEventListener('strokeStyle', ElementPeer.prototype.updateStrokeStyle);
    this._position = { x: 0, y: 0 };
    this._size = { width: 5, height: 5 };
  }

  setSize(width, height) {
    super.setSize(width, height);
    if ($defined(width)) {
      this._native.setAttribute('rx', width / 2);
    }

    if ($defined(height)) {
      this._native.setAttribute('ry', height / 2);
    }
  }

  setPosition(pcx, pcy) {
    this._position = { x: pcx, y: pcy };
    if ($defined(pcx)) {
      this._native.setAttribute('cx', pcx);
    }

    if ($defined(pcy)) {
      this._native.setAttribute('cy', pcy);
    }
  }

  getPosition() {
    return this._position;
  }
}

export default ElipsePeer;
