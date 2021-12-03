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

import Toolkit from './Toolkit';
import TransformUtil from './peer/utils/TransformUtils';

class Font {
  constructor(fontFamily, textPeer) {
    this.peer = Toolkit[`create${fontFamily}Font`]();
    this._textPeer = textPeer;
  }

  getHtmlSize() {
    const scale = TransformUtil.workoutScale(this._textPeer);
    return this.peer.getHtmlSize(scale);
  }

  getGraphSize() {
    const scale = TransformUtil.workoutScale(this._textPeer);
    return this.peer.getGraphSize(scale);
  }

  getFontScale() {
    return TransformUtil.workoutScale(this._textPeer).height;
  }

  getSize() {
    return this.peer.getSize();
  }

  getStyle() {
    return this.peer.getStyle();
  }

  getWeight() {
    return this.peer.getWeight();
  }

  getFontFamily() {
    return this.peer.getFontFamily();
  }

  setSize(size) {
    return this.peer.setSize(size);
  }

  setStyle(style) {
    return this.peer.setStyle(style);
  }

  setWeight(weight) {
    return this.peer.setWeight(weight);
  }

  getFont() {
    return this.peer.getFont();
  }

  getWidthMargin() {
    return this.peer.getWidthMargin();
  }
}

Font.ARIAL = 'Arial';
Font.TIMES = 'Times';
Font.TAHOMA = 'Tahoma';
Font.VERDANA = 'Verdana';

export default Font;
