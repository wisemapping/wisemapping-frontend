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
import PositionType from '../../PositionType';
import ElementPeer from './ElementPeer';

class ImagePeer extends ElementPeer {
  private _position: PositionType;
  private _href: string;

  constructor() {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'image');
    super(svgElement);
    this._position = { x: 0, y: 0 };
    this._href = '';
    this._native.setAttribute('preserveAspectRatio', 'none');
  }

  setPosition(x: number, y: number): void {
    this._position = { x, y };
    this._native.setAttribute('y', String(y));
    this._native.setAttribute('x', String(x));
  }

  getPosition(): PositionType {
    return this._position;
  }

  setHref(url: string): void {
    this._native.setAttributeNS(ElementPeer.linkNamespace, 'href', url);
    this._href = url;
  }

  getHref(): string {
    return this._href;
  }
}

export default ImagePeer;
