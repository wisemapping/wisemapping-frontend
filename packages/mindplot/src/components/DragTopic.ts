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
import { ElementClass, ElementPeer, Group } from '@wisemapping/web2d';
import { $assert } from './util/assert';

import DragPivot from './DragPivot';
import LayoutManager from './layout/LayoutManager';
import NodeGraph from './NodeGraph';
import PositionType from './PositionType';
import Topic from './Topic';
import Canvas from './Canvas';
import { sideOf } from './util/side';

class DragTopic {
  private _elem2d: Group;

  private _order: number | undefined;

  private _draggedNode: NodeGraph;

  private _layoutManager: LayoutManager;

  private _position: PositionType;

  private _isInWorkspace: boolean;

  private _isCancelled: boolean;

  private _pivot: DragPivot;

  // Every workspace has its own pivot (DragTopic.init), handed to the drag topics its DragManager
  // builds inside DragTopic.withPivot() ...
  private static _scopedPivot: DragPivot | null = null;

  constructor(dragShape: Group, draggedNode: NodeGraph, layoutManger: LayoutManager) {
    this._elem2d = dragShape;
    this._order = undefined;
    this._draggedNode = draggedNode;
    this._layoutManager = layoutManger;
    this._isInWorkspace = false;
    this._isCancelled = false;
    this._position = { x: 0, y: 0 };
    // A drag topic built outside a DragManager gets a pivot of its own, on no workspace: no
    // static keeps the pivot of another (possibly disposed) workspace alive.
    this._pivot = DragTopic._scopedPivot || new DragPivot();
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

    // Position the drag shadow based on layout orientation
    // Get orientation from LayoutManager to ensure we use current layout
    const orientation = this._layoutManager.getOrientation();

    let cx: number;
    let cy: number;

    if (orientation === 'vertical') {
      // Tree layout: center horizontally, position vertically
      cx = x - size.width / 2;
      cy = y - size.height / 2;
    } else {
      // Mindmap layout: handle left/right positioning, center vertically
      cx = x - (sideOf(x) === 1 ? 0 : size.width);
      cy = Math.ceil(y - size.height / 2);
    }

    this._elem2d.setPosition(cx, cy);

    // In case is not free, pivot must be drawn ...
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
        // Ensure pivot remains visible when order changes during drag
        if (!dragPivot.isVisible()) {
          dragPivot.setVisibility(true);
        }
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
    return this._pivot;
  }

  getPosition(): PositionType {
    return this._position;
  }

  isDragTopic(): boolean {
    return true;
  }

  /**
   * Marks the drag as abandoned: applying its changes will not move the topic.
   */
  cancel(): void {
    this._isCancelled = true;
  }

  isCancelled(): boolean {
    return this._isCancelled;
  }

  applyChanges(workspace: Canvas) {
    $assert(workspace, 'workspace can not be null');
    if (this._isCancelled) {
      return;
    }

    const draggedTopic = this.getDraggedTopic();
    const actionDispatcher = draggedTopic.getActionDispatcher();
    const topicId = draggedTopic.getId();
    const position = this.getPosition();

    if (!this.isFreeLayoutOn()) {
      let order: number | undefined;
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

  /**
   * Builds the drag pivot of a workspace and adds it to it.
   */
  static init(workspace: Canvas): DragPivot {
    $assert(workspace, 'workspace can not be null');
    const pivot = new DragPivot();
    workspace.append(pivot);
    return pivot;
  }

  /**
   * Runs the build of drag topics so that they use the given pivot.
   */
  static withPivot<T>(pivot: DragPivot, build: () => T): T {
    const previous = DragTopic._scopedPivot;
    DragTopic._scopedPivot = pivot;
    try {
      return build();
    } finally {
      DragTopic._scopedPivot = previous;
    }
  }
}

export default DragTopic;
