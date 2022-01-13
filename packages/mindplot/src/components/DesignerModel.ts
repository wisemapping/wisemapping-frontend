/*
 *    Copyright [2021] [wisemapping]
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
import CentralTopic from './CentralTopic';
import { DesignerOptions } from './DesignerOptionsBuilder';
import Events from './Events';
import Relationship from './Relationship';
import Topic from './Topic';
import { $notify } from './widget/ToolbarNotifier';

class DesignerModel extends Events {
  _zoom: number;

  _topics: Topic[];

  _relationships: Relationship[];

  constructor(options: DesignerOptions) {
    super();
    this._zoom = options.zoom;
    this._topics = [];
    this._relationships = [];
  }

  getZoom():number {
    return this._zoom;
  }

  setZoom(zoom: number):void {
    this._zoom = zoom;
  }

  getTopics(): Topic[] {
    return this._topics;
  }

  getRelationships(): Relationship[] {
    return this._relationships;
  }

  getCentralTopic(): CentralTopic {
    const topics = this.getTopics();
    return topics[0] as CentralTopic;
  }

  /** @return {mindplot.Topic[]} selected topics */
  filterSelectedTopics(): Topic[] {
    const result = [];
    for (let i = 0; i < this._topics.length; i++) {
      if (this._topics[i].isOnFocus()) {
        result.push(this._topics[i]);
      }
    }
    return result;
  }

  filterSelectedRelationships(): Relationship[] {
    const result = [];
    for (let i = 0; i < this._relationships.length; i++) {
      if (this._relationships[i].isOnFocus()) {
        result.push(this._relationships[i]);
      }
    }
    return result;
  }

  getEntities(): (Relationship | Topic)[] {
    let result = [].concat(this._topics);
    result = result.concat(this._relationships);
    return result;
  }

  removeTopic(topic:Topic):void {
    $assert(topic, 'topic can not be null');
    this._topics = this._topics.filter((t) => t !== topic);
  }

  removeRelationship(rel:Relationship):void {
    $assert(rel, 'rel can not be null');
    this._relationships = this._relationships.filter((r) => r !== rel);
  }

  addTopic(topic: Topic): void {
    $assert(topic, 'topic can not be null');
    $assert(typeof topic.getId() === 'number', `id is not a number:${topic.getId()}`);
    this._topics.push(topic);
  }

  addRelationship(rel: Relationship): void {
    $assert(rel, 'rel can not be null');
    this._relationships.push(rel);
  }

  filterTopicsIds(validate: (topic: Topic) => boolean = null, errorMsg = null): Topic[] {
    const result = [];
    const topics = this.filterSelectedTopics();

    let isValid = true;
    topics.forEach((topic) => {
      if ($defined(validate)) {
        isValid = validate(topic);
      }

      // Add node only if it's valid.
      if (isValid) {
        result.push(topic.getId());
      } else {
        $notify(errorMsg);
      }
    });

    return result;
  }

  selectedTopic(): Topic {
    const topics = this.filterSelectedTopics();
    return (topics.length > 0) ? topics[0] : null;
  }

  findTopicById(id: number): Topic {
    let result = null;
    for (let i = 0; i < this._topics.length; i++) {
      const topic = this._topics[i];
      if (topic.getId() === id) {
        result = topic;
        break;
      }
    }
    return result;
  }
}

export default DesignerModel;
