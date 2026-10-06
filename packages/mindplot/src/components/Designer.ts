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
import { $assert } from './util/assert';
import DOMUtils from './util/DOMUtils';
import getCollapsedAncestorIds from './util/topicVisibility';
import resolveTopicMove, { TopicMove } from './util/topicReorder';
import isSelectionEmpty from './util/selectionState';
import Messages, { $msg } from './Messages';

import EventDispispatcher from './EventDispatcher';
import StandaloneActionDispatcher from './StandaloneActionDispatcher';

import CommandContext from './CommandContext';
import ActionDispatcher from './ActionDispatcher';

import DesignerModel from './DesignerModel';
import DesignerKeyboard from './DesignerKeyboard';

import ScreenManager from './ScreenManager';
import Canvas from './Canvas';

import DragConnector from './DragConnector';
import DragManager from './DragManager';
import RelationshipPivot from './RelationshipPivot';
import Relationship from './Relationship';

import TopicEventDispatcher from './TopicEventDispatcher';
import type MultitTextEditor from './MultilineTextEditor';
import TopicFactory from './TopicFactory';

import LayoutEventBus from './layout/LayoutEventBus';
import EventBusDispatcher from './layout/EventBusDispatcher';

import LayoutManager from './layout/LayoutManager';
import type { LayoutType } from './layout/LayoutType';

import { $notify } from './model/ToolbarNotifier';
import RelationshipModel, { StrokeStyle } from './model/RelationshipModel';
import Mindmap from './model/Mindmap';
import NodeModel from './model/NodeModel';
import Topic from './Topic';
import type { CanvasStyleType } from './model/CanvasStyleType';
import { DesignerOptions } from './DesignerOptionsBuilder';
import DragTopic from './DragTopic';
import CentralTopic from './CentralTopic';
import FeatureType from './model/FeatureType';
import WidgetBuilder from './WidgetBuilder';
import { TopicShapeType } from './model/INodeModel';
import { LineType } from './ConnectionLine';
import XMLSerializerFactory from './persistence/XMLSerializerFactory';
import ImageExpoterFactory from './export/ImageExporterFactory';
import PositionType from './PositionType';
import ThemeType from './model/ThemeType';
import ThemeFactory from './theme/ThemeFactory';
import Theme, { ThemeVariant } from './theme/Theme';
import ChangeEvent from './layout/ChangeEvent';
import type { ModelUpdateEvent } from './DesignerUndoManager';
import HTMLTopicSelected from './HTMLTopicSelected';

/**
 * The zoom range, in workspace units per screen pixel, shared by setZoom(), zoomIn() (down to
 * min), zoomOut() and zoomToFit() (up to max).
 */
const ZOOM_RANGE = { min: 0.3, max: 7 } as const;

/** The part of each edge of the canvas covered by the host's chrome, in pixels. */
export type ViewportInsets = { top?: number; right?: number; bottom?: number; left?: number };

export type ZoomToFitOptions = { insets?: ViewportInsets };

/** The payload of 'featureEdit': open the link or note editor of a topic, or close it. */
export type FeatureEditEvent = { event: 'link' | 'note'; topic: Topic } | { event: 'close' };

/** The events a designer fires to its host (the editor) and their payloads. */
export type DesignerEvents = {
  modelUpdate: ModelUpdateEvent;
  featureEdit: FeatureEditEvent;
  onfocus: void;
  onblur: void;
  loadSuccess: void;
};

class Designer extends EventDispispatcher<DesignerEvents> {
  private _mindmap: Mindmap | null;

  private _options: DesignerOptions;

  private _actionDispatcher: StandaloneActionDispatcher;

  private _themeVariant: ThemeVariant;

  private _model: DesignerModel;

  private _canvas: Canvas;

  // The layout events of this designer: its topics, canvas and commands fire them.
  private _layoutEventBus: LayoutEventBus;

  _eventBussDispatcher: EventBusDispatcher;

  private _dragManager!: DragManager;

  private _relPivot: RelationshipPivot;

  private _cleanScreen!: () => void;

  private _widgetManager: WidgetBuilder;

  // Internal clipboard storage for browsers that don't support clipboard API
  private _internalClipboard: string | null = null;

  private _topicEventDispatcher: TopicEventDispatcher;

  // Set while selectAll or deselectAll changes the selection of every entity: the designer fires
  // its 'onfocus' or 'onblur' event, and pans to the last topic selected, once at the end.
  private _selectionBatch: { panTo?: Topic } | null = null;

  private _selectionShadows: Map<Topic, HTMLTopicSelected> = new Map();

  // Removes the LayoutEventBus handlers of the selection shadows, set once a map is loaded ...
  private _unsubscribeSelectionShadows: (() => void) | null = null;

  private _autoPanOnFocusListener: ((nodeModel: NodeModel) => void) | null = null;

  private _wheelListener: ((event: WheelEvent) => void) | null = null;

  // Re-lays out the map once a web font finishes loading (see _registerFontLoadRelayout).
  private _fontLoadListener: (() => void) | null = null;

  private _fontLoadFrame: number | null = null;

  private _keyboard: DesignerKeyboard | undefined;

  private _disposed = false;

  private _viewportInsets: ViewportInsets | (() => ViewportInsets) = {};

  // The last zoomToFit: its options and the viewport it left, to re-fit on a container resize ...
  private _lastFit: { options?: ZoomToFitOptions; zoom: number; origin: PositionType } | null =
    null;

  constructor(options: DesignerOptions) {
    super();
    this._layoutEventBus = new LayoutEventBus();
    // Set up i18n location ...
    Messages.init(options.locale ? options.locale : 'en');
    const divElem = options.divContainer;

    this._options = options;
    this._themeVariant = 'light'; // Default theme variant, will be updated by initializeThemeVariant

    // Set full div elem render area.The component must fill container size
    // container is responsible for location and size
    DOMUtils.css(divElem, 'width', '100%');
    DOMUtils.css(divElem, 'height', '100%');

    // Dispatcher manager ...
    const commandContext = new CommandContext(this);
    this._actionDispatcher = new StandaloneActionDispatcher(commandContext);

    const me = this;
    this._actionDispatcher.addEvent('modelUpdate', (event) => {
      me.fireEvent('modelUpdate', event);
    });

    ActionDispatcher.setInstance(this._actionDispatcher);
    this._model = new DesignerModel(options);

    // Init Screen manager..
    const screenManager = new ScreenManager(divElem);
    this._canvas = new Canvas(
      screenManager,
      this._model.getZoom(),
      this.isReadOnly(),
      false,
      this._layoutEventBus,
    );

    this._registerAutoPanOnFocus();
    this._canvas.setResizeHandler(() => this._onContainerResize());

    // Init layout manager ...
    this._eventBussDispatcher = new EventBusDispatcher(this._layoutEventBus);

    // Register events
    if (!this.isReadOnly()) {
      // Register mouse events ...
      this._registerMouseEvents();

      // Register keyboard events ...
      this._keyboard = DesignerKeyboard.register(this);

      this._dragManager = this._buildDragManager(this._canvas);
    }
    this._registerWheelEvents();
    this._registerFontLoadRelayout();

    this._relPivot = new RelationshipPivot(this._canvas, this);

    this._topicEventDispatcher = new TopicEventDispatcher(this.isReadOnly());

    this._mindmap = null;

    // If not manager was specifed, use the readonly one.
    this._widgetManager = options.widgetManager;
  }

  /**
   * The text editor of this designer's topics.
   * @internal
   */
  getTextEditor(): MultitTextEditor {
    return this._topicEventDispatcher.getTextEditor();
  }

  /** The keyboard of this designer, if it is editable: its shortcuts drive this map only. */
  getKeyboard(): DesignerKeyboard | undefined {
    return this._keyboard;
  }

  /** The layout events of this designer. No other designer fires or listens to them. */
  getLayoutEventBus(): LayoutEventBus {
    return this._layoutEventBus;
  }

  getContainer(): HTMLDivElement {
    return this._canvas.getScreenManager().getContainer();
  }

  /**
   * A web font that finishes loading changes the size of the text drawn with the fallback font
   * until then. web2d drops its cached text measurements on the same 'loadingdone' event, so the
   * topics are redrawn (measured again) and the map laid out, once per frame however many fonts
   * load in it. The frame also runs after every listener of the event, web2d's included.
   */
  private _registerFontLoadRelayout(): void {
    const { fonts } = document as { fonts?: Pick<FontFaceSet, 'addEventListener'> };
    if (!fonts?.addEventListener) {
      return;
    }
    this._fontLoadListener = () => {
      if (this._fontLoadFrame !== null) {
        return;
      }
      this._fontLoadFrame = requestAnimationFrame(() => {
        this._fontLoadFrame = null;
        if (this._mindmap && !this._disposed) {
          this.redrawAllTopics();
          this._layoutEventBus.fireEvent('forceLayout');
        }
      });
    };
    fonts.addEventListener('loadingdone', this._fontLoadListener);
  }

  private _registerWheelEvents(): void {
    this._wheelListener = (event: WheelEvent) => {
      // Avoid managing wheel events if mindplot kb shortcuts are disabled.
      if (DesignerKeyboard.isDisabled()) return;

      const isZoomGesture = event.ctrlKey || event.metaKey || event.altKey;

      if (isZoomGesture) {
        if (event.deltaY === 0) return;

        // Scale the zoom step by the wheel magnitude so trackpad gestures feel
        // continuous instead of stepped. exp(-deltaY * k) maps deltaY<0 (scroll
        // up) to zoom-in and deltaY>0 (scroll down) to zoom-out symmetrically.
        // Clamp magnitude so a single mouse-wheel notch (deltaY≈100) doesn't
        // overshoot while keeping trackpad gestures (deltaY≈1–30) smooth.
        const clamped = Math.max(-50, Math.min(50, event.deltaY));
        const factor = Math.exp(-clamped * 0.01);
        if (factor > 1) {
          this.zoomIn(factor);
        } else {
          this.zoomOut(1 / factor);
        }
      } else {
        // No modifier: a two-finger trackpad swipe (or a plain wheel) pans the
        // canvas instead of zooming it.
        if (event.deltaX === 0 && event.deltaY === 0) return;
        this.panBy(event.deltaX, event.deltaY);
      }
      event.preventDefault();
    };
    this.getContainer().addEventListener('wheel', this._wheelListener, { passive: false });
  }

  getActionDispatcher(): StandaloneActionDispatcher {
    return this._actionDispatcher;
  }

  private _registerMouseEvents() {
    const workspace = this._canvas;
    const screenManager = workspace.getScreenManager();
    const me = this;
    // Initialize workspace event listeners.
    screenManager.addEvent('update', () => {
      // Topic must be set to his original state. All editors must be closed.
      me.closeNodeEditors();

      // Clean some selected nodes on event ..
      if (me._cleanScreen) me._cleanScreen();
    });

    // Deselect on click ...
    screenManager.addEvent('click', (event: Event) => {
      // ScreenManager always dispatches 'click' as a synthetic MouseEvent.
      me.onObjectFocusEvent(undefined, event as MouseEvent);
    });

    // Create nodes on double click...
    screenManager.addEvent('dblclick', (event: Event) => {
      if (workspace.isWorkspaceEventsEnabled()) {
        const originalEvent = event;
        const mousePos = screenManager.getWorkspaceMousePosition(originalEvent as MouseEvent);
        const centralTopic: CentralTopic = me.getModel().getCentralTopic();

        const model = me._createChildModel(centralTopic, mousePos);
        this._actionDispatcher.addTopics([model], [centralTopic.getId()]);
      }
    });
  }

  getWidgetManager(): WidgetBuilder {
    return this._widgetManager;
  }

  private _buildDragManager(workspace: Canvas): DragManager {
    const designerModel = this.getModel();
    const dragConnector = new DragConnector(designerModel, this._canvas);
    const dragManager = new DragManager(workspace, this._eventBussDispatcher);

    // Enable all mouse events. Read the topics on each drag: the list changes as topics come and go.
    dragManager.addEvent('startdragging', () => {
      designerModel.getTopics().forEach((topic) => topic.setMouseEventsEnabled(false));
    });

    dragManager.addEvent('dragging', (event: MouseEvent, dragTopic: DragTopic) => {
      // The node is being drag. Is the connection still valid ?
      dragConnector.checkConnection(dragTopic, event.metaKey || event.ctrlKey);

      if (!dragTopic.isVisible() && dragTopic.isConnected()) {
        dragTopic.setVisibility(true);
      }
    });

    // Also fired when the drag is cancelled (Escape, window blur): the topic must then stay put.
    dragManager.addEvent('enddragging', (event: MouseEvent, dragTopic: DragTopic) => {
      designerModel.getTopics().forEach((topic) => topic.setMouseEventsEnabled(true));
      if (!dragTopic.isCancelled()) {
        dragTopic.applyChanges(workspace);
      }
    });

    return dragManager;
  }

  private _buildNodeGraph(model: NodeModel, readOnly: boolean): Topic {
    // Create node graph ...
    const orientation = this._eventBussDispatcher.getLayoutManager().getOrientation();
    const topic = TopicFactory.create(
      model,
      { readOnly, topicEventDispatcher: this._topicEventDispatcher, designer: this },
      this._themeVariant,
      orientation,
    );
    this.getModel().addTopic(topic);
    const me = this;
    // Add Topic events ...
    if (!readOnly) {
      // If a node had gained focus, clean the rest of the nodes ...
      topic.addEvent('mousedown', (event: MouseEvent) => {
        me.onObjectFocusEvent(topic, event);
      });

      // Register node listeners (the drag manager skips the central topic) ...
      this._dragManager.add(topic);
    }

    // Connect Topic ...
    const isConnected = model.isConnected();
    if (isConnected) {
      // Improve this ...
      const targetTopicModel = model.getParent();

      // Find target topic with the same model ...
      const targetTopic = targetTopicModel
        ? this.getModel().findTopicByModel(targetTopicModel)
        : undefined;
      if (targetTopic) {
        model.disconnect();
      } else {
        $assert(targetTopic, 'Could not find a topic to connect');
      }

      if (targetTopic) {
        topic.connectTo(targetTopic, this._canvas);
      }
    }

    topic.addEvent('ontblur', () => {
      if (me._selectionBatch) return;
      const topics = me.getModel().filterSelectedTopics();
      const rels = me.getModel().filterSelectedRelationships();

      if (isSelectionEmpty(topics.length, rels.length)) {
        me.fireEvent('onblur');
      }

      // HTMLTopicSelected handles its own hiding via ontblur event
      // Shadow will be kept but hidden - only disposed on topicRemoved
    });

    topic.addEvent('ontfocus', () => {
      if (me._selectionBatch) return;
      const topics = me.getModel().filterSelectedTopics();
      const rels = me.getModel().filterSelectedRelationships();

      if (!isSelectionEmpty(topics.length, rels.length)) {
        me.fireEvent('onfocus');
      }

      // HTMLTopicSelected creation is now handled via LayoutEventBus 'topicSelected' event
      // which fires from Topic.setOnFocus() and includes the topic model/ID
    });

    return topic;
  }

  onObjectFocusEvent(currentObject?: Topic, event?: MouseEvent): void {
    // Close node editors ..
    this.closeNodeEditors();

    const model = this.getModel();
    const objects = model.getEntities();
    objects.forEach((object) => {
      // Disable all nodes on focus but not the current if Ctrl key isn't being pressed
      if (event == null || (!event.ctrlKey && !event.metaKey)) {
        if (object.isOnFocus() && object !== currentObject) {
          object.setOnFocus(false);
        }
      }
    });
  }

  /** Closes the text editor, saving it: there is one per designer, whatever its topic. */
  closeNodeEditors() {
    this._topicEventDispatcher.close(true);
  }

  /** sets focus to all model entities, i.e. relationships and topics */
  selectAll(): void {
    this._setFocusOfAll(true);
  }

  /** removes focus from all model entities, i.e. relationships and topics */
  deselectAll(): void {
    this._setFocusOfAll(false);
  }

  /**
   * Sets the focus of every entity in one pass. Each entity still fires its own events, and
   * each topic its 'topicSelected' or 'topicUnselected' on the LayoutEventBus; the designer fires
   * 'onfocus' or 'onblur' once, and pans to the last topic selected once, at the end.
   */
  private _setFocusOfAll(focus: boolean): void {
    const batch: { panTo?: Topic } = {};
    let changed = false;
    this._selectionBatch = batch;
    try {
      this.getModel()
        .getEntities()
        .forEach((object) => {
          changed = changed || object.isOnFocus() !== focus;
          object.setOnFocus(focus);
        });
    } finally {
      this._selectionBatch = null;
    }

    if (batch.panTo) {
      this.ensureNodeVisible(batch.panTo);
    }
    if (changed) {
      const model = this.getModel();
      const empty = isSelectionEmpty(
        model.filterSelectedTopics().length,
        model.filterSelectedRelationships().length,
      );
      this.fireEvent(empty ? 'onblur' : 'onfocus');
    }
  }

  setZoom(zoom: number): void {
    if (zoom > ZOOM_RANGE.max || zoom < ZOOM_RANGE.min) {
      $notify($msg('ZOOM_IN_ERROR'));
      return;
    }
    this.getModel().setZoom(zoom);
    this._canvas.setZoom(zoom);
  }

  panBy(deltaX: number, deltaY: number): void {
    this._canvas.panBy(deltaX, deltaY);
  }

  /**
   * Sets the insets `zoomToFit()` uses when it is called without any: the part of each edge of
   * the canvas the host covers with its own chrome (an app bar, floating toolbars). The canvas
   * cannot see that chrome, so the host tells it. A function is measured on every fit, so the
   * insets follow the host's layout without having to be pushed again.
   */
  setViewportInsets(insets: ViewportInsets | (() => ViewportInsets)): void {
    this._viewportInsets = insets;
  }

  /**
   * Zooms and pans so that the whole map is visible, centred in the part of the canvas that the
   * insets leave uncovered. It never zooms in beyond 1x (a small map is only centred), nor out
   * beyond the zoomOut() limit (a bigger map is centred, and overflows).
   *
   * @param options.insets the covered part of each edge, in pixels. Defaults to the insets set
   * with setViewportInsets(), or none.
   */
  zoomToFit(options?: ZoomToFitOptions): void {
    const configured =
      typeof this._viewportInsets === 'function' ? this._viewportInsets() : this._viewportInsets;
    const insets = options?.insets ?? configured;
    const inset = (value: number | undefined): number =>
      Number.isFinite(value) ? Math.max(value as number, 0) : 0;
    const top = inset(insets.top);
    const right = inset(insets.right);
    const bottom = inset(insets.bottom);
    const left = inset(insets.left);

    const screenManager = this._canvas.getScreenManager();
    const containerWidth = screenManager.getContainerWidth();
    const containerHeight = screenManager.getContainerHeight();
    const visibleWidth = Math.max(containerWidth - left - right, 1);
    const visibleHeight = Math.max(containerHeight - top - bottom, 1);

    // Bounding box of the visible topics (not the ones under a collapsed branch), with a 10%
    // padding on each side. An empty map is centred on the origin.
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    this.getModel()
      .getTopics()
      .filter((topic) => topic.isVisible())
      .forEach((topic) => {
        const position = topic.getPosition();
        const size = topic.getSize();
        minX = Math.min(minX, position.x - size.width / 2);
        maxX = Math.max(maxX, position.x + size.width / 2);
        minY = Math.min(minY, position.y - size.height / 2);
        maxY = Math.max(maxY, position.y + size.height / 2);
      });

    let contentWidth = 0;
    let contentHeight = 0;
    let contentCenter: PositionType = { x: 0, y: 0 };
    if (minX <= maxX && minY <= maxY) {
      contentWidth = (maxX - minX) * 1.2;
      contentHeight = (maxY - minY) * 1.2;
      contentCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }

    // Workspace units per screen pixel, as everywhere else: above 1 shows more of the map.
    const zoom = Math.min(
      Math.max(contentWidth / visibleWidth, contentHeight / visibleHeight, 1),
      ZOOM_RANGE.max,
    );

    this.getModel().setZoom(zoom);
    this._canvas.setZoomAt(zoom, contentCenter, {
      x: left + visibleWidth / 2,
      y: top + visibleHeight / 2,
    });
    this._lastFit = { options, zoom, origin: { ...this._canvas.getCoordOrigin() } };
  }

  /**
   * A container resize re-fits the map while the view is still the one zoomToFit left: the user
   * asked to see the whole map clear of the insets, and that still holds at the new size. Once
   * they zoomed or panned (wheel, keyboard, drag, auto-pan to a topic), the view is theirs:
   * re-fitting would throw it away, so the zoom and the point at the centre of the view are kept.
   * Comparing the viewport catches every way it can change without hooking each one.
   */
  private _onContainerResize(): void {
    const fit = this._lastFit;
    const origin = this._canvas.getCoordOrigin();
    if (
      fit &&
      fit.zoom === this._canvas.getZoom() &&
      fit.origin.x === origin.x &&
      fit.origin.y === origin.y
    ) {
      this.zoomToFit(fit.options);
    } else {
      this._lastFit = null;
      this._canvas.adjustToContainer();
    }
  }

  zoomOut(factor = 1.2) {
    const model = this.getModel();
    const scale = model.getZoom() * factor;
    if (scale <= ZOOM_RANGE.max) {
      model.setZoom(scale);
      this._canvas.setZoom(scale);
    } else {
      $notify($msg('ZOOM_ERROR'));
    }
  }

  zoomIn(factor = 1.2): void {
    const model = this.getModel();
    const scale = model.getZoom() / factor;

    if (scale >= ZOOM_RANGE.min) {
      model.setZoom(scale);
      this._canvas.setZoom(scale);
    } else {
      $notify($msg('ZOOM_ERROR'));
    }
  }

  shrinkSelectedBranch() {
    const nodes = this.getModel().filterSelectedTopics();
    const [topic] = nodes;
    if (!topic || nodes.length !== 1) {
      // If there are more than one node selected,
      $notify($msg('ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE'));
      return;
    }
    // Execute event ...
    if (topic.getType() !== 'CentralTopic') {
      this._actionDispatcher.shrinkBranch([topic.getId()], !topic.areChildrenShrunken());
    }
  }

  collapseAllNodes(): void {
    const allTopics = this.getModel().getTopics();
    const topicIds = allTopics
      .filter((topic) => topic.getType() !== 'CentralTopic')
      .map((topic) => topic.getId());

    if (topicIds.length > 0) {
      this._actionDispatcher.shrinkBranch(topicIds, true);
    }
  }

  expandAllNodes(): void {
    const allTopics = this.getModel().getTopics();
    const topicIds = allTopics
      .filter((topic) => topic.getType() !== 'CentralTopic')
      .map((topic) => topic.getId());

    if (topicIds.length > 0) {
      this._actionDispatcher.shrinkBranch(topicIds, false);
    }
  }

  async copyToClipboard(): Promise<void> {
    const enableImageSupport = false;
    let topics = this.getModel().filterSelectedTopics();

    if (topics.length === 0) {
      return;
    }

    // Exclude central topic ..
    topics = topics.filter((topic) => !topic.isCentralTopic());

    if (topics.length === 0) {
      return;
    }

    // Prepare clipboard data
    const mindmap = new Mindmap();
    const central: NodeModel = new NodeModel('CentralTopic', mindmap);
    mindmap.addBranch(central);

    topics.forEach((topic) => {
      const nodeModel: NodeModel = topic.getModel().deepCopy(mindmap);
      nodeModel.connectTo(central);
    });

    // Create XML string
    const serializer = XMLSerializerFactory.createFromMindmap(mindmap);
    const document = serializer.toXML(mindmap);
    const xmlStr: string = new XMLSerializer().serializeToString(document);

    // Always store in internal clipboard as fallback
    this._internalClipboard = xmlStr;

    // Try to use browser clipboard API
    let useSystemClipboard = false;

    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.write) {
        // Try to check permissions if supported (not all browsers support this)
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Permissions 'clipboard-write' is not defined in all browsers
          const permissions = await navigator.permissions.query({ name: 'clipboard-write' });
          useSystemClipboard = permissions.state === 'granted' || permissions.state === 'prompt';
        } catch {
          // Permission API not supported (e.g., Safari), try to use clipboard anyway
          useSystemClipboard = true;
        }

        if (useSystemClipboard) {
          const blobs: Record<string, Blob> = {};
          const textPlainBlob = new Blob([xmlStr], { type: 'text/plain' });
          blobs[textPlainBlob.type] = textPlainBlob;

          if (enableImageSupport) {
            // Create image blob ...
            const workspace = this.getWorkSpace();
            const svgElement = workspace.getSVGElement();
            const size = { width: window.innerWidth, height: window.innerHeight };

            const imageUrl = ImageExpoterFactory.create(
              'png',
              svgElement,
              size.width,
              size.height,
              false,
            );
            let imgStr = await imageUrl.exportAndEncode();
            imgStr = imgStr.replace('octet/stream', 'image/png');
            const imgBlob = await (await fetch(imgStr)).blob();
            blobs[imgBlob.type] = imgBlob;
          }

          // Finally, add to clipboard ...
          const clipboard = new ClipboardItem(blobs);
          await navigator.clipboard.write([clipboard]);
          console.log('Copy to system clipboard success');
        }
      }
    } catch (e) {
      // Clipboard API failed, fall back to internal clipboard
      console.warn('System clipboard not available, using internal clipboard:', e);
      useSystemClipboard = false;
    }

    if (!useSystemClipboard) {
      console.log('Copy to internal clipboard success (system clipboard not available)');
    }
  }

  /**
   * Reads the system clipboard, falling back to the internal one when the
   * browser denies access or has nothing of interest. Shared by every paste
   * flavour so they all agree on where the text comes from.
   */
  private async _readClipboardText(): Promise<string | null> {
    let text: string | null = null;

    // Try to read from system clipboard first
    if (typeof navigator !== 'undefined' && navigator.clipboard?.read) {
      try {
        const type = 'text/plain';
        const clipboardItems = await navigator.clipboard.read();

        // Find the first item with text/plain
        const textItem = clipboardItems.find((item) => item.types.includes(type));
        if (textItem) {
          const blob: Blob = await textItem.getType(type);
          text = await blob.text();
          console.log('Paste from system clipboard success');
        }
      } catch (e) {
        // System clipboard not available or permission denied
        console.warn('System clipboard not available for reading, using internal clipboard:', e);
      }
    }

    // Fall back to internal clipboard if system clipboard is empty or failed
    if (!text && this._internalClipboard) {
      text = this._internalClipboard;
      console.log('Paste from internal clipboard success');
    }

    return text;
  }

  private _parseClipboardMindmap(text: string): Mindmap {
    const dom = new DOMParser().parseFromString(text, 'application/xml');
    const serializer = XMLSerializerFactory.createFromDocument(dom);
    return serializer.loadFromDom(dom, 'application/xml');
  }

  async pasteClipboard(): Promise<void> {
    const text = await this._readClipboardText();

    // If we have no text at all, nothing to paste
    if (!text) {
      console.log('No clipboard data available');
      return;
    }

    // Is a mindmap ?. Try to infer if it's a text or a map...
    if (text.indexOf('</map>') !== -1) {
      const mindmap = this._parseClipboardMindmap(text);

      // Remove reference to the parent mindmap and clean up to support multiple copy of the nodes ...
      const [central] = mindmap.getBranches();
      $assert(central, 'The clipboard map has no central topic');
      let children = central.getChildren();
      children.forEach((c) => c.disconnect());
      // The copies belong to this designer's map, not to the clipboard one ...
      children = children.map((m: NodeModel) => m.deepCopy(this.getMindmap()));

      // Change position to avoid overlap ...
      children.forEach((m) => {
        const pos = m.getPosition() ?? { x: 0, y: 0 };
        m.setPosition(pos.x + Math.random() * 60, pos.y + Math.random() * 30);
      });

      // Finally, add the node ...
      this._actionDispatcher.addTopics(children, null);
    } else {
      // Text goes into the selected topics: with none, there is nothing to change or undo ...
      const topics = this.getModel().filterSelectedTopics();
      if (topics.length === 0) {
        return;
      }
      this._actionDispatcher.changeTextToTopic(
        topics.map((t) => t.getId()),
        text.trim(),
      );
    }
  }

  /**
   * Adds every model as a direct child of `parentId`, in a single undoable step.
   */
  pasteModelsAsChild(models: NodeModel[], parentId: number): void {
    const parent = this.getModel().findTopicById(parentId);
    if (!parent) {
      console.warn(`pasteModelsAsChild: parent topic ${parentId} not found`);
      return;
    }

    const parentIds = models.map(() => parentId);
    this._actionDispatcher.addTopics(models, parentIds);
  }

  /**
   * Pastes the clipboard's topics as children of `parentId` instead of dropping
   * them loose on the canvas, which is what `pasteClipboard()` does.
   */
  async pasteClipboardAsChild(parentId: number): Promise<void> {
    const parent = this.getModel().findTopicById(parentId);
    if (!parent) {
      $notify($msg('ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }

    const text = await this._readClipboardText();
    if (!text || text.indexOf('</map>') === -1) {
      $notify($msg('CLIPBOARD_IS_EMPTY'));
      return;
    }

    const [central] = this._parseClipboardMindmap(text).getBranches();
    if (!central) {
      $notify($msg('CLIPBOARD_IS_EMPTY'));
      return;
    }

    // A collapsed parent is expanded by AddTopicCommand, in the same undo step as the paste.
    // Collapsed children keep their place in the layout, so predict is not affected.
    //
    // Detach the copied nodes from the clipboard mindmap and let the layout give
    // each one its own order up front, as none is inserted yet: given the same
    // order, each insert would push the previous ones down and reverse them.
    // Under the central topic of a mindmap layout they are spread over both
    // sides, as adding them one by one would; elsewhere they follow each other
    // in clipboard order ...
    const layoutManager = this._eventBussDispatcher.getLayoutManager();
    const predicted = layoutManager.predict(parentId, null, null);
    const children = central.getChildren();
    const orders = layoutManager.getOrdersForNewChildren(parentId, children.length);
    const clones = children.map((child, index) => {
      child.disconnect();
      const clone = child.deepCopy(this.getMindmap());
      clone.setPosition(predicted.position.x, predicted.position.y);
      clone.setOrder(orders[index]);
      return clone;
    });

    this.pasteModelsAsChild(clones, parentId);
  }

  getModel(): DesignerModel {
    return this._model;
  }

  createChildForSelectedNode(): void {
    const nodes = this.getModel().filterSelectedTopics();
    const [parentTopic] = nodes;
    if (!parentTopic) {
      // If there are more than one node selected,
      $notify($msg('ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }
    if (nodes.length !== 1) {
      // If there are more than one node selected,
      $notify($msg('ONLY_ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }

    // Add new node ...
    const parentTopicId = parentTopic.getId();
    const childModel = this._createChildModel(parentTopic);

    // Execute event ...
    this._actionDispatcher.addTopics([childModel], [parentTopicId]);
  }

  private _createChildModel(topic: Topic, mousePos?: PositionType): NodeModel {
    // Create a new node ...
    const parentModel = topic.getModel();
    const mindmap = parentModel.getMindmap();
    const childModel = mindmap.createNode();

    // A collapsed parent is expanded by AddTopicCommand, in the same undo step as the add.
    // Collapsed children keep their place in the layout, so predict is not affected.

    // Create a new node ...
    const layoutManager = this._eventBussDispatcher.getLayoutManager();
    const result = layoutManager.predict(topic.getId(), null, mousePos || null);
    childModel.setOrder(result.order);

    const { position } = result;
    childModel.setPosition(position.x, position.y);

    return childModel;
  }

  createSiblingForSelectedNode(): void {
    const nodes = this.getModel().filterSelectedTopics();
    const [topic] = nodes;
    if (!topic) {
      // If there are no nodes selected,
      $notify($msg('ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }
    if (nodes.length > 1) {
      // If there are more than one node selected,
      $notify($msg('ONLY_ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }
    if (!topic.getOutgoingConnectedTopic()) {
      // Central topic and isolated topics ....
      // Central topic doesn't have siblings ...
      this.createChildForSelectedNode();
    } else {
      const parentTopic = topic.getOutgoingConnectedTopic();
      const siblingModel = this._createSiblingModel(topic);

      if (siblingModel && parentTopic) {
        const parentTopicId = parentTopic.getId();
        this._actionDispatcher.addTopics([siblingModel], [parentTopicId]);
      }
    }
  }

  private _createSiblingModel(topic: Topic): NodeModel | undefined {
    let result: NodeModel | undefined;
    let model: NodeModel;
    const parentTopic = topic.getOutgoingConnectedTopic();

    if (parentTopic != null) {
      // Create a new node ...
      model = topic.getModel();
      const mindmap = model.getMindmap();
      result = mindmap.createNode();

      // Get the current topic's order to insert right after it
      const layoutManager = this._eventBussDispatcher.getLayoutManager();
      const currentOrder = topic.getOrder();
      let newOrder: number;

      if (currentOrder !== undefined) {
        // Insert right after the current topic. The parent's sorter decides what that
        // order is: usually currentOrder + 1, but the central topic's balanced sorter
        // encodes the side in the order parity, so there it is currentOrder + 2.
        // The layout manager's insert method will shift the siblings from there on.
        newOrder = layoutManager.getOrderAfter(parentTopic.getId(), currentOrder);
      } else {
        // If current topic has no order, fall back to layout manager prediction
        // This should not happen in normal cases, but handle it gracefully
        const prediction = layoutManager.predict(parentTopic.getId(), null, null);
        newOrder = prediction.order;
      }

      // Set the order on the new sibling
      // When the topic is connected, the layout manager's insert method will:
      // 1. Shift the siblings at or after newOrder
      // 2. Set the new sibling's order to newOrder
      result.setOrder(newOrder);

      // Let the layout manager predict the position for insertion
      // The position will be recalculated during layout after connection,
      // but we need an initial position. The layout system will position it
      // correctly based on the order we set.
      // Predict position - the layout system will use the order to position it correctly
      const prediction = layoutManager.predict(parentTopic.getId(), null, null);
      result.setPosition(prediction.position.x, prediction.position.y);
    }

    return result;
  }

  showRelPivot(event: MouseEvent): void {
    const [topic] = this.getModel().filterSelectedTopics();
    if (!topic) {
      // This could not happen ...
      $notify($msg('RELATIONSHIP_COULD_NOT_BE_CREATED'));
      return;
    }

    // Current mouse position ....
    const screen = this._canvas.getScreenManager();
    const pos = screen.getWorkspaceMousePosition(event);

    // create a connection ...
    this._relPivot.start(topic, pos);
  }

  getMindmapProperties(): { zoom: number } {
    const model = this.getModel();
    return { zoom: model.getZoom() };
  }

  loadMap(mindmap: Mindmap): Promise<void> {
    this._mindmap = mindmap;

    // Update background style...
    // applyCanvasStyle reads from model and merges with theme defaults
    this.applyCanvasStyle();

    // Delay render ...
    this._canvas.enableQueueRender(true);

    // Init layout manager ...
    const size = { width: 25, height: 25 };
    const layoutType = mindmap.getLayout();
    const centralModel = mindmap.getCentralTopic();
    $assert(centralModel, 'The map to load has no central topic');
    const layoutManager = new LayoutManager(centralModel.getId(), size, layoutType);

    layoutManager.addEvent('change', (event: ChangeEvent) => {
      const id = event.getId();
      const topic = this.getModel().findTopicById(id);
      if (topic) {
        const position = event.getPosition();
        const order = event.getOrder();
        if (position) {
          topic.setPosition(position);
        }
        // No order means the layout does not order this topic: keep the one it has.
        if (order !== undefined) {
          topic.setOrder(order);
        }
      }
    });

    this._eventBussDispatcher.setLayoutManager(layoutManager);

    // Building node graph. The render queue adds the topics to the canvas, which connects each
    // one to the layout: lay the map out once, when they all are, not once per connection ...
    const branches = mindmap.getBranches();
    const dispatcher = this._eventBussDispatcher;
    dispatcher.beginBatch();

    const nodesGraph: Topic[] = [];
    let centralTopic: Topic;
    try {
      branches.forEach((branch) => {
        const nodeGraph = this.nodeModelToTopic(branch);
        nodesGraph.push(nodeGraph);
      });

      // Place the focus on the Central Topic
      centralTopic = this.getModel().getCentralTopic();
    } catch (e) {
      dispatcher.endBatch();
      throw e;
    }
    this.goToNode(centralTopic);

    const rendered = this._canvas.enableQueueRender(false).finally(() => dispatcher.endBatch());
    return rendered.then(() => {
      // Connect relationships ...
      const relationships = mindmap.getRelationships();
      relationships.forEach((relationship) => {
        try {
          this._relationshipModelToRelationship(relationship);
        } catch (e) {
          // Skip relationships with missing topics (data consistency issue)
          console.error(
            '[Designer] Failed to create relationship - skipping.\n' +
              `  Source topic ID: ${relationship.getFromNode()}\n` +
              `  Target topic ID: ${relationship.getToNode()}\n` +
              `  Available topic IDs: [${this.getModel()
                .getTopics()
                .map((t) => t.getId())
                .join(', ')}]\n` +
              `  Error: ${e}`,
          );
        }
      });

      // Render nodes ...
      nodesGraph.forEach((topic) => topic.setVisibility(true));

      // Enable workspace drag events ...
      this._canvas.registerEvents();

      // Initialize selection shadows if enabled
      this._unsubscribeSelectionShadows = HTMLTopicSelected.initializeSelectionShadows(this);

      // Finally, sort the map ...
      this._layoutEventBus.fireEvent('forceLayout');
      this.fireEvent('loadSuccess');
    });
  }

  /**
   * Get the selection shadows map
   */
  getSelectionShadows(): Map<Topic, HTMLTopicSelected> {
    return this._selectionShadows;
  }

  /**
   * Get the screen manager from the canvas
   */
  getScreenManager(): ScreenManager {
    return this._canvas.getScreenManager();
  }

  getMindmap(): Mindmap {
    return this._mindmap!;
  }

  changeLayout(layout: LayoutType): void {
    this._actionDispatcher.changeLayout(layout);
  }

  /**
   * Apply layout directly (internal use - no undo history)
   * @param layout - Layout type
   * @internal
   */
  applyLayout(layout: LayoutType): void {
    const mindmap = this.getMindmap();
    mindmap.setLayout(layout);

    // Update layout manager
    const layoutManager = this._eventBussDispatcher.getLayoutManager();
    layoutManager.setLayoutType(layout);

    // Update orientation on all topics
    // The DragPivot reads orientation from topics when drawing connections
    const orientation = layoutManager.getOrientation();
    this.getModel()
      .getTopics()
      .forEach((topic) => {
        topic.setOrientation(orientation);
      });

    // Reset this designer's DragPivot to clear any stale connection state (none when read-only)
    this._dragManager?.getDragPivot().reset();

    // Redraw all topics immediately (no queue rendering during editing). Each topic is
    // redrawn once, parents before children: redrawing every topic with its subtree
    // redrew each one once per ancestor.
    this.redrawAllTopics();
  }

  /**
   * Redraws every topic once, floating ones included, parents first, with the current theme
   * variant. It lays nothing out.
   * @internal
   */
  redrawAllTopics(): void {
    const variant = this.getThemeVariant();
    this.getModel()
      .getTopics()
      .filter((topic) => !topic.getParent())
      .forEach((root) => Designer.redrawTree(root, variant));
  }

  /**
   * Redraws a topic and then each of its descendants once, parents first, including the
   * children of collapsed topics (a topic redraw does not recurse into those).
   */
  private static redrawTree(topic: Topic, variant: ThemeVariant): void {
    topic.redraw(variant, false);
    topic.getChildren().forEach((child) => Designer.redrawTree(child, variant));
  }

  getLayout(): LayoutType {
    return this.getMindmap().getLayout();
  }

  undo(): void {
    this._actionDispatcher.actionRunner.undo();
  }

  redo(): void {
    this._actionDispatcher.actionRunner.redo();
  }

  isReadOnly(): boolean {
    return (
      this._options.mode === 'viewonly-private' ||
      this._options.mode === 'viewonly-public' ||
      this._options.mode === 'edition-viewer'
    );
  }

  /**
   * Get the current theme variant (light/dark)
   */
  getThemeVariant(): ThemeVariant {
    return this._themeVariant;
  }

  /**
   * Initialize theme variant from editor context
   * This should be called when the Designer is created to sync with editor theme
   */
  initializeThemeVariant(editorThemeMode: 'light' | 'dark'): void {
    const variant = editorThemeMode === 'dark' ? 'dark' : 'light';
    this._themeVariant = variant;

    // If mindmap is already loaded, apply the theme variant immediately
    if (this._mindmap && this.getModel()) {
      this.refreshThemeVariant();
    }
  }

  /**
   * Set the theme variant and refresh the mindmap
   *
   * Integration with editor theme toggle:
   * ```typescript
   * // 1. Initialize theme variant when Designer is created
   * const designer = model.getDesigner();
   * designer.initializeThemeVariant(currentEditorThemeMode);
   *
   * // 2. Update theme variant when user toggles theme
   * const newThemeMode = themeContext.mode; // from useTheme()
   * designer.setThemeVariant(newThemeMode === 'dark' ? 'dark' : 'light');
   * ```
   */
  setThemeVariant(variant: ThemeVariant): void {
    if (this._themeVariant !== variant) {
      this._themeVariant = variant;

      // Check if mindmap is loaded
      if (this._mindmap && this.getModel()) {
        this.refreshThemeVariant();
      }
      // Note: We don't need to store the variant for later application
      // because the editor's useEffect will call this method again
      // when the mindmap is loaded and the designer is ready
    }
  }

  /**
   * Re-renders the canvas and the topics with the current theme variant: the variant is
   * set on every topic first, then each topic is redrawn once and the map is laid out once.
   */
  private refreshThemeVariant(): void {
    if (this._mindmap) {
      // Re-render canvas with new theme variant
      this.applyCanvasStyle();

      // Every tree: the central topic's and the floating topics' ...
      const roots = this.getModel()
        .getTopics()
        .filter((topic) => !topic.getParent());
      if (roots.length > 0) {
        roots.forEach((root) => Designer.setTreeThemeVariant(root, this._themeVariant));
        roots.forEach((root) => Designer.redrawTree(root, this._themeVariant));

        // Force a layout refresh to ensure all changes are applied
        this._layoutEventBus.fireEvent('forceLayout');
      }
    }
  }

  /**
   * Sets the theme variant on a topic and all its descendants.
   */
  private static setTreeThemeVariant(topic: Topic, variant: ThemeVariant): void {
    topic.setThemeVariant(variant);
    topic.getChildren().forEach((child) => Designer.setTreeThemeVariant(child, variant));
  }

  nodeModelToTopic(nodeModel: NodeModel): Topic {
    let children = nodeModel.getChildren().slice();
    children = children.sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));

    const result = this._buildNodeGraph(nodeModel, this.isReadOnly());
    result.setVisibility(false);

    // Set the current theme variant on the topic
    result.setThemeVariant(this._themeVariant);

    this._canvas.append(result);
    children.forEach((child) => {
      if (child) {
        this.nodeModelToTopic(child);
      }
    });
    return result;
  }

  changeTheme(id: ThemeType): void {
    this._actionDispatcher.changeTheme(id);
  }

  /**
   * Apply theme directly (internal use - no undo history)
   * @param id - Theme ID
   * @internal
   */
  applyTheme(id: ThemeType): void {
    // Save theme to mindmap for persistence
    const mindmap = this.getMindmap();
    mindmap.setTheme(id);

    // Re-render with new theme (preserves custom canvas style if it exists)
    this.applyCanvasStyle();

    // Every tree: the central topic's and the floating topics'.
    this.redrawAllTopics();
  }

  /**
   * Set canvas style through action dispatcher (undoable)
   * @param style - Canvas style configuration
   */
  setCanvasStyle(style: CanvasStyleType | undefined): void {
    this._actionDispatcher.changeCanvasStyle(style);
  }

  /**
   * Apply canvas style directly (internal use - no undo history)
   * This method always reads from the model and merges with theme defaults for rendering.
   * It does NOT persist to the model - only commands should do that.
   * @internal
   */
  applyCanvasStyle(): void {
    const mindmap = this.getMindmap();
    const customStyle = mindmap.getCanvasStyle();

    // Get theme defaults
    const themeId = mindmap.getTheme();
    const theme = ThemeFactory.createById(themeId, this._themeVariant);
    const themeStyle = this._convertThemeToCanvasStyle(theme);

    // Merge custom style with theme defaults (same pattern as Topic.getBackgroundColor)
    const resolved = {
      backgroundColor: customStyle?.backgroundColor ?? themeStyle.backgroundColor,
      backgroundPattern: customStyle?.backgroundPattern ?? themeStyle.backgroundPattern,
      backgroundGridSize: customStyle?.backgroundGridSize ?? themeStyle.backgroundGridSize,
      backgroundGridColor: customStyle?.backgroundGridColor ?? themeStyle.backgroundGridColor,
    };

    let cssStyle = `position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: ${resolved.backgroundColor};
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;`;

    switch (resolved.backgroundPattern) {
      case 'grid':
        cssStyle += `
          background-image: linear-gradient(${resolved.backgroundGridColor} 1px, transparent 1px),
            linear-gradient(to right, ${resolved.backgroundGridColor} 1px, ${resolved.backgroundColor} 1px);
          background-size: ${resolved.backgroundGridSize}px ${resolved.backgroundGridSize}px;`;
        break;
      case 'dots':
        cssStyle += `
          background-image: radial-gradient(circle, ${resolved.backgroundGridColor} 1px, transparent 1px);
          background-size: ${resolved.backgroundGridSize}px ${resolved.backgroundGridSize}px;`;
        break;
      case 'solid':
      default:
        // Just solid background color, no additional styling needed
        break;
    }

    this._canvas.setBackgroundStyle(cssStyle);
  }

  /**
   * Convert theme canvas style properties to Designer canvas style format
   * @private
   * @param theme - The theme instance
   * @return Canvas style object for Designer
   */
  private _convertThemeToCanvasStyle(theme: Theme): CanvasStyleType {
    const backgroundColor = theme.getCanvasBackgroundColor();
    const gridColor = theme.getCanvasGridColor();
    const showGrid = theme.getCanvasShowGrid();
    const gridPattern = theme.getCanvasGridPattern();

    return {
      backgroundColor,
      backgroundPattern: showGrid && gridColor ? gridPattern : 'solid',
      backgroundGridSize: 20, // Default grid size
      backgroundGridColor: gridColor || '#ebe9e7', // Default grid color
    };
  }

  /**
   * @private
   * @param {mindplot.model.RelationshipModel} model
   * @return {mindplot.Relationship} the relationship created to the model
   * @throws will throw an error if model is null or undefined
   */
  private _relationshipModelToRelationship(model: RelationshipModel): Relationship {
    $assert(model, 'Node model can not be null');

    const result = this._buildRelationshipShape(model);

    const sourceTopic = result.getSourceTopic();
    sourceTopic.addRelationship(result);

    const targetTopic = result.getTargetTopic();
    targetTopic.addRelationship(result);

    result.setVisibility(sourceTopic.isVisible() && targetTopic.isVisible());

    // Relationship.addToWorkspace puts it below the topics and the relationships already there
    this._canvas.append(result);
    return result;
  }

  addRelationship(model: RelationshipModel): Relationship {
    const mindmap = this.getMindmap();

    // Validate topics exist before adding relationship
    const sourceId = model.getFromNode();
    const targetId = model.getToNode();
    const sourceTopic = this.getModel().findTopicById(sourceId);
    const targetTopic = this.getModel().findTopicById(targetId);

    if (!sourceTopic || !targetTopic) {
      const error = new Error(
        'Cannot create relationship - topic not found in designer model.\n' +
          `  Source topic ID: ${sourceId} (${sourceTopic ? 'found' : 'NOT FOUND'})\n` +
          `  Target topic ID: ${targetId} (${targetTopic ? 'found' : 'NOT FOUND'})\n` +
          `  Available topic IDs: [${this.getModel()
            .getTopics()
            .map((t) => t.getId())
            .join(', ')}]`,
      );
      console.error(`[Designer.addRelationship] ${error.message}`);
      throw error;
    }

    mindmap.addRelationship(model);
    return this._relationshipModelToRelationship(model);
  }

  /**
   * deletes the relationship from the linked topics, DesignerModel, Workspace and Mindmap
   * @param {mindplot.Relationship} rel the relationship to delete
   */
  deleteRelationship(rel: Relationship): void {
    const sourceTopic = rel.getSourceTopic();
    sourceTopic.deleteRelationship(rel);

    const targetTopic = rel.getTargetTopic();
    targetTopic.deleteRelationship(rel);

    this.getModel().removeRelationship(rel);

    // Properly remove all relationship components from workspace
    rel.removeFromWorkspace(this._canvas);

    const mindmap = this.getMindmap();
    mindmap.deleteRelationship(rel.getModel());
  }

  private _buildRelationshipShape(model: RelationshipModel): Relationship {
    const dmodel = this.getModel();

    const sourceTopicId = model.getFromNode();
    const sourceTopic = dmodel.findTopicById(sourceTopicId);

    const targetTopicId = model.getToNode();
    const targetTopic = dmodel.findTopicById(targetTopicId);

    // Validate both source and target topics exist
    $assert(
      sourceTopic,
      `sourceTopic could not be found:${sourceTopicId},${dmodel.getTopics().map((e) => e.getId())}`,
    );
    $assert(
      targetTopic,
      `targetTopic could not be found:${targetTopicId},${dmodel.getTopics().map((e) => e.getId())}`,
    );

    // Build relationship line (sourceTopic and targetTopic are guaranteed non-null by asserts above)
    const result = new Relationship(sourceTopic, targetTopic, model);
    result.addEvent('ontblur', () => {
      if (this._selectionBatch) return;
      const topics = this.getModel().filterSelectedTopics();
      const rels = this.getModel().filterSelectedRelationships();

      if (isSelectionEmpty(topics.length, rels.length)) {
        this.fireEvent('onblur');
      }
    });

    result.addEvent('ontfocus', () => {
      if (this._selectionBatch) return;
      const topics = this.getModel().filterSelectedTopics();
      const rels = this.getModel().filterSelectedRelationships();

      if (!isSelectionEmpty(topics.length, rels.length)) {
        this.fireEvent('onfocus');
      }
    });

    // Append it to the workspace ...
    dmodel.addRelationship(result);

    return result;
  }

  private _clearFocusRecursively(node: Topic): void {
    if (node.isOnFocus()) {
      node.setOnFocus(false);
    }

    node.getChildren().forEach((child) => this._clearFocusRecursively(child));
  }

  removeTopic(node: Topic): void {
    if (!node.isCentralTopic()) {
      const parent = node.getParent();
      this._removeTopicTree(node);

      // Only the removed topic hands the focus over: its descendants are gone with it.
      if (parent) {
        this.goToNode(parent);
      }
    }
  }

  private _removeTopicTree(node: Topic): void {
    this._clearFocusRecursively(node);
    // Ensure any inline editors bound to this topic or its descendants are closed before removal
    node.closeEditors();
    node.disconnect(this._canvas);

    // remove children
    let [child] = node.getChildren();
    while (child) {
      this._removeTopicTree(child);
      [child] = node.getChildren();
    }

    this._canvas.removeChild(node);
    this.getModel().removeTopic(node);

    // Delete this node from the model...
    const model = node.getModel();
    model.deleteNode();
  }

  private _resetEdition() {
    const screenManager = this._canvas.getScreenManager();
    screenManager.fireEvent('update');
    screenManager.fireEvent('mouseup');
    this._relPivot.dispose();
  }

  deleteSelectedEntities() {
    // Is there some action in progress ?.
    this._resetEdition();

    const topics = this.getModel().filterSelectedTopics();
    const relation = this.getModel().filterSelectedRelationships();
    if (topics.length <= 0 && relation.length <= 0) {
      // If there are more than one node selected,
      $notify($msg('ENTITIES_COULD_NOT_BE_DELETED'));
      return;
    }
    if (topics.length === 1 && topics[0]?.isCentralTopic()) {
      $notify($msg('CENTRAL_TOPIC_CAN_NOT_BE_DELETED'));
      return;
    }

    // If the central topic has been selected, I must filter ir
    const topicIds = topics
      .filter((topic) => !topic.isCentralTopic())
      .map((topic) => topic.getId());

    const relIds = relation.map((rel) => rel.getId());

    // Finally delete the topics ...
    if (topicIds.length > 0 || relIds.length > 0) {
      this._actionDispatcher.deleteEntities(topicIds, relIds);
    }
  }

  changeFontFamily(font: string | undefined) {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontFamilyToTopic(topicsIds, font);
    }
  }

  changeFontStyle(): void {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontStyleToTopic(topicsIds);
    }
  }

  changeFontColor(color: string | undefined): void {
    const topicsIds = this.getModel().filterTopicsIds();

    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontColorToTopic(topicsIds, color);
    }
  }

  changeBackgroundColor(color: string | undefined): void {
    const validateFunc = (topic: Topic) => topic.getShapeType() !== 'line';
    const validateError = 'Color can not be set to line topics.';

    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeBackgroundColorToTopic(topicsIds, color);
    }
  }

  changeBorderColor(color: string | undefined) {
    const validateFunc = (topic: Topic) => topic.getShapeType() !== 'line';
    const validateError = 'Color can not be set to line topics.';
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeBorderColorToTopic(topicsIds, color);
    }
  }

  changeBorderStyle(style: string | undefined) {
    const validateFunc = (topic: Topic) => topic.getShapeType() !== 'line';
    const validateError = 'Border style can not be set to line topics.';
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeBorderStyleToTopic(topicsIds, style);
    }
  }

  changeFontSize(size: number) {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontSizeToTopic(topicsIds, size);
    }
  }

  changeImageEmojiChar(imageEmojiChar: string | undefined): void {
    console.log('Designer.changeImageEmojiChar called with:', imageEmojiChar);
    const topicsIds = this.getModel()
      .filterSelectedTopics()
      .map((topic) => topic.getId());
    console.log('Selected topic IDs for image emoji change:', topicsIds);
    if (topicsIds.length > 0) {
      console.log('Calling changeImageEmojiCharToTopic with:', topicsIds, imageEmojiChar);
      this._actionDispatcher.changeImageEmojiCharToTopic(topicsIds, imageEmojiChar);
    } else {
      console.log('No topics selected for image emoji change');
    }
  }

  changeImageGalleryIconName(imageGalleryIconName: string | undefined): void {
    console.log('Designer.changeImageGalleryIconName called with:', imageGalleryIconName);
    const topicsIds = this.getModel()
      .filterSelectedTopics()
      .map((topic) => topic.getId());
    console.log('Selected topic IDs for image gallery change:', topicsIds);
    if (topicsIds.length > 0) {
      console.log(
        'Calling changeImageGalleryIconNameToTopic with:',
        topicsIds,
        imageGalleryIconName,
      );
      this._actionDispatcher.changeImageGalleryIconNameToTopic(topicsIds, imageGalleryIconName);
    } else {
      console.log('No topics selected for image gallery change');
    }
  }

  changeShapeType(shape: TopicShapeType | undefined): void {
    const validateFunc = (topic: Topic) =>
      !(topic.getType() === 'CentralTopic' && (shape === 'line' || shape === 'none'));

    const validateError = $msg('CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED');
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeShapeTypeToTopic(topicsIds, shape);
    }
  }

  changeConnectionStyle(type: LineType | undefined): void {
    const topicsIds = this.getModel()
      .filterSelectedTopics()
      .map((t) => t.getId());
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeConnectionStyleToTopic(topicsIds, type);
    }
  }

  changeConnectionColor(value: string | undefined): void {
    const topicsIds = this.getModel()
      .filterSelectedTopics()
      .map((t) => t.getId());
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeConnectionColorToTopic(topicsIds, value);
    }
  }

  changeRelationshipColor(value: string | undefined): void {
    const relationships = this.getModel().filterSelectedRelationships();
    if (relationships.length > 0) {
      this._actionDispatcher.changeRelationshipColor(relationships, value);
    }
  }

  changeRelationshipStrokeStyle(strokeStyle: StrokeStyle): void {
    const relationships = this.getModel().filterSelectedRelationships();
    if (relationships.length > 0) {
      this._actionDispatcher.changeRelationshipStrokeStyle(relationships, strokeStyle);
    }
  }

  changeRelationshipEndArrow(value: boolean): void {
    const relationships = this.getModel().filterSelectedRelationships();
    if (relationships.length > 0) {
      this._actionDispatcher.changeRelationshipEndArrow(relationships, value);
    }
  }

  changeRelationshipStartArrow(value: boolean): void {
    const relationships = this.getModel().filterSelectedRelationships();
    if (relationships.length > 0) {
      this._actionDispatcher.changeRelationshipStartArrow(relationships, value);
    }
  }

  changeFontWeight(): void {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontWeightToTopic(topicsIds);
    }
  }

  addIconType(type: 'image' | 'emoji', iconType: string): void {
    const topicsIds = this.getModel().filterTopicsIds();
    const featureType: FeatureType = type === 'emoji' ? 'eicon' : 'icon';

    this._actionDispatcher.addFeatureToTopic(topicsIds, featureType, {
      id: iconType,
    });
  }

  addLink(): void {
    const model = this.getModel();
    const topic = model.selectedTopic();
    if (topic) {
      this.fireEvent('featureEdit', { event: 'link', topic });
      this.closeNodeEditors();
    }
  }

  addNote(): void {
    const model = this.getModel();
    const topic = model.selectedTopic();
    if (topic) {
      this.fireEvent('featureEdit', { event: 'note', topic });
      this.closeNodeEditors();
    }
  }

  /**
   * Focuses the node and brings it into view. By default it pans by the minimum
   * needed to clear the viewport padding (`ensureVisible`), which is what
   * keyboard navigation wants. With `center` it instead parks the node in the
   * middle of the viewport -- used when arriving from a per-node deep link,
   * where there is no previous viewport worth preserving.
   */
  goToNode(node: Topic, center = false): void {
    node.setOnFocus(true);
    this.onObjectFocusEvent(node);
    if (center) {
      this.centerNode(node);
    } else {
      this.ensureNodeVisible(node);
    }
  }

  /**
   * Pans the viewport so the node sits at its centre, without changing focus.
   */
  centerNode(node: Topic): void {
    this._canvas.centerOnPosition(node.getPosition());
  }

  /**
   * Expands every collapsed ancestor of the node, deselects the current
   * selection, then focuses and pans to the node -- the sequence keyboard
   * navigation already relies on (via DesignerKeyboard) to reveal a node
   * hidden inside a collapsed branch.
   *
   * `center` is forwarded to `goToNode`; it defaults to false so the existing
   * keyboard-navigation call sites keep their minimal-pan behaviour.
   */
  revealNode(node: Topic, center = false): void {
    const collapsedAncestorIds = getCollapsedAncestorIds(node);
    if (collapsedAncestorIds.length > 0) {
      this.getActionDispatcher().shrinkBranch(collapsedAncestorIds, false);
    }
    this.deselectAll();
    this.goToNode(node, center);
  }

  /**
   * Moves a topic within the tree: 'up'/'down' reorder it among its siblings,
   * 'outdent'/'indent' change which topic it hangs off.
   *
   * Structural rather than spatial, because the layout manager owns position --
   * nudging coordinates would just be laid out away. Returns false when the
   * move is unavailable (already first among siblings, no level to rise to,
   * and so on) so a caller can decide whether that warrants feedback.
   *
   * Goes through dragTopic, which is the same path mouse dragging uses, so the
   * move lands on the undo stack as a single DragTopicCommand.
   */
  moveTopicInTree(topic: Topic, move: TopicMove): boolean {
    if (this.isReadOnly()) {
      return false;
    }

    const target = resolveTopicMove(topic, move);
    if (!target) {
      return false;
    }

    const layoutManager = this._eventBussDispatcher.getLayoutManager();
    const dispatcher = this.getActionDispatcher();

    if (target.kind === 'reorder') {
      dispatcher.dragTopic(topic.getId(), topic.getPosition(), target.order, target.parent);
    } else {
      // Ask the layout where a child of the new parent belongs, rather than
      // inventing a position the sorter would immediately override.
      const predicted = layoutManager.predict(target.parent.getId(), null, null);
      dispatcher.dragTopic(topic.getId(), predicted.position, predicted.order, target.parent);
    }

    // Indenting under a collapsed sibling would hide the topic the user just
    // moved, so make sure it stays on screen and selected.
    this.revealNode(topic);
    return true;
  }

  private ensureNodeVisible(node: Topic): void {
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }

    // A topic focused before the layout places it (AddTopicCommand) has its parent's position.
    const position = node.getPosition();
    const size = node.getSize();
    const bounds = {
      left: position.x - size.width / 2,
      right: position.x + size.width / 2,
      top: position.y - size.height / 2,
      bottom: position.y + size.height / 2,
    };

    canvas.ensureVisible(bounds);
  }

  private _registerAutoPanOnFocus(): void {
    this._autoPanOnFocusListener = (nodeModel: NodeModel) => {
      const topic = this.getModel().findTopicByModel(nodeModel);
      if (topic && this._selectionBatch) {
        // Pan once, when the batch ends ...
        this._selectionBatch.panTo = topic;
      } else if (topic) {
        this.ensureNodeVisible(topic);
      }
    };
    this._layoutEventBus.addEvent('topicSelected', this._autoPanOnFocusListener);
  }

  /**
   * Releases what the designer registered outside its own objects: the handlers on its
   * LayoutEventBus (a topic or the host may still hold the bus), the keyboard, a topic drag in
   * progress, the canvas listeners on the window and the container, the canvas SVG, and the
   * ActionDispatcher instance if it still points at this designer.
   *
   * The PersistenceManager instance is kept: MindplotWebComponent saves and unlocks the map
   * through it after the designer is disposed.
   *
   * The model is left intact, so that the map can still be read and saved (the editor flushes
   * pending changes after the component is removed).
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    // The text editor is appended to the page, outside the canvas ...
    this._topicEventDispatcher.closeFor(this);

    if (this._unsubscribeSelectionShadows) {
      this._unsubscribeSelectionShadows();
      this._unsubscribeSelectionShadows = null;
    }
    HTMLTopicSelected.cleanupSelectionShadows(this);

    if (this._autoPanOnFocusListener) {
      this._layoutEventBus.removeEvent('topicSelected', this._autoPanOnFocusListener);
      this._autoPanOnFocusListener = null;
    }
    this._eventBussDispatcher.dispose();

    if (this._keyboard) {
      this._keyboard.dispose();
      this._keyboard = undefined;
    }

    if (this._wheelListener) {
      this.getContainer().removeEventListener('wheel', this._wheelListener);
      this._wheelListener = null;
    }

    if (this._fontLoadListener) {
      const { fonts } = document as { fonts?: Pick<FontFaceSet, 'removeEventListener'> };
      fonts?.removeEventListener('loadingdone', this._fontLoadListener);
      this._fontLoadListener = null;
    }
    if (this._fontLoadFrame !== null) {
      cancelAnimationFrame(this._fontLoadFrame);
      this._fontLoadFrame = null;
    }

    // Read-only designers have no drag manager ...
    this._dragManager?.cancel();
    this._canvas.dispose();

    ActionDispatcher.clearInstance(this._actionDispatcher);
  }

  isDisposed(): boolean {
    return this._disposed;
  }

  getWorkSpace(): Canvas {
    return this._canvas;
  }

  public get cleanScreen(): () => void {
    return this._cleanScreen;
  }

  public set cleanScreen(value: () => void) {
    this._cleanScreen = value;
  }
}

export default Designer;
