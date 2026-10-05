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
import { Workspace as Workspace2D, ElementClass, ElementPeer } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import ScreenManager from './ScreenManager';
import SizeType from './SizeType';
import CanvasElement from './CanvasElement';
import LayoutEventBus from './layout/LayoutEventBus';
import PositionType from './PositionType';

const DEFAULT_VISIBILITY_PADDING = 80;
const VISIBILITY_PADDING_RATIO = 0.08;
type BoundsType = { left: number; right: number; top: number; bottom: number };

class Canvas {
  private _zoom: number;

  private _screenManager: ScreenManager;

  private _isReadOnly: boolean;

  private _containerSize: SizeType;

  private _workspace: Workspace2D;

  private _eventsEnabled: boolean;

  private _renderQueue: (ElementClass<ElementPeer> | CanvasElement)[];

  private _queueRenderEnabled: boolean;

  private _mouseMoveListener: ((event: Event) => void) | null;

  private _mouseUpListener: (() => void) | null;

  // Ends the pan in progress without treating it as a release (window blur, dispose) ...
  private _cancelPan: (() => void) | null;

  private _mouseDownListener: ((event: Event) => void) | null;

  private _resizeListener: (() => void) | null;

  private _resizeHandler: (() => void) | null = null;

  constructor(
    screenManager: ScreenManager,
    zoom: number,
    isReadOnly: boolean,
    delayRenderQueue: boolean,
  ) {
    // Create a suitable container ...
    $assert(screenManager, 'Div container can not be null');
    $assert(zoom, 'zoom container can not be null');

    this._zoom = zoom;
    this._screenManager = screenManager;
    this._isReadOnly = isReadOnly;

    const divContainer = screenManager.getContainer();
    this._containerSize = {
      width: screenManager.getContainerWidth(),
      height: screenManager.getContainerHeight(),
    };
    // Initialize web2d workspace.
    const workspace = this._createWorkspace();
    this._workspace = workspace;

    // Append to the workspace...
    workspace.addItAsChildTo(divContainer as HTMLDivElement);

    this.setZoom(zoom, true);
    this._renderQueue = [];
    this._eventsEnabled = false;
    this._queueRenderEnabled = delayRenderQueue;
    this._mouseMoveListener = null;
    this._mouseUpListener = null;
    this._cancelPan = null;
    this._mouseDownListener = null;
    this._resizeListener = null;
  }

  /** Fits the viewport to the container's new size, keeping the zoom and the centre of the view. */
  adjustToContainer(): void {
    this.setZoom(this._zoom, false);
  }

  /** Handles a container resize instead of adjustToContainer(), or null for the default. */
  setResizeHandler(handler: (() => void) | null): void {
    this._resizeHandler = handler;
  }

  registerEvents() {
    // Called on every map load: the listeners must be registered only once ...
    if (!this._mouseDownListener) {
      // Register drag events ...
      this._registerDragEvents();

      // Readjust if the window is resized ...
      this._resizeListener = () => {
        if (this._resizeHandler) {
          this._resizeHandler();
        } else {
          this.adjustToContainer();
        }
      };
      window.addEventListener('resize', this._resizeListener);
    }
    this._eventsEnabled = true;
  }

  /**
   * Removes the listeners registered on the window and the container, ending any pan in progress,
   * and the workspace SVG from the container: a designer built again on it adds its own.
   */
  dispose(): void {
    if (this._cancelPan) {
      this._cancelPan();
    }

    if (this._resizeListener) {
      window.removeEventListener('resize', this._resizeListener);
      this._resizeListener = null;
    }

    if (this._mouseDownListener) {
      this._screenManager.removeEvent('mousedown', this._mouseDownListener);
      this._screenManager.removeEvent('touchstart', this._mouseDownListener);
      this._mouseDownListener = null;
    }
    this._eventsEnabled = false;

    this._workspace._getHtmlContainer().remove();
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
    if (typeof (shape as Partial<CanvasElement>).addToWorkspace === 'function') {
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
    if (typeof (shape as Partial<CanvasElement>).removeFromWorkspace === 'function') {
      (shape as CanvasElement).removeFromWorkspace(this);
    } else {
      this._workspace.removeChild(shape as ElementClass<ElementPeer>);
    }
  }

  addEvent(type: string, listener: (event: Event, detail?: unknown) => void): void {
    this._workspace.addEvent(type, listener);
  }

  removeEvent(type: string, listener: (event: Event, detail?: unknown) => void): void {
    $assert(type, 'type can not be null');
    $assert(listener, 'listener can not be null');
    this._workspace.removeEvent(type, listener);
  }

  getSize(): SizeType {
    return this._workspace.getCoordSize();
  }

  setZoom(zoom: number, center = false): void {
    const workspace = this._workspace;

    const containerWidth = this._screenManager.getContainerWidth();
    const containerHeight = this._screenManager.getContainerHeight();
    const newVisibleAreaSize = { width: containerWidth, height: containerHeight };

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

    this._applyViewport(zoom, coordOriginX, coordOriginY);
  }

  /**
   * Sets the zoom and pans so that `position` (in workspace coordinates) is drawn at
   * `screenPoint` (in pixels from the container's top-left corner).
   */
  setZoomAt(zoom: number, position: PositionType, screenPoint: PositionType): void {
    this._applyViewport(zoom, position.x - screenPoint.x * zoom, position.y - screenPoint.y * zoom);
  }

  /**
   * The one place the viewport changes zoom: the SVG fills the container, the viewBox is the
   * container scaled by `zoom` (workspace units per screen pixel), and the zoom kept here, the
   * screen manager's scale and the viewBox all agree.
   */
  private _applyViewport(zoom: number, coordOriginX: number, coordOriginY: number): void {
    const workspace = this._workspace;
    const containerWidth = this._screenManager.getContainerWidth();
    const containerHeight = this._screenManager.getContainerHeight();

    // - svg must fit container size. Go through the workspace so its size stays in sync: the inline
    // editor's font size is scaled by it (W-HTMLFONT).
    workspace.setSize(`${containerWidth}px`, `${containerHeight}px`);

    this._zoom = zoom;
    workspace.setCoordOrigin(coordOriginX, coordOriginY);
    workspace.setCoordSize(containerWidth * zoom, containerHeight * zoom);

    // Update screen.
    this._screenManager.setOffset(coordOriginX, coordOriginY);
    this._screenManager.setScale(zoom);

    // Some changes in the screen. Let's fire an update event...
    this._screenManager.fireEvent('update');
    // Also fire LayoutEventBus event for canvas zooming
    LayoutEventBus.fireEvent('canvasZoomed', { zoom });
  }

  getScreenManager(): ScreenManager {
    return this._screenManager;
  }

  setCoordOrigin(x: number, y: number): void {
    this._workspace.setCoordOrigin(x, y);
  }

  getCoordOrigin(): PositionType {
    return this._workspace.getCoordOrigin();
  }

  panBy(deltaX: number, deltaY: number): void {
    if (deltaX === 0 && deltaY === 0) return;
    const origin = this._workspace.getCoordOrigin();
    const newOriginX = origin.x + deltaX * this._zoom;
    const newOriginY = origin.y + deltaY * this._zoom;

    this._workspace.setCoordOrigin(newOriginX, newOriginY);
    this._screenManager.setOffset(newOriginX, newOriginY);
    this._screenManager.fireEvent('update');
    LayoutEventBus.fireEvent('canvasPanned');
  }

  setCoordSize(width: number, height: number): void {
    this._workspace.setCoordSize(width, height);
  }

  setZoomValue(zoom: number): void {
    this._zoom = zoom;
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
    let panUpdateScheduled = false;
    const schedulePanUpdate = () => {
      if (!panUpdateScheduled) {
        panUpdateScheduled = true;
        requestAnimationFrame(() => {
          LayoutEventBus.fireEvent('canvasPanned');
          panUpdateScheduled = false;
        });
      }
    };

    const mouseDownListener = (event: Event) => {
      if (!this._mouseMoveListener) {
        if (mWorkspace.isWorkspaceEventsEnabled()) {
          // Don't prevent default on touchstart to allow node selection
          // Multi-touch (pinch-zoom) should not trigger panning
          if (event.type === 'touchstart') {
            const touchEvent = event as TouchEvent;
            if (touchEvent.touches.length > 1) {
              // Multi-touch detected (pinch), don't handle it - let browser handle zoom.
              // Checked before disabling workspace events, as nothing would re-enable them.
              return;
            }
          }

          mWorkspace.enableWorkspaceEvents(false);

          const originalEvent = event;
          const mouseDownPosition = screenManager.getWorkspaceMousePosition(
            originalEvent as MouseEvent,
          );
          const originalCoordOrigin = workspace.getCoordOrigin();

          let wasDragged = false;
          this._mouseMoveListener = (mouseMoveEvent: Event) => {
            const originalMoveEvent = mouseMoveEvent;
            const currentMousePosition = screenManager.getWorkspaceMousePosition(
              originalMoveEvent as MouseEvent,
            );

            const offsetX = currentMousePosition.x - mouseDownPosition.x;
            const coordOriginX = -offsetX + originalCoordOrigin.x;

            const offsetY = currentMousePosition.y - mouseDownPosition.y;
            const coordOriginY = -offsetY + originalCoordOrigin.y;

            workspace.setCoordOrigin(coordOriginX, coordOriginY);

            // Change cursor.
            window.document.body.style.cursor = 'move';

            // Prevent default behavior for mouse and single-touch events
            // This prevents pull-to-refresh and text selection during drag
            if (mouseMoveEvent.type !== 'touchmove') {
              mouseMoveEvent.preventDefault();
            } else {
              const touchEvent = mouseMoveEvent as TouchEvent;
              if (touchEvent.touches.length === 1) {
                mouseMoveEvent.preventDefault();
              }
            }

            // Fire drag event ...
            screenManager.fireEvent('update');
            // Also fire LayoutEventBus event for canvas panning (throttled via requestAnimationFrame)
            schedulePanUpdate();
            wasDragged = true;
          };
          // Mouse events are listened on the document, so that a release outside the container
          // still ends the pan. Touch events always go to the element the touch started on.
          window.document.addEventListener('mousemove', this._mouseMoveListener);
          screenManager.addEvent('touchmove', this._mouseMoveListener);

          const endPan = (isRelease: boolean) => {
            // The listeners are all set together when the pan starts, before it can end.
            const mouseMoveListener = this._mouseMoveListener!;
            const mouseUpListener = this._mouseUpListener!;
            const cancelPan = this._cancelPan!;
            window.document.removeEventListener('mousemove', mouseMoveListener);
            window.document.removeEventListener('mouseup', mouseUpListener);
            screenManager.removeEvent('touchmove', mouseMoveListener);
            screenManager.removeEvent('touchend', mouseUpListener);
            screenManager.removeEvent('touchcancel', cancelPan);
            window.removeEventListener('blur', cancelPan);
            this._mouseUpListener = null;
            this._mouseMoveListener = null;
            this._cancelPan = null;
            window.document.body.style.cursor = 'default';

            // Update screen manager offset.
            const coordOrigin = workspace.getCoordOrigin();
            screenManager.setOffset(coordOrigin.x, coordOrigin.y);
            mWorkspace.enableWorkspaceEvents(true);

            if (isRelease && !wasDragged) {
              screenManager.fireEvent('click');
            }
          };
          // The button can be released where no mouseup reaches the page (another window) ...
          this._cancelPan = () => endPan(false);

          // Register mouse up listeners ...
          this._mouseUpListener = () => endPan(true);
          window.document.addEventListener('mouseup', this._mouseUpListener);
          screenManager.addEvent('touchend', this._mouseUpListener);
          screenManager.addEvent('touchcancel', this._cancelPan);
          window.addEventListener('blur', this._cancelPan);
        }
      } else {
        // A press while a pan is in progress (the release never reached the page, or a second
        // button or finger): end the pan, but it is not a release, so it must not fire a click.
        this._cancelPan!();
      }
    };
    this._mouseDownListener = mouseDownListener;
    screenManager.addEvent('mousedown', mouseDownListener);
    screenManager.addEvent('touchstart', mouseDownListener);
  }

  ensureVisible(bounds: BoundsType, minPadding = DEFAULT_VISIBILITY_PADDING): boolean {
    const workspace = this._workspace;
    const origin = workspace.getCoordOrigin();
    const coordSize = workspace.getCoordSize();

    const computePadding = (length: number) => {
      const relativePadding = length * VISIBILITY_PADDING_RATIO;
      const desiredPadding = Math.max(relativePadding, minPadding);
      return Math.min(desiredPadding, length / 2);
    };

    const paddingX = computePadding(coordSize.width);
    const paddingY = computePadding(coordSize.height);

    const viewLeft = origin.x;
    const viewTop = origin.y;
    const viewRight = origin.x + coordSize.width;
    const viewBottom = origin.y + coordSize.height;

    const paddedLeft = viewLeft + paddingX;
    const paddedRight = viewRight - paddingX;
    const paddedTop = viewTop + paddingY;
    const paddedBottom = viewBottom - paddingY;

    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;

    const needsBothHorizontal = bounds.left < paddedLeft && bounds.right > paddedRight;
    const needsBothVertical = bounds.top < paddedTop && bounds.bottom > paddedBottom;

    let newOriginX = origin.x;
    if (needsBothHorizontal) {
      newOriginX = centerX - coordSize.width / 2;
    } else if (bounds.right > paddedRight) {
      newOriginX += bounds.right - paddedRight;
    } else if (bounds.left < paddedLeft) {
      newOriginX += bounds.left - paddedLeft;
    }

    let newOriginY = origin.y;
    if (needsBothVertical) {
      newOriginY = centerY - coordSize.height / 2;
    } else if (bounds.bottom > paddedBottom) {
      newOriginY += bounds.bottom - paddedBottom;
    } else if (bounds.top < paddedTop) {
      newOriginY += bounds.top - paddedTop;
    }

    if (newOriginX !== origin.x || newOriginY !== origin.y) {
      workspace.setCoordOrigin(newOriginX, newOriginY);
      this._screenManager.setOffset(newOriginX, newOriginY);
      this._screenManager.fireEvent('update');
      LayoutEventBus.fireEvent('canvasPanned');
      return true;
    }
    return false;
  }

  /**
   * Pans the viewport so `position` (in workspace coordinates) sits exactly at
   * the centre of the visible area.
   *
   * This is the unconditional counterpart of `ensureVisible()`: that method only
   * pans when the bounds fall outside the padded viewport and then moves by the
   * smallest amount that brings them back in, which is the right behaviour for
   * keyboard navigation. Revealing a deep-linked node instead wants the node
   * parked in the middle of the screen regardless of where it already was.
   *
   * Returns true when the viewport actually moved.
   */
  centerOnPosition(position: PositionType): boolean {
    const workspace = this._workspace;
    const coordSize = workspace.getCoordSize();
    const origin = workspace.getCoordOrigin();

    const newOriginX = position.x - coordSize.width / 2;
    const newOriginY = position.y - coordSize.height / 2;
    if (newOriginX === origin.x && newOriginY === origin.y) {
      return false;
    }

    workspace.setCoordOrigin(newOriginX, newOriginY);
    this._screenManager.setOffset(newOriginX, newOriginY);
    this._screenManager.fireEvent('update');
    LayoutEventBus.fireEvent('canvasPanned');
    return true;
  }

  getZoom() {
    return this._zoom;
  }
}

export default Canvas;
