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

import { SwitchValueDirection } from '../../../components/toolbar/ToolbarValueModelBuilder';

/**
 * Interface to get and set a property of the mindplot selected node
 */

interface NodeProperty<Type> {
  /**
   * get the property value
   */
  getValue: () => Type;
  /**
   * set the property value
   */
  setValue?: (value: Type) => void;
  /**
   * toogle boolean values or change for next/previous in reduced lists of values
   */
  switchValue?: (direction?: SwitchValueDirection) => void;
}
export default NodeProperty;
