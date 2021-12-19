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
import { $assert, $defined } from '@wisemapping/core-js';
import Command from '../Command';

class GenericFunctionCommand extends Command {
  /**
     * @classdesc This command handles do/undo of different actions, e.g. moving topics to
     * a different position, changing text or font,... (for full reference check the
     * StandaloneActionDispatcher i.e. the ActionDispatcher subclass in use)
     * @constructs
     * @param {Function} commandFunc the function the command shall execute
     * @param {String|Array<String>} topicsIds the ids of the topics affected
     * @param {Object} [value] value arbitrary value necessary for the execution of the function,
     * e.g. color, font family or text
     * @extends mindplot.Command
     */
  constructor(commandFunc, topicsIds, value) {
    $assert(commandFunc, 'commandFunc must be defined');
    $assert($defined(topicsIds), 'topicsIds must be defined');

    super();
    this._value = value;
    this._topicsId = topicsIds;
    this._commandFunc = commandFunc;
    this._oldValues = [];
  }

  /**
     * Overrides abstract parent method
     */
  execute(commandContext) {
    if (!this.applied) {
      let topics = null;
      try {
        topics = commandContext.findTopics(this._topicsId);
      } catch (e) {
        if (this._commandFunc.commandType != 'changeTextToTopic') {
          // Workaround: For some reason, there is a combination of events that involves
          // making some modification and firing out of focus event. This is causing
          // that a remove node try to be removed.  In some other life, I will come with the solution.
          // Almost aways occurs with IE9. I could be related with some change of order in sets o something similar.
          throw e;
        }
      }

      if (topics != null) {
        const me = this;
        topics.forEach((topic) => {
          const oldValue = me._commandFunc(topic, me._value);
          me._oldValues.push(oldValue);
        });
      }
      this.applied = true;
    } else {
      throw new Error('Command can not be applied two times in a row.');
    }
  }

  /**
     * Overrides abstract parent method
     * @see {@link mindplot.Command.undoExecute}
     */
  undoExecute(commandContext) {
    if (this.applied) {
      const topics = commandContext.findTopics(this._topicsId);

      topics.forEach(((topic, index) => {
        this._commandFunc(topic, this._oldValues[index]);
      }));

      this.applied = false;
      this._oldValues = [];
    } else {
      throw new Error('undo can not be applied.');
    }
  }
}

export default GenericFunctionCommand;
