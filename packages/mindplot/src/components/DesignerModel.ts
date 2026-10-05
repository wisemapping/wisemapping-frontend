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
import { DesignerOptions } from './DesignerOptionsBuilder';
import Relationship from './Relationship';
import Topic from './Topic';
import NodeModel from './model/NodeModel';
import { $notify } from './model/ToolbarNotifier';

class DesignerModel {
  private _zoom: number;

  private _topics: Topic[];

  private _relationships: Relationship[];

  // Topics by id: lookups used to scan _topics. A topic's id is not expected to change once it
  // is added; if one does, the lookup falls back to the scan.
  private _topicsById: Map<number, Topic>;

  constructor(options: DesignerOptions) {
    this._zoom = options.zoom;
    this._topics = [];
    this._relationships = [];
    this._topicsById = new Map();
  }

  getZoom(): number {
    return this._zoom;
  }

  setZoom(zoom: number): void {
    this._zoom = zoom;
  }

  /**
   * removeTopic replaces this array, so read it when needed instead of keeping it.
   */
  getTopics(): Topic[] {
    return this._topics;
  }

  getRelationships(): Relationship[] {
    return this._relationships;
  }

  getCentralTopic(): CentralTopic {
    const topics = this.getTopics();
    const centralTopic = topics[0] as unknown as CentralTopic;
    if (!centralTopic) {
      throw new Error('Central topic not found. Mindmap must have at least one topic.');
    }
    return centralTopic;
  }

  filterSelectedTopics(): Topic[] {
    return this._topics.filter((t) => t.isOnFocus());
  }

  /**
   * Case-insensitive substring match over topic text. An empty or
   * whitespace-only query matches nothing rather than every topic.
   */
  findTopicsByText(query: string): Topic[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }
    return this._topics.filter((topic) =>
      DesignerModel._searchableText(topic).toLowerCase().includes(normalizedQuery),
    );
  }

  /**
   * A topic whose text was never edited stores nothing, yet renders the
   * theme's default label -- "Main Topic" and friends. Search has to match
   * what is on screen, so fall back to the rendered text in that case. The
   * model's plain text is preferred because it has HTML markup stripped.
   */
  private static _searchableText(topic: Topic): string {
    const plainText = topic.getModel().getPlainText();
    return plainText !== '' ? plainText : topic.getText();
  }

  filterSelectedRelationships(): Relationship[] {
    return this._relationships.filter((r) => r.isOnFocus());
  }

  getEntities(): (Relationship | Topic)[] {
    let result: (Relationship | Topic)[] = [];
    result = result.concat(this._topics);
    result = result.concat(this._relationships);
    return result;
  }

  removeTopic(topic: Topic): void {
    $assert(topic, 'topic can not be null');
    this._topics = this._topics.filter((t) => t !== topic);
    this._unindex(topic);
  }

  removeRelationship(rel: Relationship): void {
    $assert(rel, 'rel can not be null');
    this._relationships = this._relationships.filter((r) => r !== rel);
  }

  addTopic(topic: Topic): void {
    $assert(topic, 'topic can not be null');
    $assert(typeof topic.getId() === 'number', `id is not a number:${topic.getId()}`);
    this._topics.push(topic);
    this._index(topic);
  }

  /** A lookup answers the first topic of _topics that matches: an earlier one keeps its place. */
  private _index(topic: Topic): void {
    const id = topic.getId();
    if (!this._topicsById.has(id)) {
      this._topicsById.set(id, topic);
    }
  }

  private _unindex(topic: Topic): void {
    const id = topic.getId();
    if (this._topicsById.get(id) === topic) {
      this._topicsById.delete(id);
      // Another topic with the same id, if any, takes its place ...
      const other = this._topics.find((t) => t.getId() === id);
      if (other) {
        this._topicsById.set(id, other);
      }
    }
  }

  addRelationship(rel: Relationship): void {
    $assert(rel, 'rel can not be null');
    this._relationships.push(rel);
  }

  filterTopicsIds(validate?: (topic: Topic) => boolean, errorMsg?: string): number[] {
    const result: number[] = [];
    const topics = this.filterSelectedTopics();

    let isValid = true;
    topics.forEach((topic) => {
      if (validate) {
        isValid = validate(topic);
      }

      // Add node only if it's valid.
      if (isValid) {
        result.push(topic.getId());
      } else if (errorMsg) {
        $notify(errorMsg);
      }
    });

    return result;
  }

  selectedTopic(): Topic | undefined {
    const topics = this.filterSelectedTopics();
    return topics.length > 0 ? topics[0] : undefined;
  }

  selectedRelationship(): Relationship | undefined {
    const relationships = this.filterSelectedRelationships();
    return relationships.length > 0 ? relationships[0] : undefined;
  }

  findTopicById(id: number): Topic | undefined {
    const topic = this._topicsById.get(id);
    if (topic && topic.getId() === id) {
      return topic;
    }
    // Not indexed under this id (absent, or its id changed): search, and index what is found.
    const result = this._topics.find((t) => t.getId() === id);
    if (result) {
      this._topicsById.set(id, result);
    }
    return result;
  }

  /** The topic of a model. A topic has the id of its model, so the id index finds it. */
  findTopicByModel(model: NodeModel): Topic | undefined {
    const topic = this._topicsById.get(model.getId());
    if (topic && topic.getModel() === model) {
      return topic;
    }
    return this._topics.find((t) => t.getModel() === model);
  }

  /**
   * The topics with the given ids, in the order the model keeps them. Ids that match no topic
   * are left out.
   */
  findTopicsByIds(ids: number[]): Topic[] {
    const idSet = new Set(ids);
    return this._topics.filter((t) => idSet.has(t.getId()));
  }
}

export default DesignerModel;
