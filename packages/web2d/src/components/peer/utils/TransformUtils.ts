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

import SizeType from '../../SizeType';
import ElementPeer from '../svg/ElementPeer';
import GroupPeer from '../svg/GroupPeer';
import TextPeer from '../svg/TextPeer';
import WorkspacePeer from '../svg/WorkspacePeer';

class TransformUtil {
  static workoutScale(elementPeer: TextPeer): SizeType {
    let width = 1;
    let height = 1;
    let current: ElementPeer | null = elementPeer.getParent();
    while (current) {
      if (
        !(current instanceof GroupPeer) &&
        !(current instanceof WorkspacePeer) &&
        !(current instanceof TextPeer)
      ) {
        throw new Error(
          `Not supported element as part of the parent hierarchy.${current instanceof GroupPeer}`,
        );
      }

      const container = current as GroupPeer;
      const coordSize = container.getCoordSize();
      const size = container.getSize();

      width *= size.width / coordSize.width;
      height *= size.height / coordSize.height;
      current = container.getParent();
    }
    return { width, height };
  }
}

export default TransformUtil;
