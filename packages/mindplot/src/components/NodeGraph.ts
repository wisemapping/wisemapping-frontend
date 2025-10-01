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
import { Group, Rect } from '@wisemapping/web2d';
import { $assert } from '@wisemapping/core-js';
import NodeModel from './model/NodeModel';
import Canvas from './Canvas';
import DragTopic from './DragTopic';
import LayoutManager from './layout/LayoutManager';
import SizeType from './SizeType';
import PositionType from './PositionType';
import CanvasElement from './CanvasElement';

export type NodeOption = {
  readOnly: boolean;
};

abstract class NodeGraph implements CanvasElement {
  private _mouseEvents: boolean;

  private _options: NodeOption;

  protected _onFocus: boolean;

  private _size: SizeType;

  private _model: NodeModel;

  private _elem2d: Group | undefined;

  constructor(nodeModel: NodeModel, options: NodeOption) {
    $assert(nodeModel, 'model can not be null');

    this._options = options;
    this._mouseEvents = true;
    this._model = nodeModel;
    this._onFocus = false;
    this._size = { width: 50, height: 20 };
  }

  abstract addToWorkspace(workspace: Canvas): void;

  abstract removeFromWorkspace(workspace: Canvas): void;

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

  protected _set2DElement(elem2d: Group) {
    this._elem2d = elem2d;
  }

  get2DElement(): Group {
    if (!this._elem2d) {
      throw new Error('Eleemnt has not been initialized.');
    }
    return this._elem2d;
  }

  abstract setPosition(point: PositionType, fireEvent): void;

  /** */
  addEvent(type: string, listener) {
    const elem = this.get2DElement();
    elem.addEvent(type, listener);
  }

  /** */
  removeEvent(type: string, listener) {
    const elem = this.get2DElement();
    elem.removeEvent(type, listener);
  }

  /** */
  fireEvent(type: string, event) {
    const elem = this.get2DElement();
    elem.trigger(type, event);
  }

  /** */
  setMouseEventsEnabled(isEnabled: boolean) {
    this._mouseEvents = isEnabled;
  }

  /** */
  isMouseEventsEnabled() {
    return this._mouseEvents;
  }

  getSize(): SizeType {
    return this._size;
  }

  setSize(size: SizeType) {
    this._size.width = size.width;
    this._size.height = size.height;
  }

  getModel(): NodeModel {
    $assert(this._model, 'Model has not been initialized yet');
    return this._model;
  }

  setModel(model: NodeModel): void {
    $assert(model, 'Model can not be null');
    this._model = model;
  }

  getId(): number {
    return this._model.getId();
  }

  abstract setOnFocus(focus: boolean): void;

  abstract closeEditors(): void;

  abstract setCursor(type: string): void;

  abstract getOuterShape(): Rect;

  isOnFocus(): boolean {
    return this._onFocus;
  }

  dispose(workspace: Canvas) {
    this.setOnFocus(false);
    workspace.removeChild(this);
  }

  createDragNode(layoutManager: LayoutManager): DragTopic {
    const dragShape = this.buildDragShape();

    return new DragTopic(dragShape, this, layoutManager);
  }

  abstract buildDragShape();

  getPosition(): PositionType {
    const model = this.getModel();
    return model.getPosition();
  }

  isCentralTopic(): boolean {
    return this.getModel().getType() === 'CentralTopic';
  }
}

export default NodeGraph;
