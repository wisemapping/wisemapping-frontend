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
import WorkspaceElement from './WorkspaceElement';
import ImagePeer from './peer/svg/ImagePeer';
import SizeType from './SizeType';
import StyleAttributes from './StyleAttributes';
import Toolkit from './Toolkit';
import PositionType from './PositionType';

class Image extends WorkspaceElement<ImagePeer> {
  constructor(attributes?: StyleAttributes) {
    const peer = Toolkit.createImage();
    super(peer, attributes || {});
  }

  getType(): string {
    return 'Image';
  }

  setHref(href: string) {
    this.peer.setHref(href);
  }

  getHref() {
    return this.peer.getHref();
  }

  getSize(): SizeType | undefined {
    return this.peer.getSize();
  }

  getPosition(): PositionType {
    return this.peer.getPosition();
  }

  setPosition(x: number, y: number) {
    this.peer.setPosition(x, y);
  }
}

export default Image;
