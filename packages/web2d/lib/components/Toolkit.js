/*
*    Copyright [2015] [wisemapping]
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
const WorkspacePeer = require('./peer/svg/WorkspacePeer').default;
const GroupPeer = require('./peer/svg/GroupPeer').default;
const ElipsePeer = require('./peer/svg/ElipsePeer').default;
const LinePeer = require('./peer/svg/LinePeer').default;
const PolyLinePeer = require('./peer/svg/PolyLinePeer').default;
const CurvedLinePeer = require('./peer/svg/CurvedLinePeer').default;
const ArrowPeer = require('./peer/svg/ArrowPeer').default;
const TextPeer = require('./peer/svg/TextPeer').default;
const ImagePeer = require('./peer/svg/ImagePeer').default;
const RectPeer = require('./peer/svg/RectPeer').default;
const ArialFont = require('./peer/svg/ArialFont').default;
const TimesFont = require('./peer/svg/TimesFont').default;
const VerdanaFont = require('./peer/svg/VerdanaFont').default;
const TahomaFont = require('./peer/svg/TahomaFont').default;

const ToolkitSVG = {
  init() {
  },
  createWorkspace(element) {
    return new WorkspacePeer(element);
  },
  createGroup(element) {
    return new GroupPeer();
  },
  createElipse() {
    return new ElipsePeer();
  },
  createLine() {
    return new LinePeer();
  },
  createPolyLine() {
    return new PolyLinePeer();
  },
  createCurvedLine() {
    return new CurvedLinePeer();
  },
  createArrow() {
    return new ArrowPeer();
  },
  createText() {
    return new TextPeer();
  },
  createImage() {
    return new ImagePeer();
  },
  createRect(arc) {
    return new RectPeer(arc);
  },
  createArialFont() {
    return new ArialFont();
  },
  createTimesFont() {
    return new TimesFont();
  },
  createVerdanaFont() {
    return new VerdanaFont();
  },
  createTahomaFont() {
    return new TahomaFont();
  },
};

const Toolkit = ToolkitSVG;
export default Toolkit;
