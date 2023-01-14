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
import Point from '@wisemapping/web2d';
import Messages, { $msg } from './Messages';

import Events from './Events';
import StandaloneActionDispatcher from './StandaloneActionDispatcher';

import CommandContext from './CommandContext';
import ActionDispatcher from './ActionDispatcher';

import DesignerModel from './DesignerModel';
import DesignerKeyboard from './DesignerKeyboard';

import ScreenManager from './ScreenManager';
import Workspace from './Workspace';

import DragConnector from './DragConnector';
import DragManager from './DragManager';
import RelationshipPivot from './RelationshipPivot';
import Relationship from './Relationship';

import TopicEventDispatcher, { TopicEvent } from './TopicEventDispatcher';
import TopicFactory from './TopicFactory';

import EventBus from './layout/EventBus';
import EventBusDispatcher from './layout/EventBusDispatcher';

import LayoutManager from './layout/LayoutManager';

import { $notify } from './widget/ToolbarNotifier';
import RelationshipModel from './model/RelationshipModel';
import Mindmap from './model/Mindmap';
import NodeModel from './model/NodeModel';
import Topic from './Topic';
import { DesignerOptions } from './DesignerOptionsBuilder';
import DragTopic from './DragTopic';
import CentralTopic from './CentralTopic';
import FeatureType from './model/FeatureType';
import WidgetManager from './WidgetManager';
import { TopicShapeType } from './model/INodeModel';
import { LineType } from './ConnectionLine';

class Designer extends Events {
  private _mindmap: Mindmap | null;

  private _options: DesignerOptions;

  private _actionDispatcher: StandaloneActionDispatcher;

  private _model: DesignerModel;

  private _workspace: Workspace;

  _eventBussDispatcher: EventBusDispatcher;

  private _dragManager!: DragManager;

  private _relPivot: RelationshipPivot;

  private _clipboard: NodeModel[];

  private _cleanScreen!: () => void;

  constructor(options: DesignerOptions, divElement: JQuery) {
    super();
    $assert(options, 'options must be defined');
    $assert(options.zoom, 'zoom must be defined');
    $assert(divElement, 'divElement must be defined');

    // Set up i18n location ...
    console.log(`Editor location: ${options.locale}`);
    Messages.init(options.locale ? options.locale : 'en');

    this._options = options;

    // Set full div elem render area.The component must fill container size
    // container is responsible for location and size
    divElement.css('width', '100%');
    divElement.css('height', '100%');

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
    const screenManager = new ScreenManager(divElement);
    this._workspace = new Workspace(screenManager, this._model.getZoom(), this.isReadOnly());

    // Init layout manager ...
    this._eventBussDispatcher = new EventBusDispatcher();

    // Register events
    if (!this.isReadOnly()) {
      // Register mouse events ...
      this._registerMouseEvents();

      // Register keyboard events ...
      DesignerKeyboard.register(this);

      this._dragManager = this._buildDragManager(this._workspace);
    }
    this._registerWheelEvents();

    this._relPivot = new RelationshipPivot(this._workspace, this);

    TopicEventDispatcher.configure(this.isReadOnly());
    this._clipboard = [];

    // Hack: There are static reference to designer variable. Needs to be reviewed.
    globalThis.designer = this;
    this._mindmap = null;
  }

  private _registerWheelEvents(): void {
    const zoomFactor = 1.02;
    document.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        // TODO re-do this better. This line avoid manage zoom with mouse wheel if mindplot kb shortcuts are disabled.
        if (DesignerKeyboard.isDisabled()) return;

        if (event.deltaX > 0 || event.deltaY > 0) {
          this.zoomOut(zoomFactor);
        } else {
          this.zoomIn(zoomFactor);
        }
        event.preventDefault();
      },
      { passive: false },
    );
  }

  getActionDispatcher(): StandaloneActionDispatcher {
    return this._actionDispatcher;
  }

  addEvent(type: string, listener): Events {
    if (type === TopicEvent.EDIT || type === TopicEvent.CLICK) {
      const editor = TopicEventDispatcher.getInstance();
      editor.addEvent(type, listener);
    } else {
      super.addEvent(type, listener);
    }
    return this;
  }

  private _registerMouseEvents() {
    const workspace = this._workspace;
    const screenManager = workspace.getScreenManager();
    const me = this;
    // Initialize workspace event listeners.
    screenManager.addEvent('update', () => {
      // Topic must be set to his original state. All editors must be closed.
      const topics = me.getModel().getTopics();
      topics.forEach((object) => {
        object.closeEditors();
      });

      // Clean some selected nodes on event ..
      if (me._cleanScreen) me._cleanScreen();
    });

    // Deselect on click ...
    screenManager.addEvent('click', (event: UIEvent) => {
      me.onObjectFocusEvent(undefined, event);
    });

    // Create nodes on double click...
    screenManager.addEvent('dblclick', (event: MouseEvent) => {
      if (workspace.isWorkspaceEventsEnabled()) {
        const mousePos = screenManager.getWorkspaceMousePosition(event);
        const centralTopic: CentralTopic = me.getModel().getCentralTopic();

        const model = me._createChildModel(centralTopic, mousePos);
        this._actionDispatcher.addTopics([model], [centralTopic.getId()]);
      }
    });
  }

  private _buildDragManager(workspace: Workspace): DragManager {
    const designerModel = this.getModel();
    const dragConnector = new DragConnector(designerModel, this._workspace);
    const dragManager = new DragManager(workspace, this._eventBussDispatcher);
    const topics = designerModel.getTopics();

    // Enable all mouse events.
    dragManager.addEvent('startdragging', () => {
      topics.forEach((topic) => topic.setMouseEventsEnabled(false));
    });

    dragManager.addEvent('dragging', (event: MouseEvent, dragTopic: DragTopic) => {
      // The node is being drag. Is the connection still valid ?
      dragConnector.checkConnection(dragTopic, event.metaKey || event.ctrlKey);

      if (!dragTopic.isVisible() && dragTopic.isConnected()) {
        dragTopic.setVisibility(true);
      }
    });

    dragManager.addEvent('enddragging', (event: MouseEvent, dragTopic: DragTopic) => {
      topics.forEach((topic) => topic.setMouseEventsEnabled(true));
      dragTopic.applyChanges(workspace);
    });

    return dragManager;
  }

  private _buildNodeGraph(model: NodeModel, readOnly: boolean): Topic {
    // Create node graph ...
    const topic = TopicFactory.create(model, { readOnly });
    this.getModel().addTopic(topic);
    const me = this;
    // Add Topic events ...
    if (!readOnly) {
      // If a node had gained focus, clean the rest of the nodes ...
      topic.addEvent('mousedown', (event) => {
        me.onObjectFocusEvent(topic, event);
      });

      // Register node listeners ...
      if (topic.getType() !== 'CentralTopic') {
        // Central Topic doesn't support to be dragged
        this._dragManager.add(topic);
      }
    }

    // Connect Topic ...
    const isConnected = model.isConnected();
    if (isConnected) {
      // Improve this ...
      const targetTopicModel = model.getParent();

      // Find target topic with the same model ...
      const topics = this.getModel().getTopics();
      const targetTopic = topics.find((t) => t.getModel() === targetTopicModel);
      if (targetTopic) {
        model.disconnect();
      } else {
        $assert(targetTopic, 'Could not find a topic to connect');
      }

      if (targetTopic) {
        topic.connectTo(targetTopic, this._workspace);
      }
    }

    topic.addEvent('ontblur', () => {
      const topics = me.getModel().filterSelectedTopics();
      const rels = me.getModel().filterSelectedRelationships();

      if (topics.length === 0 || rels.length === 0) {
        me.fireEvent('onblur');
      }
    });

    topic.addEvent('ontfocus', () => {
      const topics = me.getModel().filterSelectedTopics();
      const rels = me.getModel().filterSelectedRelationships();

      if (topics.length === 1 || rels.length === 1) {
        me.fireEvent('onfocus');
      }
    });

    return topic;
  }

  onObjectFocusEvent(currentObject?: Topic, event?): void {
    // Close node editors ..
    this.closeNodeEditors();

    const model = this.getModel();
    const objects = model.getEntities();
    objects.forEach((object) => {
      // Disable all nodes on focus but not the current if Ctrl key isn't being pressed
      if (!$defined(event) || (!event.ctrlKey && !event.metaKey)) {
        if (object.isOnFocus() && object !== currentObject) {
          object.setOnFocus(false);
        }
      }
    });
  }

  closeNodeEditors() {
    const topics = this.getModel().getTopics();
    topics.forEach((topic) => topic.closeEditors());
  }

  /** sets focus to all model entities, i.e. relationships and topics */
  selectAll(): void {
    const model = this.getModel();
    const objects = model.getEntities();
    objects.forEach((object) => {
      object.setOnFocus(true);
    });
  }

  /** removes focus from all model entities, i.e. relationships and topics */
  deselectAll(): void {
    const objects = this.getModel().getEntities();
    objects.forEach((object) => {
      object.setOnFocus(false);
    });
  }

  setZoom(zoom: number): void {
    if (zoom > 1.9 || zoom < 0.3) {
      $notify($msg('ZOOM_IN_ERROR'));
      return;
    }
    this.getModel().setZoom(zoom);
    this._workspace.setZoom(zoom);
  }

  zoomToFit(): void {
    this.getModel().setZoom(1);
    this._workspace.setZoom(1, true);
  }

  zoomOut(factor = 1.2) {
    const model = this.getModel();
    const scale = model.getZoom() * factor;
    if (scale <= 7.0) {
      model.setZoom(scale);
      this._workspace.setZoom(scale);
    } else {
      $notify($msg('ZOOM_ERROR'));
    }
  }

  zoomIn(factor = 1.2): void {
    const model = this.getModel();
    const scale = model.getZoom() / factor;

    if (scale >= 0.3) {
      model.setZoom(scale);
      this._workspace.setZoom(scale);
    } else {
      $notify($msg('ZOOM_ERROR'));
    }
  }

  shrinkSelectedBranch() {
    const nodes = this.getModel().filterSelectedTopics();
    if (nodes.length <= 0 || nodes.length !== 1) {
      // If there are more than one node selected,
      $notify($msg('ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE'));
      return;
    }
    // Execute event ...
    const topic = nodes[0];
    if (topic.getType() !== 'CentralTopic') {
      this._actionDispatcher.shrinkBranch([topic.getId()], !topic.areChildrenShrunken());
    }
  }

  copyToClipboard(): void {
    let topics = this.getModel().filterSelectedTopics();
    if (topics.length <= 0) {
      // If there are more than one node selected,
      $notify($msg('AT_LEAST_ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }

    // Exclude central topic ..
    topics = topics.filter((topic) => !topic.isCentralTopic());

    this._clipboard = topics.map((topic) => {
      const nodeModel = topic.getModel().deepCopy();

      // Change position to make the new topic evident...
      const pos = nodeModel.getPosition();
      nodeModel.setPosition(pos.x + 60 * Math.sign(pos.x), pos.y + 30);

      return nodeModel;
    });

    $notify($msg('SELECTION_COPIED_TO_CLIPBOARD'));
  }

  pasteClipboard(): void {
    if (this._clipboard.length === 0) {
      $notify($msg('CLIPBOARD_IS_EMPTY'));
      return;
    }
    this._actionDispatcher.addTopics(this._clipboard, null);
    this._clipboard = [];
  }

  getModel(): DesignerModel {
    return this._model;
  }

  createChildForSelectedNode(): void {
    const nodes = this.getModel().filterSelectedTopics();
    if (nodes.length <= 0) {
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
    const parentTopic = nodes[0];
    const parentTopicId = parentTopic.getId();
    const childModel = this._createChildModel(parentTopic);

    // Execute event ...
    this._actionDispatcher.addTopics([childModel], [parentTopicId]);
  }

  private _createChildModel(topic: Topic, mousePos: Point = null): NodeModel {
    // Create a new node ...
    const parentModel = topic.getModel();
    const mindmap = parentModel.getMindmap();
    const childModel = mindmap.createNode();

    // If node is shink, expand ...
    if (topic.areChildrenShrunken()) {
      topic.setChildrenShrunken(false);
    }

    // Create a new node ...
    const layoutManager = this._eventBussDispatcher.getLayoutManager();
    const result = layoutManager.predict(topic.getId(), null, mousePos);
    childModel.setOrder(result.order);

    const { position } = result;
    childModel.setPosition(position.x, position.y);

    childModel.copy(parentModel);

    return childModel;
  }

  createSiblingForSelectedNode(): void {
    const nodes = this.getModel().filterSelectedTopics();
    if (nodes.length <= 0) {
      // If there are no nodes selected,
      $notify($msg('ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }
    if (nodes.length > 1) {
      // If there are more than one node selected,
      $notify($msg('ONLY_ONE_TOPIC_MUST_BE_SELECTED'));
      return;
    }

    const topic = nodes[0];
    if (!topic.getOutgoingConnectedTopic()) {
      // Central topic and isolated topics ....
      // Central topic doesn't have siblings ...
      this.createChildForSelectedNode();
    } else {
      const parentTopic = topic.getOutgoingConnectedTopic();
      const siblingModel = this._createSiblingModel(topic);

      if (siblingModel && parentTopic) {
        // Hack: if parent is central topic, add node below not on opposite side.
        // This should be done in the layout
        if (parentTopic.getType() === 'CentralTopic') {
          siblingModel.setOrder(topic.getOrder() + 2);
        }

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

      // Create a new node ...
      const order = topic.getOrder() + 1;
      result.setOrder(order);
      result.setPosition(10, 10); // Set a dummy position ...
      result.copy(model);
    }

    return result;
  }

  showRelPivot(event: MouseEvent): void {
    const nodes = this.getModel().filterSelectedTopics();
    if (nodes.length <= 0) {
      // This could not happen ...
      $notify($msg('RELATIONSHIP_COULD_NOT_BE_CREATED'));
      return;
    }

    // Current mouse position ....
    const screen = this._workspace.getScreenManager();
    const pos = screen.getWorkspaceMousePosition(event);

    // create a connection ...
    this._relPivot.start(nodes[0], pos);
  }

  getMindmapProperties(): { zoom: number } {
    const model = this.getModel();
    return { zoom: model.getZoom() };
  }

  loadMap(mindmap: Mindmap): Promise<void> {
    this._mindmap = mindmap;

    this._workspace.enableQueueRender(true);

    // Init layout manager ...
    const size = { width: 25, height: 25 };
    const layoutManager = new LayoutManager(mindmap.getCentralTopic().getId(), size);
    layoutManager.addEvent('change', (event) => {
      const id = event.getId();
      const topic = this.getModel().findTopicById(id);
      if (topic) {
        topic.setPosition(event.getPosition());
        topic.setOrder(event.getOrder());
      }
    });
    this._eventBussDispatcher.setLayoutManager(layoutManager);

    // Building node graph ...
    const branches = mindmap.getBranches();

    const nodesGraph: Topic[] = [];
    branches.forEach((branch) => {
      const nodeGraph = this.nodeModelToTopic(branch);
      nodesGraph.push(nodeGraph);
    });

    // Place the focus on the Central Topic
    const centralTopic = this.getModel().getCentralTopic();
    this.goToNode(centralTopic);

    return this._workspace.enableQueueRender(false).then(() => {
      // Connect relationships ...
      const relationships = mindmap.getRelationships();
      relationships.forEach((relationship) => this._relationshipModelToRelationship(relationship));

      // Render nodes ...
      nodesGraph.forEach((topic) => topic.setVisibility(true));

      // Enable workspace drag events ...
      this._workspace.registerEvents();
      // Finally, sort the map ...
      EventBus.instance.fireEvent('forceLayout');
      this.fireEvent('loadSuccess');
    });
  }

  getMindmap(): Mindmap {
    return this._mindmap!;
  }

  undo(): void {
    this._actionDispatcher.actionRunner.undo();
  }

  redo(): void {
    this._actionDispatcher.actionRunner.redo();
  }

  isReadOnly(): boolean {
    return this._options.mode === 'viewonly' || this._options.mode === 'edition-viewer';
  }

  nodeModelToTopic(nodeModel: NodeModel): Topic {
    $assert(nodeModel, 'Node model can not be null');
    let children = nodeModel.getChildren().slice();
    children = children.sort((a, b) => a.getOrder() - b.getOrder());

    const result = this._buildNodeGraph(nodeModel, this.isReadOnly());
    result.setVisibility(false);

    this._workspace.append(result);
    children.forEach((child) => {
      if (child) {
        this.nodeModelToTopic(child);
      }
    });
    return result;
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

    this._workspace.append(result);
    return result;
  }

  addRelationship(model: RelationshipModel): Relationship {
    const mindmap = this.getMindmap();
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
    this._workspace.removeChild(rel);

    const mindmap = this.getMindmap();
    mindmap.deleteRelationship(rel.getModel());
  }

  private _buildRelationshipShape(model: RelationshipModel): Relationship {
    const dmodel = this.getModel();

    const sourceTopicId = model.getFromNode();
    const sourceTopic = dmodel.findTopicById(sourceTopicId);

    const targetTopicId = model.getToNode();
    const targetTopic = dmodel.findTopicById(targetTopicId);
    $assert(
      targetTopic,
      `targetTopic could not be found:${targetTopicId},${dmodel.getTopics().map((e) => e.getId())}`,
    );

    // Build relationship line ....
    const result = new Relationship(sourceTopic!, targetTopic!, model);
    result.addEvent('ontblur', () => {
      const topics = this.getModel().filterSelectedTopics();
      const rels = this.getModel().filterSelectedRelationships();

      if (topics.length === 0 || rels.length === 0) {
        this.fireEvent('onblur');
      }
    });

    result.addEvent('ontfocus', () => {
      const topics = this.getModel().filterSelectedTopics();
      const rels = this.getModel().filterSelectedRelationships();

      if (topics.length === 1 || rels.length === 1) {
        this.fireEvent('onfocus');
      }
    });

    // Append it to the workspace ...
    dmodel.addRelationship(result);

    return result;
  }

  removeTopic(node: Topic): void {
    if (!node.isCentralTopic()) {
      const parent = node.getParent();
      node.disconnect(this._workspace);

      // remove children
      while (node.getChildren().length > 0) {
        this.removeTopic(node.getChildren()[0]);
      }

      this._workspace.removeChild(node);
      this.getModel().removeTopic(node);

      // Delete this node from the model...
      const model = node.getModel();
      model.deleteNode();

      if (parent) {
        this.goToNode(parent);
      }
    }
  }

  private _resetEdition() {
    const screenManager = this._workspace.getScreenManager();
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
    if (topics.length === 1 && topics[0].isCentralTopic()) {
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

  changeFontFamily(font: string) {
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

  changeFontSize(size: number) {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontSizeToTopic(topicsIds, size);
    }
  }

  changeTopicShape(shape: TopicShapeType): void {
    const validateFunc = (topic: Topic) =>
      !(topic.getType() === 'CentralTopic' && shape === 'line');

    const validateError = $msg('CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED');
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeShapeTypeToTopic(topicsIds, shape);
    }
  }

  changeConnectionStyle(type: LineType): void {
    const validateFunc = (topic: Topic) => !topic.isCentralTopic();

    const validateError = $msg('CENTRAL_TOPIC_CONNECTION_STYLE_CAN_NOT_BE_CHANGED');
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
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
      const manager = WidgetManager.getInstance();
      manager.showEditorForLink(topic, null, null);
      this.closeNodeEditors();
    }
  }

  addNote(): void {
    const model = this.getModel();
    const topic = model.selectedTopic();
    if (topic) {
      const manager = WidgetManager.getInstance();
      manager.showEditorForNote(topic, null, null);
      this.closeNodeEditors();
    }
  }

  goToNode(node: Topic): void {
    node.setOnFocus(true);
    this.onObjectFocusEvent(node);
  }

  getWorkSpace(): Workspace {
    return this._workspace;
  }

  public get cleanScreen(): () => void {
    return this._cleanScreen;
  }

  public set cleanScreen(value: () => void) {
    this._cleanScreen = value;
  }
}

export default Designer;
