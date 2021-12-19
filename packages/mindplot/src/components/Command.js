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
import { $defined } from '@wisemapping/core-js';

class Command {
  /**
     * @classdesc The command base class for handling do/undo mindmap operations
     * @constructs
     */
  constructor() {
    this._id = Command._nextUUID();
  }

  // eslint-disable-next-line no-unused-vars
  execute(commandContext) {
    throw new Error('execute must be implemented.');
  }

  // eslint-disable-next-line no-unused-vars
  undoExecute(commandContext) {
    throw new Error('undo must be implemented.');
  }

  /**
     * Returns the unique id of this command
     * @returns {Number} command id
     */
  getId() {
    return this._id;
  }
}

Command._nextUUID = function _nextUUID() {
  if (!$defined(Command._uuid)) {
    Command._uuid = 1;
  }

  Command._uuid += 1;
  return Command._uuid;
};

export default Command;
