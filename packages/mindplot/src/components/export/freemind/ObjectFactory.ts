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

import Arrowlink from './Arrowlink';
import Cloud from './Cloud';
import Edge from './Edge';
import Font from './Font';
import Hook from './Hook';
import Icon from './Icon';
import Richcontent from './Richcontent';
import Map from './Map';
import Node from './Node';

export default class ObjectFactory {
  public createParameters(): void {
    console.log('parameters');
  }

  public crateArrowlink(): Arrowlink {
    return new Arrowlink();
  }

  public createCloud(): Cloud {
    return new Cloud();
  }

  public createEdge(): Edge {
    return new Edge();
  }

  public createFont(): Font {
    return new Font();
  }

  public createHook(): Hook {
    return new Hook();
  }

  public createIcon(): Icon {
    return new Icon();
  }

  public createRichcontent(): Richcontent {
    return new Richcontent();
  }

  public createMap(): Map {
    return new Map();
  }

  public createNode(): Node {
    return new Node();
  }
}
