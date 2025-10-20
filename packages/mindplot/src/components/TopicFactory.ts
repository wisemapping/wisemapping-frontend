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

import { $assert } from './util/assert';

import CentralTopic from './CentralTopic';
import MainTopic from './MainTopic';
import NodeModel from './model/NodeModel';
import { NodeOption } from './NodeGraph';
import Topic from './Topic';
import { ThemeVariant } from './theme/Theme';
import type { OrientationType } from './layout/LayoutType';

class TopicFactory {
  static create(
    nodeModel: NodeModel,
    options: NodeOption,
    themeVariant: ThemeVariant,
    orientation: OrientationType = 'horizontal',
  ): Topic {
    $assert(nodeModel, 'Model can not be null');

    const type = nodeModel.getType();
    $assert(type, 'Node model type can not be null');

    let result: Topic;
    if (type === 'CentralTopic') {
      result = new CentralTopic(nodeModel, options, themeVariant, orientation);
    } else if (type === 'MainTopic') {
      result = new MainTopic(nodeModel, options, themeVariant, orientation);
    } else {
      $assert(false, `unsupported node type:${type}`);
    }
    return result!;
  }
}

export default TopicFactory;
