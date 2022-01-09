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
import { Workspace as Workspace2D } from '@wisemapping/web2d';
import ScreenManager from './ScreenManager';

class Workspace {
  _zoom: number;
  _screenManager: ScreenManager;
  _isReadOnly: boolean;
  _screenWidth: number;
  _screenHeight: number;
  _workspace: Workspace2D;
  _eventsEnabled: boolean;
  _viewPort: { height: number, width: number };

  constructor(screenManager: ScreenManager, zoom: number, isReadOnly: boolean) {
    // Create a suitable container ...
    $assert(screenManager, 'Div container can not be null');
    $assert(zoom, 'zoom container can not be null');

    this._zoom = zoom;
    this._screenManager = screenManager;
    this._isReadOnly = isReadOnly;

    const divContainer = screenManager.getContainer();
    this._screenWidth = Number.parseInt(divContainer.css('width'), 10);
    this._screenHeight = Number.parseInt(divContainer.css('height'), 10);

    // Initialize web2d workspace.
    const workspace = this._createWorkspace();
    this._workspace = workspace;

    // Append to the workspace...
    workspace.addItAsChildTo(divContainer);
    this.setZoom(zoom, true);

    // Register drag events ...
    this._registerDragEvents();
    this._eventsEnabled = true;
  }

  get isReadOnly() {
    return this._isReadOnly;
  }

  private _createWorkspace() {
    // Initialize workspace ...
    const coordOriginX = -(this._screenWidth / 2);
    const coordOriginY = -(this._screenHeight / 2);

    const workspaceProfile = {
      width: `${this._screenWidth}px`,
      height: `${this._screenHeight}px`,
      coordSizeWidth: this._screenWidth,
      coordSizeHeight: this._screenHeight,
      coordOriginX,
      coordOriginY,
      fillColor: 'transparent',
      strokeWidth: 0,
    };

    return new Workspace2D(workspaceProfile);
  }

  append(shape) {
    if ($defined(shape.addToWorkspace)) {
      shape.addToWorkspace(this);
    } else {
      this._workspace.append(shape);
    }
  }

  removeChild(shape) {
    // Element is a node, not a web2d element?
    if ($defined(shape.removeFromWorkspace)) {
      shape.removeFromWorkspace(this);
    } else {
      this._workspace.removeChild(shape);
    }
  }

  addEvent(type, listener) {
    this._workspace.addEvent(type, listener);
  }

  removeEvent(type, listener) {
    $assert(type, 'type can not be null');
    $assert(listener, 'listener can not be null');
    this._workspace.removeEvent(type, listener);
  }

  getSize() {
    return this._workspace.getCoordSize();
  }

  setZoom(zoom: number, center: boolean = false): void {
    this._zoom = zoom;
    const workspace = this._workspace;

    // Calculate the original boxview size ...
    let origWidth = 0;
    let origHeight = 0
    if (this._viewPort) {
      origWidth = this._viewPort.width;
      origHeight = this._viewPort.height;
    }

    // Update coord scale...
    const coordWidth = zoom * this._screenWidth;
    const coordHeight = zoom * this._screenHeight;
    workspace.setCoordSize(coordWidth, coordHeight);

    // View port coords ...
    if (this._viewPort) {
      this._viewPort.width *= zoom;
      this._viewPort.height *= zoom;
    }

    // Center topic....
    let coordOriginX: number;
    let coordOriginY: number;

    if (center) {
      if (this._viewPort) {
        coordOriginX = -(this._viewPort.width / 2);
        coordOriginY = -(this._viewPort.height / 2);
      } else {
        coordOriginX = -(coordWidth / 2);
        coordOriginY = -(coordHeight / 2);
      }
    } else {
      // Zoom keeping the center in the same place ...
      // const xPaddinng = (this._viewPort.width - origWidth) / 2;
      // const yPaddinng = (this._viewPort.height - origHeight) / 2;

      // const coordOrigin = workspace.getCoordOrigin();
      // coordOriginX = coordOrigin.x - xPaddinng;
      // coordOriginY = coordOrigin.y - yPaddinng;
      const coordOrigin = workspace.getCoordOrigin();
      coordOriginX = coordOrigin.x;
      coordOriginY = coordOrigin.y;

    }
    workspace.setCoordOrigin(coordOriginX, coordOriginY);

    // Update screen.
    this._screenManager.setOffset(coordOriginX, coordOriginY);
    this._screenManager.setScale(zoom);

    // Some changes in the screen. Let's fire an update event...
    this._screenManager.fireEvent('update');
  }

  getScreenManager(): ScreenManager {
    return this._screenManager;
  }

  enableWorkspaceEvents(value: boolean) {
    this._eventsEnabled = value;
  }

  isWorkspaceEventsEnabled(): boolean {
    return this._eventsEnabled;
  }

  getSVGElement() {
    return this._workspace.getSVGElement();
  }

  private _registerDragEvents() {
    const workspace = this._workspace;
    const screenManager = this._screenManager;
    const mWorkspace = this;
    const mouseDownListener = function mouseDownListener(event) {
      if (!$defined(workspace._mouseMoveListener)) {
        if (mWorkspace.isWorkspaceEventsEnabled()) {
          mWorkspace.enableWorkspaceEvents(false);

          const mouseDownPosition = screenManager.getWorkspaceMousePosition(event);
          const originalCoordOrigin = workspace.getCoordOrigin();

          let wasDragged = false;
          workspace._mouseMoveListener = (mouseMoveEvent) => {
            const currentMousePosition = screenManager.getWorkspaceMousePosition(mouseMoveEvent);

            const offsetX = currentMousePosition.x - mouseDownPosition.x;
            const coordOriginX = -offsetX + originalCoordOrigin.x;

            const offsetY = currentMousePosition.y - mouseDownPosition.y;
            const coordOriginY = -offsetY + originalCoordOrigin.y;

            workspace.setCoordOrigin(coordOriginX, coordOriginY);

            // Change cursor.
            window.document.body.style.cursor = 'move';
            mouseMoveEvent.preventDefault();

            // Fire drag event ...
            screenManager.fireEvent('update');
            wasDragged = true;
          };
          screenManager.addEvent('mousemove', workspace._mouseMoveListener);

          // Register mouse up listeners ...
          workspace._mouseUpListener = () => {
            screenManager.removeEvent('mousemove', workspace._mouseMoveListener);
            screenManager.removeEvent('mouseup', workspace._mouseUpListener);
            workspace._mouseUpListener = null;
            workspace._mouseMoveListener = null;
            window.document.body.style.cursor = 'default';

            // Update screen manager offset.
            const coordOrigin = workspace.getCoordOrigin();
            screenManager.setOffset(coordOrigin.x, coordOrigin.y);
            mWorkspace.enableWorkspaceEvents(true);

            if (!wasDragged) {
              screenManager.fireEvent('click');
            }
          };
          screenManager.addEvent('mouseup', workspace._mouseUpListener);
        }
      } else {
        workspace._mouseUpListener();
      }
    };
    screenManager.addEvent('mousedown', mouseDownListener);
  }

  setViewPort(size: { height: number, width: number }) {
    this._viewPort = size;
  }
}

export default Workspace;
