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
import { $assert } from '@wisemapping/core-js';
import TopicConfig from './TopicConfig';
import DragTopic from './DragTopic';

class NodeGraph {
  /**
     * @constructs
     * @param {mindplot.model.NodeModel} nodeModel
     * @param {Object<Number, String, Boolean>} options
     * @throws will throw an error if nodeModel is null or undefined
     */
  constructor(nodeModel, options) {
    $assert(nodeModel, 'model can not be null');

    this._options = options;
    this._mouseEvents = true;
    this.setModel(nodeModel);
    this._onFocus = false;
    this._size = { width: 50, height: 20 };
  }

  /** @return true if option is set to read-only */
  isReadOnly() {
    return this._options.readOnly;
  }

  /** @return model type */
  getType() {
    const model = this.getModel();
    return model.getType();
  }

  /**
         * @param {String} id
         * @throws will throw an error if the topic id is not a number
         */
  setId(id) {
    $assert(typeof id === 'number', `id is not a number:${id}`);
    this.getModel().setId(id);
  }

  _set2DElement(elem2d) {
    this._elem2d = elem2d;
  }

  /**
         * @return 2D element
         * @throws will throw an error if the element is null or undefined within node graph
         */
  get2DElement() {
    $assert(this._elem2d, 'NodeGraph has not been initialized properly');
    return this._elem2d;
  }

  /** @abstract */
  setPosition(point, fireEvent) {
    throw new Error('Unsupported operation');
  }

  /** */
  addEvent(type, listener) {
    const elem = this.get2DElement();
    elem.addEvent(type, listener);
  }

  /** */
  removeEvent(type, listener) {
    const elem = this.get2DElement();
    elem.removeEvent(type, listener);
  }

  /** */
  fireEvent(type, event) {
    const elem = this.get2DElement();
    elem.trigger(type, event);
  }

  /** */
  setMouseEventsEnabled(isEnabled) {
    this._mouseEvents = isEnabled;
  }

  /** */
  isMouseEventsEnabled() {
    return this._mouseEvents;
  }

  /** @return {Object<Number>} size */
  getSize() {
    return this._size;
  }

  /** @param {Object<Number>} size */
  setSize(size) {
    this._size.width = parseInt(size.width, 10);
    this._size.height = parseInt(size.height, 10);
  }

  /**
         * @return {mindplot.model.NodeModel} the node model
         */
  getModel() {
    $assert(this._model, 'Model has not been initialized yet');
    return this._model;
  }

  /**
         * @param {mindplot.NodeModel} model the node model
         * @throws will throw an error if model is null or undefined
         */
  setModel(model) {
    $assert(model, 'Model can not be null');
    this._model = model;
  }

  /** */
  getId() {
    return this._model.getId();
  }

  /** */
  setOnFocus(focus) {
    if (this._onFocus !== focus) {
      this._onFocus = focus;
      const outerShape = this.getOuterShape();
      if (focus) {
        outerShape.setFill(TopicConfig.OUTER_SHAPE_ATTRIBUTES_FOCUS.fillColor);
        outerShape.setOpacity(1);
      } else {
        outerShape.setFill(TopicConfig.OUTER_SHAPE_ATTRIBUTES.fillColor);
        outerShape.setOpacity(0);
      }
      this.setCursor('move');

      // In any case, always try to hide the editor ...
      this.closeEditors();

      // Fire event ...
      this.fireEvent(focus ? 'ontfocus' : 'ontblur', this);
    }
  }

  /** @return {Boolean} true if the node graph is on focus */
  isOnFocus() {
    return this._onFocus;
  }

  /** */
  dispose(workspace) {
    this.setOnFocus(false);
    workspace.removeChild(this);
  }

  /** */
  createDragNode(layoutManager) {
    const dragShape = this._buildDragShape();
    return new DragTopic(dragShape, this, layoutManager);
  }

  _buildDragShape() {
    $assert(false, '_buildDragShape must be implemented by all nodes.');
  }

  /** */
  getPosition() {
    const model = this.getModel();
    return model.getPosition();
  }
}

export default NodeGraph;
