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
import $ from 'jquery';
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
import TopicFeatureFactory from './TopicFeature';

import { create } from './NodeGraphUtils';

import EventBus from './layout/EventBus';
import EventBusDispatcher from './layout/EventBusDispatcher';

import LayoutManager from './layout/LayoutManager';

import INodeModel, { TopicShape } from './model/INodeModel';
import { $notify } from './widget/ToolbarNotifier';
import ImageExpoterFactory from './export/ImageExporterFactory';
import TextExporterFactory from './export/TextExporterFactory';

class Designer extends Events {
  constructor(options, divElement) {
    $assert(options, 'options must be defined');
    $assert(options.zoom, 'zoom must be defined');
    $assert(options.size, 'size must be defined');
    $assert(divElement, 'divElement must be defined');
    super();

    // Set up i18n location ...
    Messages.init(options.locale);

    this._options = options;

    // Set full div elem render area ...
    divElement.css(options.size);

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
    this._workspace = new Workspace(screenManager, this._model.getZoom(), !!options.readOnly);

    // Init layout manager ...
    this._eventBussDispatcher = new EventBusDispatcher(this.getModel());

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

    // Set editor working area ...
    this.setViewPort(options.viewPort);

    TopicEventDispatcher.configure(this.isReadOnly());
    this._clipboard = [];

    // Hack: There are static reference to designer variable. Needs to be reviewed.
    global.designer = this;
  }

  /**
       * @private
       */
  _registerWheelEvents() {
    const zoomFactor = 1.006;
    const me = this;
    // Zoom In and Zoom Out must active event
    $(document).on('mousewheel', (event) => {
      if (event.deltaY > 0) {
        me.zoomIn(zoomFactor);
      } else {
        me.zoomOut(zoomFactor);
      }
      event.preventDefault();
    });
  }

  /**
       * @param {String} type the event type
       * @param {Function} listener
       * forwards to the TopicEventDispatcher or the parent Events class, depending on the type
       */
  addEvent(type, listener) {
    if (type === TopicEvent.EDIT || type === TopicEvent.CLICK) {
      const editor = TopicEventDispatcher.getInstance();
      editor.addEvent(type, listener);
    } else {
      super.addEvent(type, listener);
    }
  }

  /**
       * @private
       */
  _registerMouseEvents() {
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
    screenManager.addEvent('click', (event) => {
      me.onObjectFocusEvent(null, event);
    });

    // Create nodes on double click...
    screenManager.addEvent('dblclick', (event) => {
      if (workspace.isWorkspaceEventsEnabled()) {
        const mousePos = screenManager.getWorkspaceMousePosition(event);
        const centralTopic = me.getModel().getCentralTopic();
        const model = me._createChildModel(centralTopic, mousePos);
        this._actionDispatcher.addTopics([model], [centralTopic.getId()]);
      }
    });
  }

  /**
       * @private
       * @param {mindplot.Workspace} workspace
       * @return {mindplot.DragManager} the new dragManager for the workspace with events
       * registered
       */
  _buildDragManager(workspace) {
    const designerModel = this.getModel();
    const dragConnector = new DragConnector(designerModel, this._workspace);
    const dragManager = new DragManager(workspace, this._eventBussDispatcher);
    const topics = designerModel.getTopics();

    // Enable all mouse events.
    dragManager.addEvent('startdragging', () => {
      topics.forEach((topic) => topic.setMouseEventsEnabled(false));
    });

    dragManager.addEvent('dragging', (event, dragTopic) => {
      dragTopic.updateFreeLayout(event);
      if (!dragTopic.isFreeLayoutOn(event)) {
        // The node is being drag. Is the connection still valid ?
        dragConnector.checkConnection(dragTopic);

        if (!dragTopic.isVisible() && dragTopic.isConnected()) {
          dragTopic.setVisibility(true);
        }
      }
    });

    dragManager.addEvent('enddragging', (event, dragTopic) => {
      topics.forEach((topic) => topic.setMouseEventsEnabled(true));
      dragTopic.applyChanges(workspace);
    });

    return dragManager;
  }

  /**
       * @param {{width:Number, height:Number}} size
       * sets width and height of the workspace
       */
  setViewPort(size) {
    this._workspace.setViewPort(size);
    const model = this.getModel();
    this._workspace.setZoom(model.getZoom(), true);
  }

  /**
       * @private
       * @param {mindplot.model.NodeModel} model
       * @param {Boolean} readOnly
       * @return {mindplot.CentralTopic|mindplot.MainTopic} the topic to the given model,
       * connected, added to the drag manager, with events registered - complying type & read mode
       */
  _buildNodeGraph(model, readOnly) {
    // Create node graph ...
    const topic = create(model, { readOnly });
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
      topic.connectTo(targetTopic, this._workspace);
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

  /**
       * @param {?mindplot.Topic} currentObject
       * @param {Event=} event
       * sets focus to the given currentObject and removes it from any other objects if not
       * triggered with Ctrl pressed
       */
  onObjectFocusEvent(currentObject, event) {
    // Close node editors ..
    const topics = this.getModel().getTopics();
    topics.forEach((topic) => topic.closeEditors());

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

  /** sets focus to all model entities, i.e. relationships and topics */
  selectAll() {
    const model = this.getModel();
    const objects = model.getEntities();
    objects.forEach((object) => {
      object.setOnFocus(true);
    });
  }

  /** removes focus from all model entities, i.e. relationships and topics */
  deselectAll() {
    const objects = this.getModel().getEntities();
    objects.forEach((object) => {
      object.setOnFocus(false);
    });
  }

  /**
       * Set the zoom of the map
       * @param {Number} zoom number between 0.3 and 1.9
       */
  setZoom(zoom) {
    if (zoom > 1.9 || zoom < 0.3) {
      $notify($msg('ZOOM_IN_ERROR'));
      return;
    }
    this.getModel().setZoom(zoom);
    this._workspace.setZoom(zoom);
  }

  /**
     * @param {Number=} factor
     * zoom out by the given factor, or 1.2, if undefined
     */
  zoomOut(factor = 1.2) {
    const model = this.getModel();
    const scale = model.getZoom() * factor;
    if (scale <= 1.9) {
      model.setZoom(scale);
      this._workspace.setZoom(scale);
    } else {
      $notify($msg('ZOOM_ERROR'));
    }
  }

  export(formatType) {
    const workspace = this._workspace;
    const svgElement = workspace.getSVGElement();
    const size = workspace.getSize();

    let exporter;
    switch (formatType) {
      case 'svg' || 'png' || 'jpg': {
        exporter = ImageExpoterFactory.create(formatType, this._mindmap, svgElement, size.width, size.height);
        break;
      }
      case 'wxml': {
        exporter = TextExporterFactory.create(formatType, this._mindmap);
        break;
      }
      default:
        throw new Error('Unsupported encoding');
    }

    return exporter.export();
  }

  /**
       * @param {Number=} factor
       * zoom in by the given factor, or 1.2, if undefined
       */
  zoomIn(factor = 1.2) {
    const model = this.getModel();
    const scale = model.getZoom() / factor;

    if (scale >= 0.3) {
      model.setZoom(scale);
      this._workspace.setZoom(scale);
    } else {
      $notify($msg('ZOOM_ERROR'));
    }
  }

  /** copy selected topics to a private clipboard */
  copyToClipboard() {
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

  /** paste clipboard contents to the mindmap */
  pasteClipboard() {
    if (this._clipboard.length === 0) {
      $notify($msg('CLIPBOARD_IS_EMPTY'));
      return;
    }
    this._actionDispatcher.addTopics(this._clipboard);
    this._clipboard = [];
  }

  /** @return {mindplot.DesignerModel} model */
  getModel() {
    return this._model;
  }

  /** collapse the subtree of the selected topic */
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

  /** create a NodeModel for the selected node's child and add it via the ActionDispatcher */
  createChildForSelectedNode() {
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

  /**
       * @private
       */
  _copyNodeProps(sourceModel, targetModel) {
    // I don't copy the font size if the target is the source is the central topic.
    if (sourceModel.getType() !== 'CentralTopic') {
      const fontSize = sourceModel.getFontSize();
      if (fontSize) {
        targetModel.setFontSize(fontSize);
      }
    }

    const fontFamily = sourceModel.getFontFamily();
    if (fontFamily) {
      targetModel.setFontFamily(fontFamily);
    }

    const fontColor = sourceModel.getFontColor();
    if (fontColor) {
      targetModel.setFontColor(fontColor);
    }

    const fontWeight = sourceModel.getFontWeight();
    if (fontWeight) {
      targetModel.setFontWeight(fontWeight);
    }

    const fontStyle = sourceModel.getFontStyle();
    if (fontStyle) {
      targetModel.setFontStyle(fontStyle);
    }

    const shape = sourceModel.getShapeType();
    if (shape) {
      targetModel.setShapeType(shape);
    }

    const borderColor = sourceModel.getBorderColor();
    if (borderColor) {
      targetModel.setBorderColor(borderColor);
    }

    const backgroundColor = sourceModel.getBackgroundColor();
    if (backgroundColor) {
      targetModel.setBackgroundColor(backgroundColor);
    }
  }

  /**
       * @private
       * @param {Topic} topic the parent topic of the child to create the NodeModel for
       * @param {Point} mousePos the mouse position
       * @return {NodeModel} the node model for the new child
       */
  _createChildModel(topic, mousePos) {
    // Create a new node ...
    const parentModel = topic.getModel();
    const mindmap = parentModel.getMindmap();
    const childModel = mindmap.createNode();

    // Create a new node ...
    const layoutManager = this._eventBussDispatcher.getLayoutManager();
    const result = layoutManager.predict(topic.getId(), null, mousePos);
    childModel.setOrder(result.order);

    const { position } = result;
    childModel.setPosition(position.x, position.y);

    this._copyNodeProps(parentModel, childModel);

    return childModel;
  }

  addDraggedNode(event, model) {
    $assert(event, 'event can not be null');
    $assert(model, 'model can not be null');

    // Position far from the visual area ...
    model.setPosition(1000, 1000);

    this._actionDispatcher.addTopics([model]);
    const topic = this.getModel().findTopicById(model.getId());

    // Simulate a mouse down event to start the dragging ...
    topic.fireEvent('mousedown', event);
  }

  /**
       * creates a sibling or child node of the selected node, if the selected node is the
       * central topic
       */
  createSiblingForSelectedNode() {
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

      // Hack: if parent is central topic, add node below not on opposite side.
      // This should be done in the layout
      if (parentTopic.getType() === 'CentralTopic') {
        siblingModel.setOrder(topic.getOrder() + 2);
      }

      const parentTopicId = parentTopic.getId();
      this._actionDispatcher.addTopics([siblingModel], [parentTopicId]);
    }
  }

  /**
       * @private
       * @param {mindplot.Topic} topic the topic to create the sibling to
       * @return {mindplot.NodeModel} the node model of the sibling
       */
  _createSiblingModel(topic) {
    let result = null;
    let model = null;
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
    }

    this._copyNodeProps(model, result);

    return result;
  }

  /**
       * @param {Event} event
       */
  showRelPivot(event) {
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

  /** @return {{zoom:Number}} the zoom */
  getMindmapProperties() {
    const model = this.getModel();
    return { zoom: model.getZoom() };
  }

  /**
       * @param {mindplot.Mindmap} model
       * @throws will throw an error if mindmapModel is null or undefined
       */
  loadMap(model) {
    $assert(model, 'mindmapModel can not be null');
    this._mindmap = model;

    // Init layout manager ...
    const size = { width: 25, height: 25 };
    const layoutManager = new LayoutManager(model.getCentralTopic().getId(), size);
    const me = this;
    layoutManager.addEvent('change', (event) => {
      const id = event.getId();
      const topic = me.getModel().findTopicById(id);
      topic.setPosition(event.getPosition());
      topic.setOrder(event.getOrder());
    });
    this._eventBussDispatcher.setLayoutManager(layoutManager);

    // Building node graph ...
    const branches = model.getBranches();
    branches.forEach((branch) => {
      const nodeGraph = this.nodeModelToNodeGraph(branch);
      nodeGraph.setBranchVisibility(true);
    });

    // Connect relationships ...
    const relationships = model.getRelationships();
    relationships.forEach((relationship) => this._relationshipModelToRelationship(relationship));

    // Place the focus on the Central Topic
    const centralTopic = this.getModel().getCentralTopic();
    this.goToNode(centralTopic);

    // Finally, sort the map ...
    EventBus.instance.fireEvent(EventBus.events.DoLayout);

    this.fireEvent('loadSuccess');
  }

  /** */
  getMindmap() {
    return this._mindmap;
  }

  /** */
  undo() {
    // @Todo: This is a hack...
    this._actionDispatcher._actionRunner.undo();
  }

  /** */
  redo() {
    this._actionDispatcher._actionRunner.redo();
  }

  /** */
  isReadOnly() {
    return this._options.readOnly;
  }

  /**
       * @param {mindplot.model.NodeModel} nodeModel
       * @return {mindplot.Topic} the topic (extends mindplot.NodeGraph) created to the model
       */
  nodeModelToNodeGraph(nodeModel) {
    $assert(nodeModel, 'Node model can not be null');
    let children = nodeModel.getChildren().slice();
    children = children.sort((a, b) => a.getOrder() - b.getOrder());

    const result = this._buildNodeGraph(nodeModel, this.isReadOnly());
    result.setVisibility(false);

    this._workspace.append(result);
    children.forEach((child) => {
      if ($defined(child)) {
        this.nodeModelToNodeGraph(child);
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
  _relationshipModelToRelationship(model) {
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

  /**
       * @param {mindplot.model.RelationshipModel} model
       * @return {mindplot.Relationship} the relationship added to the mindmap
       */
  addRelationship(model) {
    const mindmap = this.getMindmap();
    mindmap.addRelationship(model);
    return this._relationshipModelToRelationship(model);
  }

  /**
       * deletes the relationship from the linked topics, DesignerModel, Workspace and Mindmap
       * @param {mindplot.Relationship} rel the relationship to delete
       */
  deleteRelationship(rel) {
    const sourceTopic = rel.getSourceTopic();
    sourceTopic.deleteRelationship(rel);

    const targetTopic = rel.getTargetTopic();
    targetTopic.deleteRelationship(rel);

    this.getModel().removeRelationship(rel);
    this._workspace.removeChild(rel);

    const mindmap = this.getMindmap();
    mindmap.deleteRelationship(rel.getModel());
  }

  /**
       * @private
       * @param {mindplot.model.RelationshipModel} model
       * @return {mindplot.Relationship} the new relationship with events registered
       * @throws will throw an error if the target topic cannot be found
       */
  _buildRelationshipShape(model) {
    const dmodel = this.getModel();

    const sourceTopicId = model.getFromNode();
    const sourceTopic = dmodel.findTopicById(sourceTopicId);

    const targetTopicId = model.getToNode();
    const targetTopic = dmodel.findTopicById(targetTopicId);
    $assert(
      targetTopic,
      `targetTopic could not be found:${targetTopicId},${dmodel
        .getTopics()
        .map((e) => e.getId())}`,
    );

    // Build relationship line ....
    const result = new Relationship(sourceTopic, targetTopic, model);
    const me = this;

    result.addEvent('ontblur', () => {
      const topics = me.getModel().filterSelectedTopics();
      const rels = me.getModel().filterSelectedRelationships();

      if (topics.length === 0 || rels.length === 0) {
        me.fireEvent('onblur');
      }
    });

    result.addEvent('ontfocus', () => {
      const topics = me.getModel().filterSelectedTopics();
      const rels = me.getModel().filterSelectedRelationships();

      if (topics.length === 1 || rels.length === 1) {
        me.fireEvent('onfocus');
      }
    });

    // Append it to the workspace ...
    dmodel.addRelationship(result);

    return result;
  }

  /**
       * @param {mindplot.Topic} node the topic to remove
       * removes the given topic and its children from Workspace, DesignerModel and NodeModel
       */
  removeTopic(node) {
    if (!node.isCentralTopic()) {
      const parent = node._parent;
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

      if ($defined(parent)) {
        this.goToNode(parent);
      }
    }
  }

  /**
       * @private
       */
  _resetEdition() {
    const screenManager = this._workspace.getScreenManager();
    screenManager.fireEvent('update');
    screenManager.fireEvent('mouseup');
    this._relPivot.dispose();
  }

  /** */
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

  /** */
  changeFontFamily(font) {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontFamilyToTopic(topicsIds, font);
    }
  }

  /** */
  changeFontStyle() {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontStyleToTopic(topicsIds);
    }
  }

  /** */
  changeFontColor(color) {
    $assert(color, 'color can not be null');

    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontColorToTopic(topicsIds, color);
    }
  }

  /** */
  changeBackgroundColor(color) {
    const validateFunc = (topic) => topic.getShapeType() !== TopicShape.LINE;
    const validateError = 'Color can not be set to line topics.';

    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeBackgroundColorToTopic(topicsIds, color);
    }
  }

  /** */
  changeBorderColor(color) {
    const validateFunc = (topic) => topic.getShapeType() !== TopicShape.LINE;
    const validateError = 'Color can not be set to line topics.';
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeBorderColorToTopic(topicsIds, color);
    }
  }

  /** */
  changeFontSize(size) {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontSizeToTopic(topicsIds, size);
    }
  }

  /** */
  changeTopicShape(shape) {
    const validateFunc = (topic) => !(
      topic.getType() === 'CentralTopic' && shape === TopicShape.LINE
    );

    const validateError = 'Central Topic shape can not be changed to line figure.';
    const topicsIds = this.getModel().filterTopicsIds(validateFunc, validateError);
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeShapeTypeToTopic(topicsIds, shape);
    }
  }

  /** */
  changeFontWeight() {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.changeFontWeightToTopic(topicsIds);
    }
  }

  /** */
  addIconType(iconType) {
    const topicsIds = this.getModel().filterTopicsIds();
    if (topicsIds.length > 0) {
      this._actionDispatcher.addFeatureToTopic(topicsIds[0], TopicFeatureFactory.Icon.id, {
        id: iconType,
      });
    }
  }

  /**
       * lets the selected topic open the link editor where the user can define or modify an
       * existing link
       */
  addLink() {
    const model = this.getModel();
    const topic = model.selectedTopic();
    if (topic) {
      topic.showLinkEditor();
      this.onObjectFocusEvent();
    }
  }

  /** */
  addNote() {
    const model = this.getModel();
    const topic = model.selectedTopic();
    if (topic) {
      topic.showNoteEditor();
      this.onObjectFocusEvent();
    }
  }

  /**
       * @param {mindplot.Topic} node
       * sets the focus to the given node
       */
  goToNode(node) {
    node.setOnFocus(true);
    this.onObjectFocusEvent(node);
  }

  /** @return {mindplot.Workspace} */
  getWorkSpace() {
    return this._workspace;
  }
}

export default Designer;
