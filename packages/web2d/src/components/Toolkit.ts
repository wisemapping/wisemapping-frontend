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
import FontPeer from './peer/svg/FontPeer';
import WorkspacePeer from './peer/svg/WorkspacePeer';
import GroupPeer from './peer/svg/GroupPeer';
import EllipsePeer from './peer/svg/ElipsePeer';
import StraightLinePeer from './peer/svg/StraightPeer';
import PolyLinePeer from './peer/svg/PolyLinePeer';
import CurvedLinePeer from './peer/svg/CurvedLinePeer';
import ArrowPeer from './peer/svg/ArrowPeer';
import TextPeer from './peer/svg/TextPeer';
import ImagePeer from './peer/svg/ImagePeer';
import RectPeer from './peer/svg/RectPeer';
import ArcLinePeer from './peer/svg/ArcLinePeer';

class Toolkit {
  static createWorkspace() {
    return new WorkspacePeer();
  }

  static createGroup(): GroupPeer {
    return new GroupPeer();
  }

  static createEllipse(): EllipsePeer {
    return new EllipsePeer();
  }

  static createStraightLine(): StraightLinePeer {
    return new StraightLinePeer();
  }

  static createPolyLine(): PolyLinePeer {
    return new PolyLinePeer();
  }

  static createCurvedLine(): CurvedLinePeer {
    return new CurvedLinePeer();
  }

  static createArcLine(): ArcLinePeer {
    return new ArcLinePeer();
  }

  static createArrow() {
    return new ArrowPeer();
  }

  static createText(fontName: string): TextPeer {
    const font = new FontPeer(fontName);
    return new TextPeer(font);
  }

  static createImage(): ImagePeer {
    return new ImagePeer();
  }

  static createRect(arc: number): RectPeer {
    return new RectPeer(arc);
  }
}

export default Toolkit;
