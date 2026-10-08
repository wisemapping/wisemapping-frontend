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
import { Text, Group, Rect } from '@wisemapping/web2d';
import type {
  StrokeStyle,
  FontWeightType as TextWeight,
  ElementClass,
  ElementPeer,
} from '@wisemapping/web2d';
import { $assert } from './util/assert';
import { hasShortcutModifier } from './util/platform';
import { markObjectTouch } from './util/objectTouch';

import type { NodeOption } from './NodeGraph';
import NodeGraph from './NodeGraph';
import TopicFeatureFactory from './TopicFeature';
import type { LineType } from './TopicConnection';
import TopicConnection from './TopicConnection';
import IconGroup from './IconGroup';
import ImageEmojiFeature from './ImageEmojiFeature';
import type { GalleryIconShape } from './ImageSVGFeature';
import ImageSVGFeature from './ImageSVGFeature';
import ShirinkConnector from './ShrinkConnector';
import type { CommandDispatcher } from './ActionDispatcher';
import ActionDispatcher from './ActionDispatcher';

import type TopicEventDispatcher from './TopicEventDispatcher';
import type { TopicShapeType } from './model/INodeModel';
import type NodeModel from './model/NodeModel';
import type Relationship from './Relationship';
import type Canvas from './Canvas';
import type LayoutManager from './layout/LayoutManager';
import type SizeType from './SizeType';
import type FeatureModel from './model/FeatureModel';
import type PositionType from './PositionType';
import type Icon from './Icon';
import type { FontStyleType } from './FontStyleType';
import type { FontWeightType } from './FontWeightType';
import { toTextWeight } from './FontWeightType';
import type DragTopic from './DragTopic';
import ThemeFactory from './theme/ThemeFactory';
import ThemeResolutionCache from './theme/ThemeResolutionCache';
import type { ThemeVariant } from './theme/Theme';
import type Theme from './theme/Theme';
import type TopicShape from './shape/TopicShape';
import TopicShapeFactory from './shape/TopicShapeFactory';
import type { OrientationType } from './layout/LayoutType';

const ICON_SCALING_FACTOR = 1.3;

/** The text values last applied to a topic text shape. */
type AppliedTextValues = {
  color?: string;
  size?: number;
  weight?: TextWeight;
  style?: FontStyleType;
  family?: string;
  text?: string;
};

type TopicCornerCoordinates = {
  topLeft: PositionType;
  topRight: PositionType;
  bottomLeft: PositionType;
  bottomRight: PositionType;
};

abstract class Topic extends NodeGraph {
  private _innerShape: TopicShape | null;

  private _relationships: Relationship[];

  private _isInWorkspace: boolean;

  /** The canvas the topic was added to. Each Designer has its own. */
  private _workspace: Canvas | null;

  private _children: Topic[];

  private _parent: Topic | null;

  private _outerShape: Rect | undefined;

  private _text: Text | undefined;

  private _imageEmojiFeature: ImageEmojiFeature;

  private _imageSVGFeature: ImageSVGFeature;

  private _iconsGroup!: IconGroup;

  private _connector!: ShirinkConnector;

  private _outgoingLine!: TopicConnection | null;

  private _themeVariant: ThemeVariant;

  private _orientation: OrientationType;

  private _topicEventDispatcher?: TopicEventDispatcher;

  // Values last applied to the text shape: a redraw skips the setters of unchanged ones,
  // as setting the text rebuilds its tspans. Only the topic sets them.
  private _appliedText: AppliedTextValues = {};

  // Font height measured by the redraw in progress, so the text is measured once per redraw.
  private _measuredFontHeight: number | undefined;

  constructor(
    model: NodeModel,
    options: NodeOption,
    themeVariant: ThemeVariant,
    orientation: OrientationType = 'horizontal',
  ) {
    super(model, options);
    this._children = [];
    this._parent = null;
    this._relationships = [];
    this._isInWorkspace = false;
    this._workspace = null;
    this._innerShape = null;
    this._themeVariant = themeVariant;
    this._orientation = orientation;
    this._topicEventDispatcher = options.topicEventDispatcher;
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
      const dispatcher = this._getTopicEventDispatcher();
      if (!dispatcher) {
        console.warn('TopicEventDispatcher not provided. Double click editing is disabled.');
      } else {
        dispatcher.show(this);
      }
      event.stopPropagation();
    });
  }

  setShapeType(type: TopicShapeType | undefined): void {
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

  getOrientation(): OrientationType {
    return this._orientation;
  }

  setOrientation(orientation: OrientationType): void {
    this._orientation = orientation;
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
    return this.resolveStyle('shapeType', this.getThemeVariant(), (theme) =>
      theme.getShapeType(this),
    );
  }

  getConnectionStyle(): LineType {
    return this.resolveStyle('connectionStyle', this.getThemeVariant(), (theme) =>
      theme.getConnectionType(this),
    );
  }

  getConnectionColor(variant: ThemeVariant): string {
    return this.resolveStyle('connectionColor', variant, (theme) => theme.getConnectionColor(this));
  }

  /**
   * Resolves a style of the topic with the theme of the given variant. During a redraw
   * pass, each style is resolved once (see ThemeResolutionCache).
   */
  private resolveStyle<T>(key: string, variant: ThemeVariant, resolve: (theme: Theme) => T): T {
    return ThemeResolutionCache.memo(this, `${key}:${variant}`, () =>
      resolve(ThemeFactory.create(this.getModel(), variant)),
    );
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

  /**
   * Returns the topic bounding box corners using native HTML page coordinates (CSS pixels).
   * Coordinates are relative to the document (viewport + scroll offset).
   */
  getAbsoluteCornerCoordinates(): TopicCornerCoordinates | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const nativeElement = this.get2DElement()?.getNode();
    if (!nativeElement || !nativeElement.isConnected) {
      return null;
    }

    const rect = nativeElement.getBoundingClientRect();
    const scrollLeft = window.scrollX !== undefined ? window.scrollX : (window.pageXOffset ?? 0);
    const scrollTop = window.scrollY !== undefined ? window.scrollY : (window.pageYOffset ?? 0);

    const left = rect.left + scrollLeft;
    const right = rect.right + scrollLeft;
    const top = rect.top + scrollTop;
    const bottom = rect.bottom + scrollTop;

    return {
      topLeft: { x: left, y: top },
      topRight: { x: right, y: top },
      bottomLeft: { x: left, y: bottom },
      bottomRight: { x: right, y: bottom },
    };
  }

  getOrBuildTextShape(): Text {
    if (!this._text) {
      this._text = this.buildTextShape(false);

      // @todo: Review this. Get should not modify the state ....
      const text = this.getText();
      this._text.setText(text);
      this._appliedText = { text };
    }

    return this._text;
  }

  /**
   * The height of a line of the topic text. During a redraw, it is the one the redraw
   * measured, so that the theme and the features do not measure the text again.
   */
  getTextFontHeight(): number {
    return this._measuredFontHeight ?? this.getOrBuildTextShape().getFontHeight();
  }

  getOrBuildImageEmojiTextShape(): Text | undefined {
    return this._imageEmojiFeature.getOrBuildEmojiTextShape();
  }

  getOrBuildImageSVGElement(): GalleryIconShape | undefined {
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

    const textHeight = this.getTextFontHeight();
    const iconSize = textHeight * ICON_SCALING_FACTOR;
    const result = new IconGroup(this.getId(), iconSize, this.getDesigner());
    const padding = theme.getInnerPadding(this);
    result.setPosition(padding, padding);

    // Load topic features ...
    const featuresModel = model.getFeatures();

    featuresModel.forEach((f) => {
      const icon = TopicFeatureFactory.createIcon(this, f, this.isReadOnly());

      const type = f.getType();
      const addRemoveAction =
        type === 'eicon' || type === 'icon' || type === 'note' || type === 'link';
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
    const featureType = featureModel.getType();
    const canRemove =
      featureType === 'icon' ||
      featureType === 'eicon' ||
      featureType === 'note' ||
      featureType === 'link';
    iconGroup.addIcon(result, canRemove && !this.isReadOnly());

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
    result.setFont(family, size, style, toTextWeight(weight));

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

  setFontSize(value: number | undefined): void {
    const model = this.getModel();
    model.setFontSize(value);

    this.redraw(this.getThemeVariant(), true);
  }

  setFontStyle(value: FontStyleType | undefined): void {
    const model = this.getModel();
    model.setFontStyle(value);

    this.redraw(this.getThemeVariant(), true);
  }

  setFontWeight(value: FontWeightType | undefined): void {
    const model = this.getModel();
    model.setFontWeight(value);

    this.redraw(this.getThemeVariant(), true);
  }

  getFontWeight(): FontWeightType {
    return this.resolveStyle('fontWeight', this.getThemeVariant(), (theme) =>
      theme.getFontWeight(this),
    );
  }

  getFontFamily(): string {
    return this.resolveStyle('fontFamily', this.getThemeVariant(), (theme) =>
      theme.getFontFamily(this),
    );
  }

  getFontColor(variant: ThemeVariant): string {
    return this.resolveStyle('fontColor', variant, (theme) => theme.getFontColor(this));
  }

  getFontStyle(): FontStyleType {
    return this.resolveStyle('fontStyle', this.getThemeVariant(), (theme) =>
      theme.getFontStyle(this),
    );
  }

  getFontSize(): number {
    return this.resolveStyle('fontSize', this.getThemeVariant(), (theme) =>
      theme.getFontSize(this),
    );
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

    // The text does not change how the descendants render, only where the lines that
    // meet this topic are drawn: redraw this topic and the descendants' connection
    // lines, as a redraw of the whole subtree did, but not the topics. Their
    // relationships follow them when the layout moves them (setPosition).
    this.redraw(this.getThemeVariant(), false);
    if (this._isInWorkspace) {
      this.redrawDescendantLines();
    }
  }

  /**
   * Redraws the connection lines of the visible descendants, in the order a redraw of
   * the subtree redraws them.
   */
  private redrawDescendantLines(): void {
    if (this.areChildrenShrunken()) {
      return;
    }
    this.getChildren().forEach((child) => {
      if (child._isInWorkspace) {
        if (child._workspace) {
          child.getOutgoingLine()?.redraw();
        }
        child.redrawDescendantLines();
      }
    });
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

  setConnectionStyle(type: LineType | undefined): void {
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
    return this.resolveStyle('backgroundColor', variant, (theme) => theme.getBackgroundColor(this));
  }

  setBorderColor(color: string | undefined): void {
    const model = this.getModel();
    model.setBorderColor(color);

    this.redraw(this.getThemeVariant(), true);
  }

  getBorderColor(variant: ThemeVariant): string {
    return this.resolveStyle('borderColor', variant, (theme) => theme.getBorderColor(this));
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
    elem.addEvent('mousedown', (event: Event) => {
      const mouseEvent = event as MouseEvent;
      if (!me.isReadOnly()) {
        // Disable topic selection of readOnly mode ...
        let value = true;
        if (hasShortcutModifier(mouseEvent)) {
          value = !me.isOnFocus();
          mouseEvent.stopPropagation();
          mouseEvent.preventDefault();
        }
        const designer = me.getDesigner();
        if (designer) {
          // The designer also unselects the other entities, and tells the editor once ...
          designer.selectOnClick(topic, value, mouseEvent);
        } else {
          topic.setOnFocus(value);
        }
      }

      const eventDispatcher = me._getTopicEventDispatcher();
      eventDispatcher?.process('clicknode', me);
      mouseEvent.stopPropagation();
    });
    // A tap selects through the mousedown the browser emulates for it, which the handler above
    // keeps from the canvas. The touch itself still reaches it, to pan on a swipe, but its release
    // must not be a click on the background ...
    elem.addEvent('touchstart', markObjectTouch);
  }

  setOnFocus(focus: boolean) {
    if (this.isOnFocus() !== focus) {
      const theme = ThemeFactory.create(this.getModel(), this.getThemeVariant());
      this._onFocus = focus;
      this.getDesigner()?.getModel().setTopicSelected(this, focus);
      const outerShape = this.getOuterShape();

      const fillColor = theme.getOuterBackgroundColor(this, focus);
      const borderColor = theme.getOuterBorderColor(this);

      outerShape.setFill(fillColor);
      outerShape.setStroke(1, 'solid', borderColor);
      outerShape.setOpacity(focus ? 1 : 0);

      this.setCursor('move');

      // In any case, always try to hide the editor ...
      this.closeEditors();

      // Fire topic-level event (for backward compatibility)
      this.fireEvent(focus ? 'ontfocus' : 'ontblur', this);

      // Fire LayoutEventBus event for global selection tracking (includes topic model/ID)
      if (focus) {
        this.getLayoutEventBus().fireEvent('topicSelected', this.getModel());
      } else {
        this.getLayoutEventBus().fireEvent('topicUnselected', this.getModel());
      }
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

    // When collapsing, unselect any selected descendant topics
    if (value) {
      const getAllDescendants = (topic: Topic): Topic[] => {
        const descendants: Topic[] = [];
        const children = topic.getChildren();
        children.forEach((child) => {
          descendants.push(child);
          descendants.push(...getAllDescendants(child));
        });
        return descendants;
      };

      const descendants = getAllDescendants(this);
      descendants.forEach((descendant) => {
        if (descendant.isOnFocus()) {
          // Unselect the topic - this will fire topicUnselected event
          descendant.setOnFocus(false);
        }
      });
    }

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

    this.getLayoutEventBus().fireEvent('childShrinked', model);
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
    const dispatcher = this._getTopicEventDispatcher();
    if (!dispatcher) {
      console.warn('TopicEventDispatcher not provided. showTextEditor skipped.');
      return;
    }
    dispatcher.show(this, text);
  }

  /**
   * The dispatcher of the topic's designer, which runs its commands on its own map and undo
   * stack. ActionDispatcher.getInstance() is the last designer built's: with two designers on a
   * page, the other map. A topic built without a designer falls back to it.
   */
  getActionDispatcher(): CommandDispatcher {
    return this.getDesigner()?.getActionDispatcher() ?? ActionDispatcher.getInstance();
  }

  getNoteValue(): string | null {
    const model = this.getModel();
    const [note] = model.findFeatureByType('note');
    return note ? note.getText() : null;
  }

  setNoteValue(value: string | undefined): void {
    const topicId = this.getId();
    const model = this.getModel();
    // Fetched only when there is something to dispatch: clearing a missing note needs none.
    const dispatcher = () => this.getActionDispatcher();
    const [note] = model.findFeatureByType('note');

    if (value == null) {
      // Nothing to clear when the topic has no note ...
      if (note) {
        dispatcher().removeFeatureFromTopic(topicId, note.getId());
      }
    } else if (note) {
      dispatcher().changeFeatureToTopic(topicId, note.getId(), {
        text: value,
        contentType: 'html', // Rich text editor always saves HTML
      });
    } else {
      dispatcher().addFeatureToTopic([topicId], 'note', {
        text: value,
        contentType: 'html', // Rich text editor always saves HTML
      });
    }
  }

  getLinkValue(): string | undefined {
    const model = this.getModel();
    // @param {mindplot.model.LinkModel[]} links
    const [link] = model.findFeatureByType('link');
    return link?.getUrl();
  }

  setLinkValue(value: string | undefined) {
    const topicId = this.getId();
    const model = this.getModel();
    // Fetched only when there is something to dispatch: clearing a missing link needs none.
    const dispatcher = () => this.getActionDispatcher();
    const [link] = model.findFeatureByType('link');

    if (value == null) {
      // Nothing to clear when the topic has no link ...
      if (link) {
        dispatcher().removeFeatureFromTopic(topicId, link.getId());
      }
    } else if (link) {
      dispatcher().changeFeatureToTopic(topicId, link.getId(), {
        url: value,
      });
    } else {
      dispatcher().addFeatureToTopic([topicId], 'link', {
        url: value,
      });
    }
  }

  closeEditors() {
    this._getTopicEventDispatcher()?.close(true);
  }

  private _getTopicEventDispatcher(): TopicEventDispatcher | undefined {
    return this._topicEventDispatcher;
  }

  /**
   * Point: references the center of the rect shape.!!!
   */
  setPosition(point: PositionType): void {
    // allowed param reassign to avoid risks of existing code relying in this side-effect
    const model = this.getModel();
    const previous = model.getPosition();
    const moved = !previous || previous.x !== point.x || previous.y !== point.y;
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

    // ... and the relationships attached to it, whose ends follow the topic.
    if (moved) {
      this._relationships.forEach((r) => r.redraw());
    }

    // Check object state.
    this.invariant();
  }

  getOutgoingLine(): TopicConnection | null {
    return this._outgoingLine;
  }

  getIncomingLines(): TopicConnection[] {
    const children = this.getChildren();
    return children
      .filter((node) => node.getOutgoingLine() != null)
      .map((node) => node.getOutgoingLine()!);
  }

  getOutgoingConnectedTopic(): Topic | null {
    let result: Topic | null = null;
    const line = this.getOutgoingLine();
    if (line) {
      result = line.getParentTopic();
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

  override setSize(size: SizeType, force?: boolean): void {
    // A failed measurement (NaN or infinite) would be seen as a change on every redraw
    // (NaN !== NaN): keep the previous size instead.
    const isMeasured = Number.isFinite(size.width) && Number.isFinite(size.height);
    if (!isMeasured && !force) {
      return;
    }
    const newSize = isMeasured ? size : this.getSize();

    const roundedSize = {
      width: Math.ceil(newSize.width),
      height: Math.ceil(newSize.height),
    };

    // Topics are re-centred on their model position and the layout manager, which owns
    // positions, moves them if needed.
    const oldSize = this.getSize();
    const hasSizeChanged =
      oldSize.width !== roundedSize.width || oldSize.height !== roundedSize.height;
    if (hasSizeChanged || force) {
      super.setSize(roundedSize);

      const outerShape = this.getOuterShape();
      const innerShape = this.getInnerShape();
      outerShape.setSize(roundedSize.width + 6, roundedSize.height + 6);
      innerShape.setSize(roundedSize.width, roundedSize.height);

      // Update the figure position(ej: central topic must be centered) and children position.
      this.updatePositionOnChangeSize();

      if (hasSizeChanged) {
        this.getLayoutEventBus().fireEvent('topicResize', {
          node: this.getModel(),
          size: roundedSize,
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
      const targetTopic = outgoingLine.getParentTopic();
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
      this.getLayoutEventBus().fireEvent('topicDisconect', this.getModel());

      this.redraw(this.getThemeVariant(), true);
    }
  }

  /**
   * Get the order of this topic among its siblings.
   * Returns undefined for topics without siblings (central topic, isolated topics).
   */
  getOrder(): number | undefined {
    const model = this.getModel();
    return model.getOrder();
  }

  /**
   * Set the order of this topic among its siblings.
   * Pass a number for topics with siblings, or undefined for isolated topics.
   */
  setOrder(value: number | undefined): void {
    const model = this.getModel();
    const changed = model.getOrder() !== value;
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
      this.getLayoutEventBus().fireEvent('topicConnected', {
        parentNode: targetTopic.getModel(),
        childNode: this.getModel(),
      });

      // Hack for the case of first node created, it needs to review the positioning problem.
      this.getLayoutEventBus().fireEvent('forceLayout');
      this.redraw(this.getThemeVariant(), false);
    }
  }

  private createConnectionLine(targetTopic: Topic): TopicConnection {
    const type: LineType = targetTopic.getConnectionStyle();
    return new TopicConnection(this, targetTopic, type);
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
    if (result == null) {
      this._children = [];
      result = this._children;
    }
    return result;
  }

  removeFromWorkspace(workspace: Canvas): void {
    // Unselect topic first (fires topicUnselected event)
    // This ensures topicUnselected fires before topicRemoved
    if (this.isOnFocus()) {
      this.setOnFocus(false);
    }

    const elem2d = this.get2DElement();
    workspace.removeChild(elem2d);
    const line = this.getOutgoingLine();
    if (line) {
      workspace.removeChild(line);
    }
    this._isInWorkspace = false;
    this._workspace = null;
    this.getLayoutEventBus().fireEvent('topicRemoved', this.getModel());
  }

  isInWorkspace(): boolean {
    return this._isInWorkspace;
  }

  addToWorkspace(workspace: Canvas): void {
    const elem = this.get2DElement();
    workspace.append(elem);
    if (!this._isInWorkspace) {
      if (!this.isCentralTopic()) {
        this.getLayoutEventBus().fireEvent('topicAdded', this.getModel());
      }

      const outgoingTopic = this.getOutgoingConnectedTopic();
      if (this.getModel().isConnected() && outgoingTopic) {
        this.getLayoutEventBus().fireEvent('topicConnected', {
          parentNode: outgoingTopic.getModel(),
          childNode: this.getModel(),
        });
      }
    }
    this._isInWorkspace = true;
    this._workspace = workspace;
    this.redraw(this.getThemeVariant(), false);
  }

  override createDragNode(layoutManager: LayoutManager): DragTopic {
    const result = super.createDragNode(layoutManager);

    // Is the node already connected ?
    const targetTopic = this.getOutgoingConnectedTopic();
    if (targetTopic) {
      result.connectTo(targetTopic);
      result.setVisibility(false);
    }

    // If a drag node is create for it, let's hide the editor.
    this._getTopicEventDispatcher()?.close(false);

    return result;
  }

  private updateConnection(): boolean {
    let result = false;
    const workspace = this._workspace;
    if (this._isInWorkspace && workspace) {
      if (this._outgoingLine) {
        // Has the style change ?
        const connStyleChanged =
          this._outgoingLine.getLineType() !== this.getParent()!.getConnectionStyle();

        if (connStyleChanged) {
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
        this._connector.setColor(borderColor);

        this._outgoingLine.redraw();
      }
    }
    return result;
  }

  redraw(variant: ThemeVariant, redrawChildren = false): void {
    // The styles are resolved once per topic for the whole pass, children included ...
    ThemeResolutionCache.run(() => this.redrawInPass(variant, redrawChildren));
  }

  private redrawInPass(variant: ThemeVariant, redrawChildren: boolean): void {
    if (this._isInWorkspace) {
      this._measuredFontHeight = undefined;
      const theme = ThemeFactory.create(this.getModel(), variant);
      const textShape = this.getOrBuildTextShape();

      // Update shape ...
      const shapeChanged = this.updateTopicShape();

      // Update font ...
      const fontColor = this.getFontColor(variant);
      const fontSize = this.getFontSize();
      const fontWeight = this.getFontWeight();
      const web2dWeight = toTextWeight(fontWeight);
      const fontStyle = this.getFontStyle();
      const fontFamily = this.getFontFamily();
      const text = this.getText();
      this.applyTextValues(textShape, {
        color: fontColor,
        size: fontSize,
        weight: web2dWeight,
        style: fontStyle,
        family: fontFamily,
        text,
      });

      // Update outer shape style ...
      const outerShape = this.getOuterShape();
      const outerFillColor = theme.getOuterBackgroundColor(this, this.isOnFocus());
      const outerBorderColor = theme.getOuterBorderColor(this);

      outerShape.setFill(outerFillColor);
      outerShape.setStroke(1, 'solid', outerBorderColor);

      // Calculate topic size and adjust elements. The text is measured once: the font
      // height is the height of one of its lines (Text.getFontHeight) ...
      const { width: textWidth, height: textHeight } = textShape.measure();
      const fontHeight = textHeight / textShape.getLineCount();
      this._measuredFontHeight = fontHeight;
      const padding = theme.getInnerPadding(this);

      // Adjust icons group based on the font size ...
      const iconGroup = this.getOrBuildIconGroup();
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
        const isThisTopicBeingEdited =
          this._getTopicEventDispatcher()?.isEditingTopic(this) ?? false;
        textShape.setVisibility(!isThisTopicBeingEdited);
      } else if (hasSVG) {
        // Setup delete widget for SVG
        this._imageSVGFeature.buildRemoveTip();

        // Position text and icons
        textShape.setPosition(padding + iconGroupWith + textIconSpacing, positioning.textY);
        iconGroup.setPosition(padding, positioning.iconY);

        // Show SVG, but only show text if this specific topic is not being edited
        const isThisTopicBeingEdited =
          this._getTopicEventDispatcher()?.isEditingTopic(this) ?? false;
        textShape.setVisibility(!isThisTopicBeingEdited);
      } else {
        // Default positioning for shapes without emoji or SVG
        // Only show text if this specific topic is not being edited
        const isThisTopicBeingEdited =
          this._getTopicEventDispatcher()?.isEditingTopic(this) ?? false;
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

      // The measurement is only valid until the text changes ...
      this._measuredFontHeight = undefined;

      if ((redrawChildren || shapeChanged || connectionChanged) && !this.areChildrenShrunken()) {
        this.getChildren().forEach((t) => t.redraw(variant, true));
      }
    }
  }

  /**
   * Applies the text values that changed since the last redraw, in the order the redraw
   * always set them. The text shape keeps the others.
   */
  private applyTextValues(textShape: Text, values: Required<AppliedTextValues>): void {
    const applied = this._appliedText;
    if (applied.color !== values.color) {
      textShape.setColor(values.color);
    }
    if (applied.size !== values.size) {
      textShape.setFontSize(values.size);
    }
    if (applied.weight !== values.weight) {
      textShape.setWeight(values.weight);
    }
    if (applied.style !== values.style) {
      textShape.setStyle(values.style);
    }
    if (applied.family !== values.family) {
      textShape.setFontName(values.family);
    }
    if (applied.text !== values.text) {
      textShape.setText(values.text);
    }
    this._appliedText = { ...values };
  }

  private flatten2DElements(topic: Topic): (Topic | Relationship | TopicConnection)[] {
    const result: (Topic | Relationship | TopicConnection)[] = [];
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
    return (
      this.getId() === childTopic.getId() ||
      this.getChildren().some((child) => child.isChildTopic(childTopic))
    );
  }

  private getStrokeStyle(borderStyle: string | null): StrokeStyle | null {
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

  protected abstract updatePositionOnChangeSize(): void;
}

export default Topic;
