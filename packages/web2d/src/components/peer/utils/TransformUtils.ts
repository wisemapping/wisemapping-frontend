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

import type SizeType from '../../SizeType';
import type ElementPeer from '../svg/ElementPeer';
import GroupPeer from '../svg/GroupPeer';
import WorkspacePeer from '../svg/WorkspacePeer';

class TransformUtil {
  /**
   * The screen scale of an element: the product of the size / coordinate size ratio of every
   * group and workspace above it.
   */
  static workoutScale(elementPeer: ElementPeer): SizeType {
    let width = 1;
    let height = 1;
    let current = elementPeer.getParent();
    while (current) {
      if (!(current instanceof GroupPeer) && !(current instanceof WorkspacePeer)) {
        throw new Error('Not supported element as part of the parent hierarchy.');
      }

      const coordSize = current.getCoordSize();
      // A workspace reads its size from the <svg> attributes (W-HTMLFONT).
      const size = current.getSize();

      width *= size.width / coordSize.width;
      height *= size.height / coordSize.height;
      current = current.getParent();
    }
    return { width, height };
  }
}

export default TransformUtil;
