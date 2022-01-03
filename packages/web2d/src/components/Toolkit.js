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
import WorkspacePeer from './peer/svg/WorkspacePeer';
import GroupPeer from './peer/svg/GroupPeer';
import ElipsePeer from './peer/svg/ElipsePeer';
import LinePeer from './peer/svg/LinePeer';
import PolyLinePeer from './peer/svg/PolyLinePeer';
import CurvedLinePeer from './peer/svg/CurvedLinePeer';
import ArrowPeer from './peer/svg/ArrowPeer';
// eslint-disable-next-line import/no-cycle
import TextPeer from './peer/svg/TextPeer';
import ImagePeer from './peer/svg/ImagePeer';
import RectPeer from './peer/svg/RectPeer';
import ArialFont from './peer/svg/font/ArialFont';
import TimesFont from './peer/svg/font/TimesFont';
import VerdanaFont from './peer/svg/font/VerdanaFont';
import TahomaFont from './peer/svg/font/TahomaFont';
import LuminariFont from './peer/svg/font/LuminariFont';
import BrushScriptMTFont from './peer/svg/font/BrushScriptFont';

class Toolkit {
  static createFontByName(fontName) {
    const font = fontName.replaceAll(' ', '');
    return Toolkit[`create${font}Font`]();
  }

  static createWorkspace(element) {
    return new WorkspacePeer(element);
  }

  static createGroup() {
    return new GroupPeer();
  }

  static createElipse() {
    return new ElipsePeer();
  }

  static createLine() {
    return new LinePeer();
  }

  static createPolyLine() {
    return new PolyLinePeer();
  }

  static createCurvedLine() {
    return new CurvedLinePeer();
  }

  static createArrow() {
    return new ArrowPeer();
  }

  static createText(fontName) {
    const font = Toolkit.createFontByName(fontName);
    return new TextPeer(font);
  }

  static createImage() {
    return new ImagePeer();
  }

  static createRect(arc) {
    return new RectPeer(arc);
  }

  static createArialFont() {
    return new ArialFont();
  }

  static createTimesFont() {
    return new TimesFont();
  }

  static createLuminariFont() {
    return new LuminariFont();
  }

  static createVerdanaFont() {
    return new VerdanaFont();
  }

  static createTahomaFont() {
    return new TahomaFont();
  }

  static createBrushScriptMTFont() {
    return new BrushScriptMTFont();
  }
}

export default Toolkit;
