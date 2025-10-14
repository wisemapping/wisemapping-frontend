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
import { Text, Group, ElementClass, ElementPeer, Rect } from '@wisemapping/web2d';
import { $assert, $defined } from './util/assert';

import NodeGraph, { NodeOption } from './NodeGraph';
import TopicFeatureFactory from './TopicFeature';
import ConnectionLine, { LineType } from './ConnectionLine';
import IconGroup from './IconGroup';
import ImageEmojiFeature from './ImageEmojiFeature';
import ImageSVGFeature from './ImageSVGFeature';
import LayoutEventBus from './layout/LayoutEventBus';
import ShirinkConnector from './ShrinkConnector';
import ActionDispatcher from './ActionDispatcher';

import TopicEventDispatcher from './TopicEventDispatcher';
import { TopicShapeType } from './model/INodeModel';
import NodeModel from './model/NodeModel';
import Relationship from './Relationship';
import Canvas from './Canvas';
import LayoutManager from './layout/LayoutManager';
import NoteModel from './model/NoteModel';
import LinkModel from './model/LinkModel';
import SizeType from './SizeType';
import FeatureModel from './model/FeatureModel';
import PositionType from './PositionType';
import Icon from './Icon';
import { FontStyleType } from './FontStyleType';
import { FontWeightType } from './FontWeightType';
import DragTopic from './DragTopic';
import ThemeFactory from './theme/ThemeFactory';
import { ThemeVariant } from './theme/Theme';
import TopicShape from './shape/TopicShape';
import TopicShapeFactory from './shape/TopicShapeFactory';

const ICON_SCALING_FACTOR = 1.3;

abstract class Topic extends NodeGraph {
  private _innerShape: TopicShape | null;

  private _relationships: Relationship[];

  private _isInWorkspace: boolean;

  private _children: Topic[];

  private _parent: Topic | null;

  private _outerShape: Rect | undefined;

  private _text: Text | undefined;

  private _imageEmojiFeature: ImageEmojiFeature;

  private _imageSVGFeature: ImageSVGFeature;

  private _iconsGroup!: IconGroup;

  private _connector!: ShirinkConnector;

  private _outgoingLine!: ConnectionLine | null;

  private _themeVariant: ThemeVariant;

  constructor(model: NodeModel, options: NodeOption, themeVariant: ThemeVariant) {
    super(model, options);
    this._children = [];
    this._parent = null;
    this._relationships = [];
    this._isInWorkspace = false;
    this._innerShape = null;
    this._themeVariant = themeVariant;
    this._imageEmojiFeature = new ImageEmojiFeature(this);

    this._imageSVGFeature = new ImageSVGFeature(this);
    this.buildTopicShape();

    // Position a topic ....
    const pos = model.getPosition();
    if (pos && this.isCentralTopic()) {
      this.setPosition(pos);
    }

    // Register events for the topic ...
    if (!this.isReadOnly()) {
      this.registerEvents();
    }
  }

  protected registerEvents(): void {
    this.setMouseEventsEnabled(true);

    // Prevent click on the topics being propagated ...
    this.addEvent('click', (event: Event) => {
      event.stopPropagation();
    });

    this.addEvent('dblclick', (event: Event) => {
      this._getTopicEventDispatcher().show(this);
      event.stopPropagation();
    });
  }

  setShapeType(type: TopicShapeType): void {
    const model = this.getModel();
    model.setShapeType(type);

    this.redraw(this.getThemeVariant(), false);
  }

  getParent(): Topic | null {
    return this._parent;
  }

  getThemeVariant(): ThemeVariant {
    return this._themeVariant;
  }

  setThemeVariant(variant: ThemeVariant): void {
    this._themeVariant = variant;
  }

  updateTopicShape(): boolean {
    const result = this.getInnerShape().getShapeType() !== this.getShapeType();
    if (result) {
      this.removeInnerShape();

      // Create a new one ...
      const innerShape = this.getInnerShape();

      // Update figure size ...
      const size = this.getSize();
      this.setSize(size, true);

      const group = this.get2DElement();
      innerShape.appendTo(group);

      // Move text to the front ...
      const text = this.getOrBuildTextShape();
      text.moveToFront();

      // Move iconGroup to front ...
      const iconGroup = this.getIconGroup();
      if (iconGroup) {
        iconGroup.moveToFront();
      }

      // Move connector to front
      const connector = this.getShrinkConnector();
      if (connector) {
        connector.moveToFront();
      }
    }
    return result;
  }

  getShapeType(): TopicShapeType {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());
    return theme.getShapeType(this);
  }

  getConnectionStyle(): LineType {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());
    return theme.getConnectionType(this);
  }

  getConnectionColor(variant: ThemeVariant): string {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, variant);
    return theme.getConnectionColor(this);
  }

  private removeInnerShape(): TopicShape {
    const group = this.get2DElement();
    const innerShape = this.getInnerShape();

    innerShape.removeFrom(group);
    this._innerShape = null;

    return innerShape;
  }

  getInnerShape(): TopicShape {
    if (!this._innerShape) {
      // Create inner box.
      const shapeType = this.getShapeType();
      this._innerShape = TopicShapeFactory.create(shapeType, this);

      // Define the pointer ...
      if (!this.isCentralTopic() && !this.isReadOnly()) {
        this._innerShape.setCursor('move');
      } else {
        this._innerShape.setCursor('default');
      }
    }
    return this._innerShape;
  }

  setCursor(type: string): void {
    const innerShape = this.getInnerShape();
    innerShape.setCursor(type);

    const outerShape = this.getOuterShape();
    outerShape.setCursor(type);

    const textShape = this.getOrBuildTextShape();
    textShape.setCursor(type);
  }

  getOuterShape(): Rect {
    if (!this._outerShape) {
      const rect = new Rect(0.6);

      rect.setPosition(-3, -3);
      rect.setOpacity(0);
      this._outerShape = rect;
    }

    return this._outerShape;
  }

  getOrBuildTextShape(): Text {
    if (!this._text) {
      this._text = this.buildTextShape(false);

      // @todo: Review this. Get should not modify the state ....
      const text = this.getText();
      this._text.setText(text);
    }

    return this._text;
  }

  getOrBuildImageEmojiTextShape(): Text | undefined {
    return this._imageEmojiFeature.getOrBuildEmojiTextShape();
  }

  getOrBuildImageSVGElement(): Text | undefined {
    return this._imageSVGFeature.getOrBuildSVGElement();
  }

  getOrBuildIconGroup(): IconGroup {
    if (!this._iconsGroup) {
      const iconGroup = this.buildIconGroup();
      const group = this.get2DElement();

      iconGroup.appendTo(group);
      this._iconsGroup = iconGroup;
    }
    return this._iconsGroup;
  }

  private getIconGroup(): IconGroup | null {
    return this._iconsGroup;
  }

  private buildIconGroup(): IconGroup {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());

    const textHeight = this.getOrBuildTextShape().getFontHeight();
    const iconSize = textHeight * ICON_SCALING_FACTOR;
    const result = new IconGroup(this.getId(), iconSize);
    const padding = theme.getInnerPadding(this);
    result.setPosition(padding, padding);

    // Load topic features ...
    const featuresModel = model.getFeatures();

    featuresModel.forEach((f) => {
      const icon = TopicFeatureFactory.createIcon(this, f, this.isReadOnly());

      const type = f.getType();
      const addRemoveAction = type === 'eicon' || type === 'icon';
      result.addIcon(icon, addRemoveAction && !this.isReadOnly());
    });

    return result;
  }

  addFeature(featureModel: FeatureModel): Icon {
    const iconGroup = this.getOrBuildIconGroup();
    this.closeEditors();

    // Update model ...
    const model = this.getModel();
    model.addFeature(featureModel);

    const result: Icon = TopicFeatureFactory.createIcon(this, featureModel, this.isReadOnly());
    const isIcon = featureModel.getType() === 'icon' || featureModel.getType() === 'eicon';
    iconGroup.addIcon(result, isIcon && !this.isReadOnly());

    this.redraw(this.getThemeVariant(), false);
    return result;
  }

  findFeatureById(id: number) {
    const model = this.getModel();
    return model.findFeatureById(id);
  }

  removeFeature(featureModel: FeatureModel): void {
    $assert(featureModel, 'featureModel could not be null');

    // Removing the icon from MODEL
    const model = this.getModel();
    model.removeFeature(featureModel);

    // Removing the icon from UI
    const iconGroup = this.getIconGroup();
    if (iconGroup) {
      iconGroup.removeIconByModel(featureModel);
    }
    this.redraw(this.getThemeVariant(), false);
  }

  addRelationship(relationship: Relationship) {
    this._relationships.push(relationship);
  }

  deleteRelationship(relationship: Relationship) {
    this._relationships = this._relationships.filter((r) => r !== relationship);
  }

  getRelationships(): Relationship[] {
    return this._relationships;
  }

  protected buildTextShape(readOnly: boolean): Text {
    const result = new Text();
    const family = this.getFontFamily();
    const size = this.getFontSize();
    const weight = this.getFontWeight();
    const style = this.getFontStyle();
    result.setFont(family, size, style, weight);

    // Note: Font color will be set later in redraw() method with proper variant
    // const color = this.getFontColor();
    // result.setColor(color);

    if (!readOnly) {
      // Propagate mouse events ...
      if (!this.isCentralTopic()) {
        result.setCursor('move');
      } else {
        result.setCursor('default');
      }
    }

    return result;
  }

  setFontFamily(value: string | undefined): void {
    const model = this.getModel();
    model.setFontFamily(value);

    this.redraw(this.getThemeVariant(), true);
  }

  setFontSize(value: number): void {
    const model = this.getModel();
    model.setFontSize(value);

    this.redraw(this.getThemeVariant(), true);
  }

  setFontStyle(value: FontStyleType): void {
    const model = this.getModel();
    model.setFontStyle(value);

    this.redraw(this.getThemeVariant(), true);
  }

  setFontWeight(value: FontWeightType): void {
    const model = this.getModel();
    model.setFontWeight(value);

    this.redraw(this.getThemeVariant(), true);
  }

  getFontWeight(): FontWeightType {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());
    return theme.getFontWeight(this);
  }

  getFontFamily(): string {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());
    return theme.getFontFamily(this);
  }

  getFontColor(variant: ThemeVariant): string {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, variant);
    return theme.getFontColor(this);
  }

  getFontStyle(): FontStyleType {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());
    return theme.getFontStyle(this);
  }

  getFontSize(): number {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());
    return theme.getFontSize(this);
  }

  getImageEmojiChar(): string | undefined {
    return this._imageEmojiFeature.getEmojiChar();
  }

  setImageEmojiChar(imageEmojiChar: string | undefined): void {
    // Set emoji on topic
    this._imageEmojiFeature.setEmojiChar(imageEmojiChar);

    // Enforce mutual exclusivity: if emoji is set, clear gallery icon
    if (imageEmojiChar) {
      this._imageSVGFeature.setGalleryIconName(undefined);
    }
  }

  getImageGalleryIconName(): string | undefined {
    return this._imageSVGFeature.getGalleryIconName();
  }

  setImageGalleryIconName(imageGalleryIconName: string | undefined): void {
    // Set gallery icon on topic
    this._imageSVGFeature.setGalleryIconName(imageGalleryIconName);

    // Enforce mutual exclusivity: if gallery icon is set, clear emoji
    if (imageGalleryIconName) {
      this._imageEmojiFeature.setEmojiChar(undefined);
    }
  }

  setFontColor(value: string | undefined) {
    const model = this.getModel();
    model.setFontColor(value);

    this.redraw(this.getThemeVariant(), false);
  }

  setText(text: string | undefined): void {
    // Avoid empty nodes ...
    const modelText = !text || text.trim().length === 0 ? undefined : text;

    const model = this.getModel();
    model.setText(modelText);

    this.redraw(this.getThemeVariant(), true);
  }

  getText(): string {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, this.getThemeVariant());

    const text = model.getText();
    return text || theme.getText(this);
  }

  setBackgroundColor(color: string | undefined): void {
    const model = this.getModel();
    model.setBackgroundColor(color);

    this.redraw(this.getThemeVariant(), true);
  }

  setConnectionStyle(type: LineType): void {
    const model = this.getModel();
    model.setConnectionStyle(type);

    this.redraw(this.getThemeVariant(), true);
  }

  setConnectionColor(value: string | undefined): void {
    const model = this.getModel();
    model.setConnectionColor(value);

    this.redraw(this.getThemeVariant(), true);
  }

  getBackgroundColor(variant: ThemeVariant): string {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, variant);
    return theme.getBackgroundColor(this);
  }

  setBorderColor(color: string | undefined): void {
    const model = this.getModel();
    model.setBorderColor(color);

    this.redraw(this.getThemeVariant(), true);
  }

  getBorderColor(variant: ThemeVariant): string {
    const model = this.getModel();
    const theme = ThemeFactory.create(model, variant);
    return theme.getBorderColor(this);
  }

  setBorderStyle(style: string | undefined): void {
    const model = this.getModel();
    model.setBorderStyle(style);

    this.redraw(this.getThemeVariant(), true);
  }

  getBorderStyle(): string | undefined {
    const model = this.getModel();
    return model.getBorderStyle();
  }

  private buildTopicShape(): void {
    const groupAttributes = {
      width: 100,
      height: 100,
      coordSizeWidth: 100,
      coordSizeHeight: 100,
    };
    const group = new Group(groupAttributes);
    this._set2DElement(group);

    // Shape must be build based on the model width ...
    const outerShape = this.getOuterShape();
    const innerShape = this.getInnerShape();
    const textShape = this.getOrBuildTextShape();
    // Add to the group ...
    group.append(outerShape);
    innerShape.appendTo(group);
    group.append(textShape);

    // Add emoji text shape if it exists
    this._imageEmojiFeature.addToGroup(group);

    // Update figure size ...
    const model = this.getModel();
    if (model.getFeatures().length !== 0) {
      this.getOrBuildIconGroup();
    }

    const shrinkConnector = this.getShrinkConnector();
    if (shrinkConnector) {
      shrinkConnector.addToWorkspace(group);
    }

    // Register listeners ...
    this.registerDefaultListenersToElement(group, this);

    // Set test id
    group.setTestId(String(model.getId()));
  }

  private registerDefaultListenersToElement(elem: ElementClass<ElementPeer>, topic: Topic) {
    const mouseOver = function mouseOver() {
      if (topic.isMouseEventsEnabled()) {
        topic.handleMouseOver();
      }
    };
    elem.addEvent('mouseover', mouseOver);

    const outout = function outout() {
      if (topic.isMouseEventsEnabled()) {
        topic.handleMouseOut();
      }
    };
    elem.addEvent('mouseout', outout);

    const me = this;
    // Focus events ...
    elem.addEvent('mousedown', (event: MouseEvent) => {
      const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if (!me.isReadOnly()) {
        // Disable topic selection of readOnly mode ...
        let value = true;
        if ((event.metaKey && isMac) || (event.ctrlKey && !isMac)) {
          value = !me.isOnFocus();
          event.stopPropagation();
          event.preventDefault();
        }
        topic.setOnFocus(value);
      }

      const eventDispatcher = me._getTopicEventDispatcher();
      eventDispatcher.process('clicknode', me);
      event.stopPropagation();
    });
  }

  setOnFocus(focus: boolean) {
    if (this.isOnFocus() !== focus) {
      const theme = ThemeFactory.create(this.getModel(), this.getThemeVariant());
      this._onFocus = focus;
      const outerShape = this.getOuterShape();

      const fillColor = theme.getOuterBackgroundColor(this, focus);
      const borderColor = theme.getOuterBorderColor(this);

      outerShape.setFill(fillColor);
      outerShape.setStroke(1, 'solid', borderColor);
      outerShape.setOpacity(focus ? 1 : 0);

      this.setCursor('move');

      // In any case, always try to hide the editor ...
      this.closeEditors();

      // Fire event ...
      this.fireEvent(focus ? 'ontfocus' : 'ontblur', this);
    }
  }

  areChildrenShrunken(): boolean {
    const model = this.getModel();
    return model.areChildrenShrunken() && !this.isCentralTopic();
  }

  isCollapsed(): boolean {
    let result = false;

    let current = this.getParent();
    while (current && !result) {
      result = current.areChildrenShrunken();
      current = current.getParent();
    }
    return result;
  }

  setChildrenShrunken(value: boolean): void {
    // Update Model ...
    const model = this.getModel();
    model.setChildrenShrunken(value);

    // Change render base on the state.
    const shrinkConnector = this.getShrinkConnector();
    if (shrinkConnector) {
      shrinkConnector.changeRender(value);
    }

    // Update relationship positions when collapsing/expanding
    this._relationships.forEach((r) => r.redraw());

    // Do some fancy animation ....
    const elements = this.flatten2DElements(this);
    elements.forEach((elem) => {
      elem.setVisibility(!value, 250);
    });

    LayoutEventBus.fireEvent('childShrinked', model);
  }

  getShrinkConnector(): ShirinkConnector | null {
    let result = this._connector;
    if (!this._connector) {
      this._connector = new ShirinkConnector(this);
      this._connector.setVisibility(false);
      result = this._connector;
    }
    return result;
  }

  handleMouseOver(): void {
    const outerShape = this.getOuterShape();
    outerShape.setOpacity(1);
  }

  handleMouseOut(): void {
    const outerShape = this.getOuterShape();
    if (!this.isOnFocus()) {
      outerShape.setOpacity(0);
    }
  }

  showTextEditor(text: string) {
    this._getTopicEventDispatcher().show(this, text);
  }

  getNoteValue(): string | null {
    const model = this.getModel();
    const notes = model.findFeatureByType('note');

    let result: string | null = null;
    if (notes.length > 0) {
      result = (notes[0] as NoteModel).getText();
    }

    return result;
  }

  setNoteValue(value: string | undefined): void {
    const topicId = this.getId();
    const model = this.getModel();
    const dispatcher = ActionDispatcher.getInstance();
    const notes = model.findFeatureByType('note');

    if (!$defined(value) && notes.length > 0) {
      const featureId = notes[0].getId();
      dispatcher.removeFeatureFromTopic(topicId, featureId);
    } else if (notes.length > 0) {
      dispatcher.changeFeatureToTopic(topicId, notes[0].getId(), {
        text: value,
        contentType: 'html', // Rich text editor always saves HTML
      });
    } else {
      dispatcher.addFeatureToTopic([topicId], 'note', {
        text: value,
        contentType: 'html', // Rich text editor always saves HTML
      });
    }
  }

  getLinkValue(): string {
    const model = this.getModel();
    // @param {mindplot.model.LinkModel[]} links
    const links = model.findFeatureByType('link');
    let result;
    if (links.length > 0) {
      result = (links[0] as LinkModel).getUrl();
    }

    return result;
  }

  setLinkValue(value: string | undefined) {
    const topicId = this.getId();
    const model = this.getModel();
    const dispatcher = ActionDispatcher.getInstance();
    const links = model.findFeatureByType('link');

    if (!$defined(value)) {
      const featureId = links[0].getId();
      dispatcher.removeFeatureFromTopic(topicId, featureId);
    } else if (links.length > 0) {
      dispatcher.changeFeatureToTopic(topicId, links[0].getId(), {
        url: value,
      });
    } else {
      dispatcher.addFeatureToTopic([topicId], 'link', {
        url: value,
      });
    }
  }

  closeEditors() {
    this._getTopicEventDispatcher().close(true);
  }

  private _getTopicEventDispatcher() {
    return TopicEventDispatcher.getInstance();
  }

  /**
   * Point: references the center of the rect shape.!!!
   */
  setPosition(point: PositionType): void {
    // allowed param reassign to avoid risks of existing code relying in this side-effect
    const model = this.getModel();
    model.setPosition(point.x, point.y);

    // Elements are positioned in the center.
    // All topic element must be positioned based on the innerShape.
    const size = this.getSize();

    const cx = point.x - size.width / 2;
    const cy = point.y - size.height / 2;

    // Update visual position.
    this.get2DElement().setPosition(cx, cy);

    // Update connection lines ...
    this.updateConnection();

    // Check object state.
    this.invariant();
  }

  getOutgoingLine(): ConnectionLine | null {
    return this._outgoingLine;
  }

  getIncomingLines(): ConnectionLine[] {
    const children = this.getChildren();
    return children
      .filter((node) => $defined(node.getOutgoingLine()))
      .map((node) => node.getOutgoingLine()!);
  }

  getOutgoingConnectedTopic(): Topic | null {
    let result: Topic | null = null;
    const line = this.getOutgoingLine();
    if (line) {
      result = line.getTargetTopic();
    }
    return result;
  }

  setBranchVisibility(value: boolean): void {
    let current: Topic = this;
    let parent: Topic | null = this;
    while (parent && !parent.isCentralTopic()) {
      current = parent;
      parent = current.getParent();
    }
    current.setVisibility(value);
  }

  setVisibility(value: boolean, fade = 0): void {
    this.setTopicVisibility(value, fade);

    // Hide all children...
    this._setChildrenVisibility(value, fade);

    // If there there are connection to the node, topic must be hidden.
    this.setRelationshipLinesVisibility(value, fade);

    // If it's connected, the connection must be rendered.
    const outgoingLine = this.getOutgoingLine();
    if (outgoingLine) {
      outgoingLine.setVisibility(value, fade);
    }
  }

  protected moveToBack(): void {
    // Update relationship lines
    this._relationships.forEach((r) => r.moveToBack());

    const connector = this.getShrinkConnector();
    if (connector) {
      connector.moveToBack();
    }

    this.get2DElement().moveToBack();
  }

  protected moveToFront(): void {
    this.get2DElement().moveToFront();
    const connector = this.getShrinkConnector();
    if (connector) {
      connector.moveToFront();
    }
    // Update relationship lines
    this._relationships.forEach((r) => r.moveToFront());
  }

  isVisible(): boolean {
    const elem = this.get2DElement();
    return elem.isVisible();
  }

  private setRelationshipLinesVisibility(value: boolean, fade = 0): void {
    this._relationships.forEach((relationship) => {
      const sourceTopic = relationship.getSourceTopic();
      const targetTopic = relationship.getTargetTopic();

      const targetParent = targetTopic.getModel().getParent();
      const sourceParent = sourceTopic.getModel().getParent();
      relationship.setVisibility(
        value &&
          (!targetParent || !targetParent.areChildrenShrunken()) &&
          (!sourceParent || !sourceParent.areChildrenShrunken()),
        fade,
      );
    });
  }

  private setTopicVisibility(value: boolean, fade = 0) {
    const elem = this.get2DElement();
    elem.setVisibility(value, fade);

    if (this.getIncomingLines().length > 0) {
      const connector = this.getShrinkConnector();
      if (connector) {
        connector.setVisibility(value, fade);
      }
    }

    // Hide inner shape ...
    this.getInnerShape().setVisibility(value, fade);

    // Hide text shape ...
    const textShape = this.getOrBuildTextShape();
    textShape.setVisibility(this.getShapeType() !== 'image' ? value : false, fade);

    // Hide emoji text shape ...
    this._imageEmojiFeature.setVisibility(value, fade);
  }

  setOpacity(opacity: number): void {
    const elem = this.get2DElement();
    elem.setOpacity(opacity);

    const connector = this.getShrinkConnector();
    if (connector) {
      connector.setOpacity(opacity);
    }
    const textShape = this.getOrBuildTextShape();
    textShape.setOpacity(opacity);

    this._imageEmojiFeature.setOpacity(opacity);
  }

  private _setChildrenVisibility(value: boolean, fade = 0) {
    // Hide all children.
    const children = this.getChildren();
    const model = this.getModel();

    const visibility = value ? !model.areChildrenShrunken() : value;
    children.forEach((child) => {
      child.setVisibility(visibility, fade);

      const outgoingLine = child.getOutgoingLine();
      outgoingLine?.setVisibility(visibility);
    });
  }

  /** */
  invariant() {
    const line = this._outgoingLine;
    const model = this.getModel();
    const isConnected = model.isConnected();

    // Check consistency...
    if ((isConnected && !line) || (!isConnected && line)) {
      // $assert(false,'Illegal state exception.');
    }
  }

  setSize(size: SizeType, force?: boolean): void {
    const roundedSize = {
      width: Math.ceil(size.width),
      height: Math.ceil(size.height),
    };

    const oldSize = this.getSize();
    const hasSizeChanged =
      oldSize.width !== roundedSize.width || oldSize.height !== roundedSize.height;
    if (hasSizeChanged || force) {
      super.setSize(size);

      const outerShape = this.getOuterShape();
      const innerShape = this.getInnerShape();
      outerShape.setSize(size.width + 6, size.height + 6);
      innerShape.setSize(size.width, size.height);

      // Update the figure position(ej: central topic must be centered) and children position.
      this.updatePositionOnChangeSize(oldSize, size);

      if (hasSizeChanged) {
        LayoutEventBus.fireEvent('topicResize', {
          node: this.getModel(),
          size,
        });
      }
    }
  }

  disconnect(workspace: Canvas): void {
    const outgoingLine = this.getOutgoingLine();
    if (outgoingLine) {
      $assert(workspace, 'workspace can not be null');

      this._outgoingLine = null;

      // Disconnect nodes ...
      const targetTopic = outgoingLine.getTargetTopic();
      targetTopic.removeChild(this);

      // Update model ...
      const childModel = this.getModel();
      childModel.disconnect();
      this._parent = null;

      // Remove graphical element from the workspace...
      outgoingLine.removeFromWorkspace(workspace);

      // Hide connection line?.
      if (targetTopic.getChildren().length === 0) {
        const connector = targetTopic.getShrinkConnector();
        if (connector) {
          connector.setVisibility(false);
        }
      }

      // Remove from workspace.
      LayoutEventBus.fireEvent('topicDisconect', this.getModel());

      this.redraw(this.getThemeVariant(), true);
    }
  }

  getOrder(): number | undefined {
    const model = this.getModel();
    return model.getOrder();
  }

  setOrder(value: number): void {
    const changed = this.getModel().getOrder() !== value;
    const model = this.getModel();
    model.setOrder(value);

    if (changed) {
      this.redraw(this.getThemeVariant(), false);
    }
  }

  connectTo(targetTopic: Topic, canvas: Canvas): void {
    // Connect Graphical Nodes ...
    targetTopic.append(this);
    this._parent = targetTopic;

    // Update model ...
    const targetModel = targetTopic.getModel();
    const childModel = this.getModel();
    childModel.connectTo(targetModel);

    // Create a connection line ...
    const outgoingLine = this.createConnectionLine(targetTopic);

    this._outgoingLine = outgoingLine;
    canvas.append(outgoingLine);

    // Display connection node...
    const connector = targetTopic.getShrinkConnector();
    if (connector) {
      connector.setVisibility(true);
    }

    // Fire connection event ...
    if (this._isInWorkspace) {
      LayoutEventBus.fireEvent('topicConnected', {
        parentNode: targetTopic.getModel(),
        childNode: this.getModel(),
      });

      // Hack for the case of first node created, it needs to review the positioning problem.
      LayoutEventBus.fireEvent('forceLayout');
      this.redraw(this.getThemeVariant(), false);
    }
  }

  private createConnectionLine(targetTopic: Topic): ConnectionLine {
    const type: LineType = targetTopic.getConnectionStyle();
    return new ConnectionLine(this, targetTopic, type);
  }

  append(child: Topic): void {
    const children = this.getChildren();
    children.push(child);
  }

  removeChild(child: Topic): void {
    const children = this.getChildren();
    this._children = children.filter((c) => c !== child);
  }

  getChildren(): Topic[] {
    let result = this._children;
    if (!$defined(result)) {
      this._children = [];
      result = this._children;
    }
    return result;
  }

  removeFromWorkspace(workspace: Canvas): void {
    const elem2d = this.get2DElement();
    workspace.removeChild(elem2d);
    const line = this.getOutgoingLine();
    if (line) {
      workspace.removeChild(line);
    }
    this._isInWorkspace = false;
    LayoutEventBus.fireEvent('topicRemoved', this.getModel());
  }

  addToWorkspace(workspace: Canvas): void {
    const elem = this.get2DElement();
    workspace.append(elem);
    if (!this._isInWorkspace) {
      if (!this.isCentralTopic()) {
        LayoutEventBus.fireEvent('topicAdded', this.getModel());
      }

      const outgoingTopic = this.getOutgoingConnectedTopic();
      if (this.getModel().isConnected() && outgoingTopic) {
        LayoutEventBus.fireEvent('topicConnected', {
          parentNode: outgoingTopic.getModel(),
          childNode: this.getModel(),
        });
      }
    }
    this._isInWorkspace = true;
    this.redraw(this.getThemeVariant(), false);
  }

  createDragNode(layoutManager: LayoutManager): DragTopic {
    const result = super.createDragNode(layoutManager);

    // Is the node already connected ?
    const targetTopic = this.getOutgoingConnectedTopic();
    if (targetTopic) {
      result.connectTo(targetTopic);
      result.setVisibility(false);
    }

    // If a drag node is create for it, let's hide the editor.
    this._getTopicEventDispatcher().close(false);

    return result;
  }

  private updateConnection(): boolean {
    let result = false;
    if (this._isInWorkspace) {
      if (this._outgoingLine) {
        // Has the style change ?
        const connStyleChanged =
          this._outgoingLine.getLineType() !== this.getParent()!.getConnectionStyle();

        if (connStyleChanged) {
          const workspace = designer.getWorkSpace();
          this._outgoingLine.removeFromWorkspace(workspace);

          const targetTopic = this.getOutgoingConnectedTopic()!;
          this._outgoingLine = this.createConnectionLine(targetTopic);
          this._outgoingLine.setVisibility(this.isVisible());

          workspace.append(this._outgoingLine);

          if (!this.areChildrenShrunken()) {
            const incomingLines = this.getIncomingLines();
            incomingLines.forEach((line) => line.redraw());
          }
          result = true;
        }

        // Force the repaint in case that the main topic color has changed.
        const borderColor = this.getBorderColor(this.getThemeVariant());
        this._connector!.setColor(borderColor);

        this._outgoingLine.redraw();
      }
    }
    return result;
  }

  redraw(variant: ThemeVariant, redrawChildren = false): void {
    if (this._isInWorkspace) {
      const theme = ThemeFactory.create(this.getModel(), variant);
      const textShape = this.getOrBuildTextShape();

      // Update shape ...
      const shapeChanged = this.updateTopicShape();

      // Update font ...
      const fontColor = this.getFontColor(variant);
      textShape.setColor(fontColor);

      const fontSize = this.getFontSize();
      textShape.setFontSize(fontSize);

      const fontWeight = this.getFontWeight();
      // Map theme weight '600' to a concrete weight for rendering
      const web2dWeight = fontWeight === '600' ? 'bold' : fontWeight;
      textShape.setWeight(web2dWeight as 'normal' | 'bold');

      const fontStyle = this.getFontStyle();
      textShape.setStyle(fontStyle);

      const fontFamily = this.getFontFamily();
      textShape.setFontName(fontFamily);

      const text = this.getText();
      textShape.setText(text);

      // Update outer shape style ...
      const outerShape = this.getOuterShape();
      const outerFillColor = theme.getOuterBackgroundColor(this, this.isOnFocus());
      const outerBorderColor = theme.getOuterBorderColor(this);

      outerShape.setFill(outerFillColor);
      outerShape.setStroke(1, 'solid', outerBorderColor);

      // Calculate topic size and adjust elements ...
      const textWidth = textShape.getShapeWidth();
      const textHeight = textShape.getShapeHeight();
      const padding = theme.getInnerPadding(this);

      // Adjust icons group based on the font size ...
      const iconGroup = this.getOrBuildIconGroup();
      const fontHeight = textShape.getFontHeight();
      const iconHeight = ICON_SCALING_FACTOR * fontHeight;
      iconGroup.seIconSize(iconHeight, iconHeight);

      // Calculate size and adjust ...
      let topicHeight = textHeight + padding * 2;
      let topicWith = textWidth + padding * 2;
      let iconGroupWith = 0;
      let textIconSpacing = 0;

      // Default horizontal layout
      textIconSpacing = fontHeight / 50;
      iconGroupWith = iconGroup.getSize().width;
      topicWith = iconGroupWith + 2 * textIconSpacing + textWidth + padding * 2;

      // Handle emoji and SVG features - both appear on top of any shape
      const hasEmoji = this._imageEmojiFeature.hasEmoji();
      const hasSVG = this._imageSVGFeature.hasSVG();
      let emojiHeight = 0;
      let svgHeight = 0;

      // Ensure emoji text is added to the group if it exists
      if (hasEmoji) {
        const group = this.get2DElement();
        // Add emoji text to group (append is safe to call multiple times)
        this._imageEmojiFeature.addToGroup(group);
      }

      // Ensure SVG element is added to the group if it exists
      if (hasSVG) {
        const group = this.get2DElement();
        // Add SVG element to group (append is safe to call multiple times)
        this._imageSVGFeature.addToGroup(group);
        // Update SVG icon color to match current font color
        this._imageSVGFeature.updateIconColor();
      }

      if (hasEmoji) {
        // Calculate emoji dimensions and adjust topic size
        const emojiDimensions = this._imageEmojiFeature.calculateEmojiDimensions();
        emojiHeight = emojiDimensions.height;

        // Adjust topic size to accommodate emoji
        const sizeAdjustments = this._imageEmojiFeature.calculateTopicSizeAdjustments(
          topicWith,
          topicHeight,
          textHeight,
          padding,
        );
        topicWith = sizeAdjustments.width;
        topicHeight = sizeAdjustments.height;
      } else if (hasSVG) {
        // Calculate SVG dimensions and adjust topic size
        const svgDimensions = this._imageSVGFeature.calculateSVGDimensions();
        svgHeight = svgDimensions.height;

        // Adjust topic size to accommodate SVG
        const sizeAdjustments = this._imageSVGFeature.calculateTopicSizeAdjustments(
          topicWith,
          topicHeight,
          textHeight,
          padding,
        );
        topicWith = sizeAdjustments.width;
        topicHeight = sizeAdjustments.height;
      }

      // Update connections ...
      const connectionChanged = this.updateConnection();
      this.setSize({ width: topicWith, height: topicHeight }, connectionChanged);

      // Adjust all topic elements positions ...

      // Position elements based on whether emoji or SVG is present
      let positioning;
      if (hasEmoji) {
        positioning = this._imageEmojiFeature.positionEmojiAndAdjustText(
          topicWith,
          emojiHeight,
          textHeight,
          padding,
        );
      } else if (hasSVG) {
        positioning = this._imageSVGFeature.positionSVGAndAdjustText(
          topicWith,
          svgHeight,
          textHeight,
          padding,
        );
      } else {
        // Default positioning for shapes without emoji or SVG
        const yPosition = (topicHeight - textHeight) / 2;
        positioning = {
          textY: yPosition,
          iconY: yPosition - yPosition / 4,
        };
      }

      if (hasEmoji) {
        // Setup delete widget for emoji
        this._imageEmojiFeature.setupDeleteWidget();

        // Position text and icons
        textShape.setPosition(padding + iconGroupWith + textIconSpacing, positioning.textY);
        iconGroup.setPosition(padding, positioning.iconY);

        // Show emoji, but only show text if this specific topic is not being edited
        this._imageEmojiFeature.setVisibility(true);
        const isThisTopicBeingEdited = this._getTopicEventDispatcher().isEditingTopic(this);
        textShape.setVisibility(!isThisTopicBeingEdited);
      } else if (hasSVG) {
        // Setup delete widget for SVG
        this._imageSVGFeature.buildRemoveTip();

        // Position text and icons
        textShape.setPosition(padding + iconGroupWith + textIconSpacing, positioning.textY);
        iconGroup.setPosition(padding, positioning.iconY);

        // Show SVG, but only show text if this specific topic is not being edited
        const isThisTopicBeingEdited = this._getTopicEventDispatcher().isEditingTopic(this);
        textShape.setVisibility(!isThisTopicBeingEdited);
      } else {
        // Default positioning for shapes without emoji or SVG
        // Only show text if this specific topic is not being edited
        const isThisTopicBeingEdited = this._getTopicEventDispatcher().isEditingTopic(this);
        textShape.setVisibility(!isThisTopicBeingEdited);
        iconGroup.setPosition(padding, positioning.iconY);
        textShape.setPosition(padding + iconGroupWith + textIconSpacing, positioning.textY);
      }

      // Update relationship lines
      this._relationships.forEach((r) => r.redraw());

      // Update topic color ...
      const innerShape = this.getInnerShape();
      const borderColor = this.getBorderColor(variant);
      const borderStyle = this.getBorderStyle() || 'solid';
      const strokeStyle = this.getStrokeStyle(borderStyle);
      innerShape.setStroke(null, strokeStyle, borderColor);

      const bgColor = this.getBackgroundColor(variant);
      innerShape.setFill(bgColor);

      if ((redrawChildren || shapeChanged || connectionChanged) && !this.areChildrenShrunken()) {
        this.getChildren().forEach((t) => t.redraw(variant, true));
      }
    }
  }

  private flatten2DElements(topic: Topic): (Topic | Relationship | ConnectionLine)[] {
    const result: (Topic | Relationship | ConnectionLine)[] = [];
    const children = topic.getChildren();
    children.forEach((child) => {
      result.push(child);
      const line = child.getOutgoingLine();
      if (line) {
        result.push(line);
      }
      const relationships = child.getRelationships();
      result.push(...relationships);

      if (!child.areChildrenShrunken()) {
        const innerChilds = this.flatten2DElements(child);
        result.push(...innerChilds);
      }
    });
    return result;
  }

  isChildTopic(childTopic: Topic): boolean {
    let result = this.getId() === childTopic.getId();
    if (!result) {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const parent = children[i];
        result = parent.isChildTopic(childTopic);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  private getStrokeStyle(borderStyle: string | null): string | null {
    if (!borderStyle) return null;

    switch (borderStyle) {
      case 'solid':
        return 'solid';
      case 'dashed':
        return 'dash';
      case 'dotted':
        return 'dot';
      default:
        return 'solid';
    }
  }

  abstract workoutOutgoingConnectionPoint(position: PositionType): PositionType;

  abstract workoutIncomingConnectionPoint(position: PositionType): PositionType;

  protected abstract updatePositionOnChangeSize(oldSize: SizeType, roundedSize: SizeType): void;
}

export default Topic;
