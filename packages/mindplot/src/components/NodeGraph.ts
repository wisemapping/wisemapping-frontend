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
import { ElementClass } from '@wisemapping/web2d';
import TopicConfig from './TopicConfig';
import NodeModel from './model/NodeModel';
import Workspace from './Workspace';
import DragTopic from './DragTopic';
import LayoutManager from './layout/LayoutManager';
import SizeType from './SizeType';
import PositionType from './PositionType';

abstract class NodeGraph {
  private _mouseEvents: boolean;

  private _options;

  private _onFocus: boolean;

  private _size: SizeType;

  private _model: NodeModel;

  private _elem2d: ElementClass;

  constructor(nodeModel: NodeModel, options) {
    $assert(nodeModel, 'model can not be null');

    this._options = options;
    this._mouseEvents = true;
    this.setModel(nodeModel);
    this._onFocus = false;
    this._size = { width: 50, height: 20 };
  }

  isReadOnly(): boolean {
    return this._options.readOnly;
  }

  getType(): string {
    const model = this.getModel();
    return model.getType();
  }

  setId(id: number) {
    $assert(typeof id === 'number', `id is not a number:${id}`);
    this.getModel().setId(id);
  }

  protected _set2DElement(elem2d: ElementClass) {
    this._elem2d = elem2d;
  }

  get2DElement(): ElementClass {
    $assert(this._elem2d, 'NodeGraph has not been initialized properly');
    return this._elem2d;
  }

  abstract setPosition(point, fireEvent): void;

  /** */
  addEvent(type: string, listener) {
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

  getSize(): SizeType {
    return this._size;
  }

  setSize(size) {
    this._size.width = parseInt(size.width, 10);
    this._size.height = parseInt(size.height, 10);
  }

  getModel(): NodeModel {
    $assert(this._model, 'Model has not been initialized yet');
    return this._model;
  }

  setModel(model: NodeModel) {
    $assert(model, 'Model can not be null');
    this._model = model;
  }

  getId(): number {
    return this._model.getId();
  }

  setOnFocus(focus: boolean) {
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

  abstract closeEditors(): void;

  abstract setCursor(type: string): void;

  abstract getOuterShape(): ElementClass;

  isOnFocus(): boolean {
    return this._onFocus;
  }

  dispose(workspace: Workspace) {
    this.setOnFocus(false);
    workspace.removeChild(this);
  }

  /** */
  createDragNode(layoutManager: LayoutManager) {
    const dragShape = this._buildDragShape();
    return new DragTopic(dragShape, this, layoutManager);
  }

  abstract _buildDragShape();

  getPosition(): PositionType {
    const model = this.getModel();
    return model.getPosition();
  }
}

export default NodeGraph;
