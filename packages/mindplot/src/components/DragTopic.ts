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
import { ElementClass, ElementPeer, Group } from '@wisemapping/web2d';

import ActionDispatcher from './ActionDispatcher';
import DragPivot from './DragPivot';
import LayoutManager from './layout/LayoutManager';
import NodeGraph from './NodeGraph';
import PositionType from './PositionType';
import Topic from './Topic';
import Canvas from './Canvas';
import CanvasElement from './CanvasElement';

class DragTopic {
  private _elem2d: Group;

  private _order: number | null;

  private _draggedNode: NodeGraph;

  private _layoutManager: LayoutManager;

  private _position: PositionType;

  private _isInWorkspace: boolean;

  static _dragPivot: DragPivot = new DragPivot();

  constructor(dragShape: Group, draggedNode: NodeGraph, layoutManger: LayoutManager) {
    this._elem2d = dragShape;
    this._order = null;
    this._draggedNode = draggedNode;
    this._layoutManager = layoutManger;
    this._isInWorkspace = false;
    this._position = { x: 0, y: 0 };
  }

  setOrder(order: number): void {
    this._order = order;
  }

  setPosition(x: number, y: number): void {
    // Update drag shadow position ....
    this._position = { x, y };

    // Elements are positioned in the center.
    // All topic element must be positioned based on the innerShape.
    const draggedNode = this._draggedNode;
    const size = draggedNode.getSize();
    const cx = x - (x > 0 ? 0 : size.width);
    const cy = Math.ceil(y - size.height / 2);
    this._elem2d.setPosition(cx, cy);

    // In case is not free, pivot must be draw ...
    if (this.isConnected()) {
      const parent = this.getConnectedToTopic();
      const predict = this._layoutManager.predict(
        parent!.getId(),
        this._draggedNode.getId(),
        this.getPosition(),
      );

      if (this._order !== predict.order) {
        const dragPivot = this._getDragPivot();
        const pivotPosition = predict.position;
        dragPivot.connectTo(parent!, pivotPosition);
        this.setOrder(predict.order);
      }
    }
  }

  setVisibility(value: boolean) {
    const dragPivot = this._getDragPivot();
    dragPivot.setVisibility(value);
  }

  isVisible(): boolean {
    const dragPivot = this._getDragPivot();
    return dragPivot.isVisible();
  }

  getInnerShape(): ElementClass<ElementPeer> {
    return this._elem2d;
  }

  disconnect(workspace: Canvas) {
    // Clear connection line ...
    const dragPivot = this._getDragPivot();
    dragPivot.disconnect(workspace);
  }

  connectTo(parent: Topic) {
    // Where it should be connected ?
    const predict = this._layoutManager.predict(
      parent.getId(),
      this._draggedNode.getId(),
      this.getPosition(),
    );

    // Connect pivot ...
    const dragPivot = this._getDragPivot();
    const { position } = predict;
    dragPivot.connectTo(parent, position);
    dragPivot.setVisibility(true);

    this.setOrder(predict.order);
  }

  getDraggedTopic(): Topic {
    return this._draggedNode as Topic;
  }

  removeFromWorkspace(workspace: Canvas) {
    if (this._isInWorkspace) {
      // Remove drag shadow.
      workspace.removeChild(this._elem2d);

      // Remove pivot shape. To improve performance it will not be removed.
      // Only the visibility will be changed.
      const dragPivot = this._getDragPivot();
      dragPivot.setVisibility(false);

      this._isInWorkspace = false;
    }
  }

  isInWorkspace(): boolean {
    return this._isInWorkspace;
  }

  addToWorkspace(workspace: Canvas) {
    if (!this._isInWorkspace) {
      workspace.append(this._elem2d);
      const dragPivot = this._getDragPivot();
      dragPivot.addToWorkspace(workspace);
      this._isInWorkspace = true;
    }
  }

  private _getDragPivot(): DragPivot {
    return DragTopic._dragPivot;
  }

  getPosition(): PositionType {
    return this._position;
  }

  isDragTopic(): boolean {
    return true;
  }

  applyChanges(workspace: Canvas) {
    $assert(workspace, 'workspace can not be null');

    const actionDispatcher = ActionDispatcher.getInstance();
    const draggedTopic = this.getDraggedTopic();
    const topicId = draggedTopic.getId();
    const position = this.getPosition();

    if (!this.isFreeLayoutOn()) {
      let order: number | null = null;
      let parent: Topic | null = null;
      const isDragConnected = this.isConnected();
      if (isDragConnected) {
        const targetTopic = this.getConnectedToTopic();
        order = this._order;
        parent = targetTopic;
      }

      // If the node is not connected, position based on the original drag topic position.
      actionDispatcher.dragTopic(topicId, position, order, parent);
    } else {
      actionDispatcher.moveTopic(topicId, position);
    }
  }

  getConnectedToTopic(): Topic | null {
    const dragPivot = this._getDragPivot();
    return dragPivot.getTargetTopic();
  }

  isConnected(): boolean {
    return this.getConnectedToTopic() != null;
  }

  isFreeLayoutOn(): false {
    return false;
  }

  static init(workspace: Canvas) {
    $assert(workspace, 'workspace can not be null');
    const pivot: CanvasElement = DragTopic._dragPivot;
    workspace.append(pivot);
  }
}

export default DragTopic;
