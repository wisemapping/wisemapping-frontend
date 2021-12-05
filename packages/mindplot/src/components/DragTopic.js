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
import * as web2d from '@wisemapping/web2d';

import ActionDispatcher from './ActionDispatcher';
import DragPivot from './DragPivot';

class DragTopic {
  constructor(dragShape, draggedNode, layoutManger) {
    $assert(dragShape, 'Rect can not be null.');
    $assert(draggedNode, 'draggedNode can not be null.');
    $assert(layoutManger, 'layoutManger can not be null.');

    this._elem2d = dragShape;
    this._order = null;
    this._draggedNode = draggedNode;
    this._layoutManager = layoutManger;
    this._position = new web2d.Point();
    this._isInWorkspace = false;
    this._isFreeLayoutEnabled = false;
  }

  setOrder(order) {
    this._order = order;
  }

  setPosition(x, y) {
    // Update drag shadow position ....
    let position = { x, y };
    if (this.isFreeLayoutOn() && this.isConnected()) {
      const { _layoutManager } = this;
      const par = this.getConnectedToTopic();
      position = _layoutManager.predict(
        par.getId(),
        this._draggedNode.getId(),
        position,
        true,
      ).position;
    }
    this._position.setValue(position.x, position.y);

    // Elements are positioned in the center.
    // All topic element must be positioned based on the innerShape.
    const draggedNode = this._draggedNode;
    const size = draggedNode.getSize();
    const cx = position.x - (position.x > 0 ? 0 : size.width);
    const cy = Math.ceil(position.y - size.height / 2);
    this._elem2d.setPosition(cx, cy);

    // In case is not free, pivot must be draw ...
    if (this.isConnected() && !this.isFreeLayoutOn()) {
      const parent = this.getConnectedToTopic();
      const predict = this._layoutManager.predict(
        parent.getId(),
        this._draggedNode.getId(),
        this.getPosition(),
      );
      if (this._order != predict.order) {
        const dragPivot = this._getDragPivot();
        const pivotPosition = predict.position;
        dragPivot.connectTo(parent, pivotPosition);
        this.setOrder(predict.order);
      }
    }
  }

  updateFreeLayout(event) {
    const isFreeEnabled = (event.metaKey && Browser.Platform.mac) || (event.ctrlKey && !Browser.Platform.mac);
    if (this.isFreeLayoutOn() != isFreeEnabled) {
      const dragPivot = this._getDragPivot();
      dragPivot.setVisibility(!isFreeEnabled);
      this._isFreeLayoutEnabled = isFreeEnabled;
    }
  }

  setVisibility(value) {
    const dragPivot = this._getDragPivot();
    dragPivot.setVisibility(value);
  }

  isVisible() {
    const dragPivot = this._getDragPivot();
    return dragPivot.isVisible();
  }

  getInnerShape() {
    return this._elem2d;
  }

  disconnect(workspace) {
    // Clear connection line ...
    const dragPivot = this._getDragPivot();
    dragPivot.disconnect(workspace);
  }

  connectTo(parent) {
    $assert(parent, 'Parent connection node can not be null.');

    // Where it should be connected ?

    // @todo: This is a hack for the access of the editor. It's required to review why this is needed forcing the declaration of a global variable.
    const predict = designer._eventBussDispatcher._layoutManager.predict(
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

  getDraggedTopic() {
    return this._draggedNode;
  }

  removeFromWorkspace(workspace) {
    if (this._isInWorkspace) {
      // Remove drag shadow.
      workspace.removeChild(this._elem2d);

      // Remove pivot shape. To improve performance it will not be removed. Only the visibility will be changed.
      const dragPivot = this._getDragPivot();
      dragPivot.setVisibility(false);

      this._isInWorkspace = false;
    }
  }

  isInWorkspace() {
    return this._isInWorkspace;
  }

  addToWorkspace(workspace) {
    if (!this._isInWorkspace) {
      workspace.append(this._elem2d);
      const dragPivot = this._getDragPivot();
      dragPivot.addToWorkspace(workspace);
      this._isInWorkspace = true;
    }
  }

  _getDragPivot() {
    return DragTopic.__getDragPivot();
  }

  getPosition() {
    return this._position;
  }

  isDragTopic() {
    return true;
  }

  applyChanges(workspace) {
    $assert(workspace, 'workspace can not be null');

    const actionDispatcher = ActionDispatcher.getInstance();
    const draggedTopic = this.getDraggedTopic();
    const topicId = draggedTopic.getId();
    const position = this.getPosition();

    if (!this.isFreeLayoutOn()) {
      let order = null;
      let parent = null;
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

  getConnectedToTopic() {
    const dragPivot = this._getDragPivot();
    return dragPivot.getTargetTopic();
  }

  isConnected() {
    return this.getConnectedToTopic() != null;
  }

  isFreeLayoutOn() {
    //        return  this._isFreeLayoutEnabled;
    // Disable free layout ...
    return false;
  }
}

DragTopic.init = function (workspace) {
  $assert(workspace, 'workspace can not be null');
  const pivot = DragTopic.__getDragPivot();
  workspace.append(pivot);
};

DragTopic.__getDragPivot = function () {
  let result = DragTopic._dragPivot;
  if (!$defined(result)) {
    result = new DragPivot();
    DragTopic._dragPivot = result;
  }
  return result;
};

export default DragTopic;
