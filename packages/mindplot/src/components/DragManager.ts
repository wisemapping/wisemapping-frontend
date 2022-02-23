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
import DragTopic from './DragTopic';
import EventBusDispatcher from './layout/EventBusDispatcher';
import Topic from './Topic';
import Workspace from './Workspace';

class DragManager {
  private _workspace: Workspace;

  private _designerModel: Workspace;

  private _isDragInProcess: boolean;

  private _eventDispatcher: EventBusDispatcher;

  private _listeners;

  private _mouseMoveListener;

  private _mouseUpListener;

  constructor(workspace: Workspace, eventDispatcher: EventBusDispatcher) {
    this._workspace = workspace;
    this._designerModel = workspace;
    this._listeners = {};
    this._isDragInProcess = false;
    this._eventDispatcher = eventDispatcher;
    DragTopic.init(this._workspace);
  }

  add(topic: Topic) {
    // Add behaviour ...
    const workspace = this._workspace;
    const screen = workspace.getScreenManager();
    const dragManager = this;
    const me = this;
    const mouseDownListener = function mouseDownListener() {
      if (workspace.isWorkspaceEventsEnabled()) {
        // Disable double drag...
        workspace.enableWorkspaceEvents(false);

        // Set initial position.
        const layoutManager = me._eventDispatcher.getLayoutManager();
        const dragNode = topic.createDragNode(layoutManager);

        // Register mouse move listener ...
        const mouseMoveListener = dragManager._buildMouseMoveListener(
          workspace, dragNode, dragManager,
        );
        screen.addEvent('mousemove', mouseMoveListener);

        // Register mouse up listeners ...
        const mouseUpListener = dragManager._buildMouseUpListener(
          workspace, topic, dragNode, dragManager,
        );
        screen.addEvent('mouseup', mouseUpListener);

        // Change cursor.
        window.document.body.style.cursor = 'move';
      }
    };
    topic.addEvent('mousedown', mouseDownListener);
  }

  remove() {
    throw new Error('Not implemented: DragManager.prototype.remove');
  }

  protected _buildMouseMoveListener(workspace: Workspace, dragNode, dragManager: DragManager) {
    const screen = workspace.getScreenManager();
    const me = this;
    const result = (event) => {
      if (!me._isDragInProcess) {
        // Execute Listeners ..
        const startDragListener = dragManager._listeners.startdragging;
        startDragListener(event, dragNode);

        // Add shadow node to the workspace.
        workspace.append(dragNode);

        me._isDragInProcess = true;
      }

      const pos = screen.getWorkspaceMousePosition(event);
      dragNode.setPosition(pos.x, pos.y);

      // Call mouse move listeners ...
      const dragListener = dragManager._listeners.dragging;
      if ($defined(dragListener)) {
        dragListener(event, dragNode);
      }

      event.preventDefault();
    };

    // allowed param reassign to avoid risks of existing code relying in this side-effect
    dragManager._mouseMoveListener = result;
    return result;
  }

  protected _buildMouseUpListener(workspace: Workspace, topic: Topic, dragNode, dragManager: DragManager) {
    const screen = workspace.getScreenManager();
    const me = this;
    const result = (event: Event) => {
      $assert(dragNode.isDragTopic, 'dragNode must be an DragTopic');

      // Remove all the events.
      screen.removeEvent('mousemove', dragManager._mouseMoveListener);
      screen.removeEvent('mouseup', dragManager._mouseUpListener);

      // Help GC
      // allowed param reassign to avoid risks of existing code relying in this side-effect
      dragManager._mouseMoveListener = null;
      dragManager._mouseUpListener = null;

      workspace.enableWorkspaceEvents(true);
      // Change the cursor to the default.
      window.document.body.style.cursor = 'default';

      if (me._isDragInProcess) {
        // Execute Listeners only if the node has been moved.
        const endDragListener = dragManager._listeners.enddragging;
        endDragListener(event, dragNode);

        // Remove drag node from the workspace.
        dragNode.removeFromWorkspace(workspace);

        me._isDragInProcess = false;
      }
    };
    dragManager._mouseUpListener = result;
    return result;
  }

  /**
     * type:
     *  - startdragging.
     *  - dragging
     *  - enddragging
     */
  addEvent(type: string, listener) {
    this._listeners[type] = listener;
  }
}

export default DragManager;
