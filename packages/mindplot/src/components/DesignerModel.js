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
import Events from './Events';
import { $notify } from './widget/ToolbarNotifier';

class DesignerModel extends Events {
  constructor(options) {
    super();
    this._zoom = options.zoom;
    this._topics = [];
    this._relationships = [];
  }

  /** @return {Number} zoom between 0.3 (largest text) and 1.9 */
  getZoom() {
    return this._zoom;
  }

  /** @param {Number} zoom number between 0.3 and 1.9 to set the zoom to */
  setZoom(zoom) {
    this._zoom = zoom;
  }

  /** @return {@link mindplot.Topic[]} all topics */
  getTopics() {
    return this._topics;
  }

  /** @return {mindplot.Relationship[]} all relationships */
  getRelationships() {
    return this._relationships;
  }

  /** @return {mindplot.CentralTopic} the central topic */
  getCentralTopic() {
    const topics = this.getTopics();
    return topics[0];
  }

  /** @return {mindplot.Topic[]} selected topics */
  filterSelectedTopics() {
    const result = [];
    for (let i = 0; i < this._topics.length; i++) {
      if (this._topics[i].isOnFocus()) {
        result.push(this._topics[i]);
      }
    }
    return result;
  }

  /**
     * @return {mindplot.Relationship[]} selected relationships
     */
  filterSelectedRelationships() {
    const result = [];
    for (let i = 0; i < this._relationships.length; i++) {
      if (this._relationships[i].isOnFocus()) {
        result.push(this._relationships[i]);
      }
    }
    return result;
  }

  /**
     * @return {Array.<mindplot.Relationship, mindplot.Topic>} all topics and relationships
     */
  getEntities() {
    let result = [].concat(this._topics);
    result = result.concat(this._relationships);
    return result;
  }

  /**
     * removes occurrences of the given topic from the topic array
     * @param {mindplot.Topic} topic the topic to remove
     */
  removeTopic(topic) {
    $assert(topic, 'topic can not be null');
    this._topics = this._topics.filter((t) => t !== topic);
  }

  /**
     * removes occurrences of the given relationship from the relationship array
     * @param {mindplot.Relationship} rel the relationship to remove
     */
  removeRelationship(rel) {
    $assert(rel, 'rel can not be null');
    this._relationships = this._relationships.filter((r) => r !== rel);
  }

  /**
     * adds the given topic to the topic array
     * @param {mindplot.Topic} topic the topic to add
     * @throws will throw an error if topic is null or undefined
     * @throws will throw an error if the topic's id is not a number
     */
  addTopic(topic) {
    $assert(topic, 'topic can not be null');
    $assert(typeof topic.getId() === 'number', `id is not a number:${topic.getId()}`);
    this._topics.push(topic);
  }

  /**
     * adds the given relationship to the relationship array
     * @param {mindplot.Relationship} rel the relationship to add
     * @throws will throw an error if rel is null or undefined
     */
  addRelationship(rel) {
    $assert(rel, 'rel can not be null');
    this._relationships.push(rel);
  }

  /**
     * @param {Function=} validate a function to validate nodes
     * @param {String=} errorMsg an error message to display if the validation fails
     * @return {String} returns an array of the selected (and, if applicable, valid) topics' ids
     */
  filterTopicsIds(validate, errorMsg) {
    const result = [];
    const topics = this.filterSelectedTopics();

    let isValid = true;
    for (let i = 0; i < topics.length; i++) {
      const selectedNode = topics[i];
      if ($defined(validate)) {
        isValid = validate(selectedNode);
      }

      // Add node only if it's valid.
      if (isValid) {
        result.push(selectedNode.getId());
      } else {
        $notify(errorMsg);
      }
    }
    return result;
  }

  /**
     * @return {mindplot.Topic} the first selected topic if one or more are found by the
     * filterSelectedTopics function, null otherwise
     */
  selectedTopic() {
    const topics = this.filterSelectedTopics();
    return (topics.length > 0) ? topics[0] : null;
  }

  /**
     * @param {String} id the id of the topic to be retrieved
     * @return {mindplot.Topic} the topic with the respective id
     */
  findTopicById(id) {
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
