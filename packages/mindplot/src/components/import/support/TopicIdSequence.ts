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

/** The ids of the topics of an imported map: 1, 2, 3... in the order the topics are created. */
class TopicIdSequence {
  private nextId = 1;

  /** Starts again from 1, for the next import. */
  reset(): void {
    this.nextId = 1;
  }

  /** The id of a new topic. */
  next(): number {
    return this.nextId++;
  }

  /** The id the next call to next() returns, without taking it. */
  peek(): number {
    return this.nextId;
  }
}

export default TopicIdSequence;
