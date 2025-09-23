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
import { Workspace as Workspace2D, ElementClass, ElementPeer } from '@wisemapping/web2d';
import ScreenManager from './ScreenManager';
import SizeType from './SizeType';
import CanvasElement from './CanvasElement';

class Canvas {
  private _zoom: number;

  private _screenManager: ScreenManager;

  private _isReadOnly: boolean;

  private _containerSize: SizeType;

  private _workspace: Workspace2D;

  private _eventsEnabled: boolean;

  private _renderQueue: (ElementClass<ElementPeer> | CanvasElement)[];

  private _queueRenderEnabled: boolean;

  private _mouseMoveListener;

  private _mouseUpListener;

  constructor(screenManager: ScreenManager, zoom: number, isReadOnly: boolean) {
    // Create a suitable container ...
    $assert(screenManager, 'Div container can not be null');
    $assert(zoom, 'zoom container can not be null');

    this._zoom = zoom;
    this._screenManager = screenManager;
    this._isReadOnly = isReadOnly;

    const divContainer = screenManager.getContainer();
    this._containerSize = {
      width: Number.parseInt(divContainer.css('width'), 10),
      height: Number.parseInt(divContainer.css('height'), 10),
    };
    // Initialize web2d workspace.
    const workspace = this._createWorkspace();
    this._workspace = workspace;

    // Append to the workspace...
    workspace.addItAsChildTo(divContainer);

    this.setZoom(zoom, true);
    this._renderQueue = [];
    this._eventsEnabled = false;
    this._queueRenderEnabled = false;
    this._mouseMoveListener = null;
    this._mouseUpListener = null;
  }

  private _adjustWorkspace(): void {
    this.setZoom(this._zoom, false);
  }

  registerEvents() {
    // Register drag events ...
    this._registerDragEvents();
    this._eventsEnabled = true;

    // Readjust if the window is resized ...
    window.addEventListener('resize', () => {
      this._adjustWorkspace();
    });
  }

  isReadOnly(): boolean {
    return this._isReadOnly;
  }

  private _createWorkspace(): Workspace2D {
    // Initialize workspace ...
    const browserVisibleSize = this._screenManager.getVisibleBrowserSize();
    const coordOriginX = -(browserVisibleSize.width / 2);
    const coordOriginY = -(browserVisibleSize.height / 2);

    const workspaceProfile = {
      width: `${this._containerSize.width}px`,
      height: `${this._containerSize.height}px`,
      coordSizeWidth: browserVisibleSize.width,
      coordSizeHeight: browserVisibleSize.height,
      coordOriginX,
      coordOriginY,
      fillColor: 'transparent',
      strokeWidth: 0,
    };

    return new Workspace2D(workspaceProfile);
  }

  append(shape: ElementClass<ElementPeer> | CanvasElement): void {
    if (this._queueRenderEnabled) {
      this._renderQueue.push(shape);
    } else {
      this.appendInternal(shape);
    }
  }

  private appendInternal(shape: CanvasElement | ElementClass<ElementPeer>): void {
    // eslint-disable-next-line dot-notation
    if (typeof shape['addToWorkspace'] === 'function') {
      (shape as CanvasElement).addToWorkspace(this);
    } else {
      this._workspace.append(shape as ElementClass<ElementPeer>);
    }
  }

  enableQueueRender(value: boolean): Promise<void> {
    this._queueRenderEnabled = value;

    let result = Promise.resolve();
    if (!value) {
      // eslint-disable-next-line arrow-body-style
      result = Canvas.delay(100).then(() => {
        return this.processRenderQueue(this._renderQueue.reverse(), 300);
      });
    }
    return result;
  }

  private static delay(t: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, t);
    });
  }

  private processRenderQueue(
    renderQueue: (ElementClass<ElementPeer> | CanvasElement)[],
    batch: number,
  ): Promise<void> {
    let result: Promise<void>;

    if (renderQueue.length > 0) {
      result = new Promise(
        (resolve: (queue: (ElementClass<ElementPeer> | CanvasElement)[]) => void) => {
          for (let i = 0; i < batch && renderQueue.length > 0; i++) {
            const elem = renderQueue.pop()!;
            this.appendInternal(elem);
          }

          resolve(renderQueue);
        },
      ).then((queue) => Canvas.delay(30).then(() => this.processRenderQueue(queue, batch)));
    } else {
      result = Promise.resolve();
    }
    return result;
  }

  removeChild(shape: ElementClass<ElementPeer> | CanvasElement): void {
    // eslint-disable-next-line dot-notation
    if (typeof shape['removeFromWorkspace'] === 'function') {
      (shape as CanvasElement).removeFromWorkspace(this);
    } else {
      this._workspace.removeChild(shape as ElementClass<ElementPeer>);
    }
  }

  addEvent(type: string, listener: (event: MouseEvent) => void): void {
    this._workspace.addEvent(type, listener);
  }

  removeEvent(type: string, listener: (event: MouseEvent) => void): void {
    $assert(type, 'type can not be null');
    $assert(listener, 'listener can not be null');
    this._workspace.removeEvent(type, listener);
  }

  getSize(): SizeType {
    return this._workspace.getCoordSize();
  }

  setZoom(zoom: number, center = false): void {
    const workspace = this._workspace;

    const divContainer = this._screenManager.getContainer();
    const containerWidth = divContainer.width()!;
    const containerHeight = divContainer.height()!;
    const newVisibleAreaSize = { width: containerWidth, height: containerHeight };

    // - svg must fit container size
    const svgElement = divContainer.find('svg');
    svgElement.attr('width', containerWidth);
    svgElement.attr('height', containerHeight);
    // - svg viewPort must fit container size with zoom adjustment
    const newCoordWidth = containerWidth * zoom;
    const newCoordHeight = containerHeight * zoom;

    let coordOriginX: number;
    let coordOriginY: number;
    if (center) {
      // Center and define a new center of coordinates ...
      coordOriginX = -(newVisibleAreaSize.width / 2) * zoom;
      coordOriginY = -(newVisibleAreaSize.height / 2) * zoom;
    } else {
      // Default behavior: Calculate the center of what the user actually sees in the workspace
      const oldCoordOrigin = workspace.getCoordOrigin();
      const oldCoordSize = workspace.getCoordSize();

      // The center of the visible area in workspace coordinates is:
      // The coordinate origin plus half the coordinate size (which represents the visible area)
      const visibleCenterX = oldCoordOrigin.x + oldCoordSize.width / 2;
      const visibleCenterY = oldCoordOrigin.y + oldCoordSize.height / 2;

      // Calculate new coordinate origin to keep this center point in the same place
      // after zoom change
      coordOriginX = visibleCenterX - newCoordWidth / 2;
      coordOriginY = visibleCenterY - newCoordHeight / 2;
    }

    this._zoom = zoom;
    workspace.setCoordOrigin(coordOriginX, coordOriginY);
    workspace.setCoordSize(newCoordWidth, newCoordHeight);

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

  getSVGElement(): Element {
    return this._workspace.getSVGElement();
  }

  setBackgroundStyle(css: string): void {
    const elem = this.getSVGElement().parentElement!.parentElement!;
    elem.setAttribute('style', css);
  }

  private _registerDragEvents() {
    const workspace = this._workspace;
    const screenManager = this._screenManager;
    const mWorkspace = this;
    const mouseDownListener = (event: MouseEvent) => {
      if (!this._mouseMoveListener) {
        if (mWorkspace.isWorkspaceEventsEnabled()) {
          mWorkspace.enableWorkspaceEvents(false);

          const mouseDownPosition = screenManager.getWorkspaceMousePosition(event);
          const originalCoordOrigin = workspace.getCoordOrigin();

          let wasDragged = false;
          this._mouseMoveListener = (mouseMoveEvent: MouseEvent) => {
            const currentMousePosition = screenManager.getWorkspaceMousePosition(mouseMoveEvent);

            const offsetX = currentMousePosition.x - mouseDownPosition.x;
            const coordOriginX = -offsetX + originalCoordOrigin.x;

            const offsetY = currentMousePosition.y - mouseDownPosition.y;
            const coordOriginY = -offsetY + originalCoordOrigin.y;

            workspace.setCoordOrigin(coordOriginX, coordOriginY);

            // Change cursor.
            window.document.body.style.cursor = 'move';
            // If I dont ignore touchmove events, browser console shows a lot of errors:
            // Unable to preventDefault inside passive event listener invocation.
            if (mouseMoveEvent.type !== 'touchmove') {
              mouseMoveEvent.preventDefault();
            }

            // Fire drag event ...
            screenManager.fireEvent('update');
            wasDragged = true;
          };
          screenManager.addEvent('mousemove', this._mouseMoveListener);
          screenManager.addEvent('touchmove', this._mouseMoveListener);

          // Register mouse up listeners ...
          this._mouseUpListener = () => {
            screenManager.removeEvent('mousemove', this._mouseMoveListener);
            screenManager.removeEvent('mouseup', this._mouseUpListener);
            screenManager.removeEvent('touchmove', this._mouseUpListener);
            screenManager.removeEvent('touchend', this._mouseMoveListener);
            this._mouseUpListener = null;
            this._mouseMoveListener = null;
            window.document.body.style.cursor = 'default';

            // Update screen manager offset.
            const coordOrigin = workspace.getCoordOrigin();
            screenManager.setOffset(coordOrigin.x, coordOrigin.y);
            mWorkspace.enableWorkspaceEvents(true);

            if (!wasDragged) {
              screenManager.fireEvent('click');
            }
          };
          screenManager.addEvent('mouseup', this._mouseUpListener);
          screenManager.addEvent('touchend', this._mouseUpListener);
        }
      } else {
        this._mouseUpListener();
      }
    };
    screenManager.addEvent('mousedown', mouseDownListener);
    screenManager.addEvent('touchstart', mouseDownListener);
  }

  getZoom() {
    return this._zoom;
  }
}

export default Canvas;
