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

import { Designer, Topic } from '@wisemapping/mindplot';
import Relationship from '@wisemapping/mindplot/src/components/Relationship';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';
import NodeProperty from '../node-property';
import {
  SwitchValueDirection,
  getPreviousValue,
  fontSizes,
  getNextValue,
} from '../../../components/toolbar/ToolbarValueModelBuilder';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import ThemeType from '@wisemapping/mindplot/src/components/model/ThemeType';

class NodePropertyBuilder {
  designer: Designer;

  private fontSizeModel: NodeProperty<number> | undefined;
  private selectedTopicColorModel: NodeProperty<string | undefined> | undefined;
  private fontFamilyModel: NodeProperty<string | undefined> | undefined;
  private fontStyleModel: NodeProperty<string> | undefined;
  private borderColorModel: NodeProperty<string | undefined> | undefined;
  private borderStyleModel: NodeProperty<StrokeStyle | undefined> | undefined;
  private fontColorModel: NodeProperty<string | undefined> | undefined;
  private topicShapeModel: NodeProperty<TopicShapeType | undefined> | undefined;
  private topicIconModel: NodeProperty<string | undefined> | undefined;
  private connetionStyleModel: NodeProperty<LineType | undefined> | undefined;
  private connectionColoreModel: NodeProperty<string | undefined> | undefined;
  private relationshipStyleModel: NodeProperty<LineType> | undefined;
  private relationshipColorModel: NodeProperty<string | undefined> | undefined;
  private relationshipStrokeStyleModel: NodeProperty<StrokeStyle> | undefined;
  private relationshipEndArrowModel: NodeProperty<boolean> | undefined;
  private relationshipStartArrowModel: NodeProperty<boolean> | undefined;
  private noteModel: NodeProperty<string | undefined> | undefined;
  private linkModel: NodeProperty<string> | undefined;
  private imageEmojiCharModel: NodeProperty<string | undefined> | undefined;

  private imageGalleryIconNameModel: NodeProperty<string | undefined> | undefined;
  private _themeModel: NodeProperty<ThemeType> | undefined;

  constructor(designer: Designer) {
    this.designer = designer;
  }

  private selectedTopic(): Topic {
    const topic = this.designer.getModel().selectedTopic();
    if (!topic) {
      throw new Error('No selected topic');
    }
    return topic;
  }

  private selectedRelationship(): Relationship {
    const relationship = this.designer.getModel().selectedRelationship();
    if (!relationship) {
      throw new Error('No selected relationship');
    }
    return relationship;
  }

  private getFontSize(): number {
    return this.selectedTopic().getFontSize();
  }

  private uniqueOrUndefined<T>(propertyGetter: (Topic: Topic) => T | undefined): T | undefined {
    const nodes = this.designer.getModel().filterSelectedTopics();
    if (nodes.length === 0) return undefined;
    const firstValue = propertyGetter(nodes[0]);
    return nodes.every((n) => propertyGetter(n) === firstValue) ? firstValue : undefined;
  }

  /**
   *
   * @returns model to and switch font weigth
   */
  fontWeigthModel(): NodeProperty<string | undefined> {
    return {
      getValue: () => String(this.designer.getModel().selectedTopic()?.getFontWeight()),
      switchValue: () => this.designer.changeFontWeight(),
    };
  }

  /**
   *
   * @returns model to and switch font size in both directions. Font sizes used to iterate: [6, 8, 10, 15]
   */
  getFontSizeModel(): NodeProperty<number> {
    if (!this.fontSizeModel)
      this.fontSizeModel = {
        getValue: () => this.getFontSize(),
        switchValue: (direction?) => {
          let newValue;
          if (direction === SwitchValueDirection.down) {
            newValue = getPreviousValue(fontSizes, this.getFontSize());
          }
          if (direction === SwitchValueDirection.up) {
            newValue = getNextValue(fontSizes, this.getFontSize());
          }
          this.designer.changeFontSize(newValue);
        },
      };
    return this.fontSizeModel;
  }

  /**
   *
   * @returns model to get and set topic color
   */
  getSelectedTopicColorModel(): NodeProperty<string | undefined> {
    let result: NodeProperty<string | undefined> | undefined = this.selectedTopicColorModel;
    if (!result) {
      result = {
        getValue: (): string | undefined => {
          const variant = this.designer.getThemeVariant();
          return this.selectedTopic().getBackgroundColor(variant);
        },
        setValue: (color: string | undefined) => this.designer.changeBackgroundColor(color),
      };
      this.selectedTopicColorModel = result;
    }
    return result;
  }

  getLinkModel(): NodeProperty<string> {
    // const selected = this.selectedTopic();
    if (!this.linkModel)
      this.linkModel = {
        getValue: (): string => this.selectedTopic()?.getLinkValue(),
        setValue: (value: string) => {
          if (value && value.trim() !== '') {
            this.selectedTopic().setLinkValue(value);
          } else {
            this.selectedTopic().setLinkValue(undefined);
          }
        },
      };
    return this.linkModel;
  }

  getImageEmojiCharModel(): NodeProperty<string | undefined> {
    if (!this.imageEmojiCharModel)
      this.imageEmojiCharModel = {
        getValue: () => this.uniqueOrUndefined((node) => node.getImageEmojiChar()),
        setValue: (value: string | undefined) => this.designer.changeImageEmojiChar(value),
      };
    return this.imageEmojiCharModel;
  }

  getImageGalleryIconNameModel(): NodeProperty<string | undefined> {
    if (!this.imageGalleryIconNameModel)
      this.imageGalleryIconNameModel = {
        getValue: () => this.uniqueOrUndefined((node) => node.getImageGalleryIconName()),
        setValue: (value: string | undefined) => this.designer.changeImageGalleryIconName(value),
      };
    return this.imageGalleryIconNameModel;
  }

  getThemeModel(): NodeProperty<ThemeType> {
    // const selected = this.selectedTopic();
    if (!this._themeModel)
      this._themeModel = {
        getValue: (): ThemeType => this.designer.getMindmap().getTheme(),
        setValue: (value: ThemeType) => {
          this.designer.changeTheme(value);
        },
      };
    return this._themeModel;
  }

  /**
   *
   * @returns model to get and set topic border color
   */
  getColorBorderModel(): NodeProperty<string | undefined> {
    let result = this.borderColorModel;
    if (!result) {
      result = this.borderColorModel = {
        getValue: () => {
          const variant = this.designer.getThemeVariant();
          return this.uniqueOrUndefined((node) => node.getBorderColor(variant));
        },
        setValue: (hex: string | undefined) => this.designer.changeBorderColor(hex),
      };
      this.borderColorModel = result;
    }
    return result;
  }

  /**
   *
   * @returns model to get and set topic border style
   */
  getBorderStyleModel(): NodeProperty<StrokeStyle | undefined> {
    if (!this.borderStyleModel) {
      this.borderStyleModel = {
        getValue: () => {
          const styleString = this.uniqueOrUndefined((node) => node.getBorderStyle());
          // Convert string to StrokeStyle enum, return undefined if not set
          if (styleString === 'solid') return StrokeStyle.SOLID;
          if (styleString === 'dashed') return StrokeStyle.DASHED;
          if (styleString === 'dotted') return StrokeStyle.DOTTED;
          return undefined;
        },
        setValue: (style: StrokeStyle | undefined) => this.designer.changeBorderStyle(style),
      };
    }
    return this.borderStyleModel;
  }

  /**
   *
   * @returns model to get and set topic font color
   */
  getFontColorModel(): NodeProperty<string | undefined> {
    if (!this.fontColorModel)
      this.fontColorModel = {
        getValue: () => {
          const variant = this.designer.getThemeVariant();
          return this.uniqueOrUndefined((node) => node.getFontColor(variant));
        },
        setValue: (hex: string | undefined) => this.designer.changeFontColor(hex),
      };
    return this.fontColorModel;
  }

  getTopicIconModel(): NodeProperty<string | undefined> {
    if (!this.topicIconModel)
      this.topicIconModel = {
        getValue: () => undefined,
        setValue: (value: string | undefined) => {
          if (value) {
            const values = value.split(':');
            this.designer.addIconType(values[0] as 'image' | 'emoji', values[1]);
          }
        },
      };
    return this.topicIconModel;
  }

  /**
   *
   * @returns model to get and set topic note
   */
  getNoteModel(): NodeProperty<string | undefined> {
    if (!this.noteModel)
      this.noteModel = {
        getValue: (): string | undefined => {
          const value = this.selectedTopic().getNoteValue();
          return value ? value : undefined;
        },
        setValue: (value: string | undefined) => {
          const note = value && value.trim() !== '' ? value : undefined;
          this.selectedTopic().setNoteValue(note);
        },
      };
    return this.noteModel;
  }

  /**
   *
   * @returns model to get and set topic font family
   */
  getFontFamilyModel(): NodeProperty<string | undefined> {
    if (!this.fontFamilyModel)
      this.fontFamilyModel = {
        getValue: () => this.uniqueOrUndefined((node) => node.getFontFamily()),
        setValue: (value: string | undefined) => {
          if (value) {
            this.designer.changeFontFamily(value);
          }
        },
      };
    return this.fontFamilyModel;
  }

  /**
   *
   * @returns model to get and switch topic style
   */
  getFontStyleModel(): NodeProperty<string> {
    if (!this.fontStyleModel)
      this.fontStyleModel = {
        getValue: () => this.selectedTopic()?.getFontStyle(),
        switchValue: () => this.designer.changeFontStyle(),
      };
    return this.fontStyleModel;
  }

  getConnectionStyleModel(): NodeProperty<LineType | undefined> {
    if (!this.connetionStyleModel)
      this.connetionStyleModel = {
        getValue: () => {
          // Get the model's explicit connection style, not the theme-resolved one
          return this.selectedTopic()?.getModel().getConnectionStyle();
        },
        setValue: (value: LineType | undefined) => this.designer.changeConnectionStyle(value),
      };
    return this.connetionStyleModel;
  }

  getConnectionColorModel(): NodeProperty<string | undefined> {
    if (!this.connectionColoreModel)
      this.connectionColoreModel = {
        getValue: () => {
          const variant = this.designer.getThemeVariant();
          return this.selectedTopic()?.getConnectionColor(variant);
        },
        setValue: (value: string | undefined) => this.designer.changeConnectionColor(value),
      };
    return this.connectionColoreModel;
  }

  /**
   *
   * @returns model to get and set relationship line style
   */
  getRelationshipStyleModel(): NodeProperty<LineType> {
    if (!this.relationshipStyleModel)
      this.relationshipStyleModel = {
        getValue: () => this.selectedRelationship()?.getModel().getLineType(),
        setValue: (value: LineType) => this.designer.changeRelationshipStyle(value),
      };
    return this.relationshipStyleModel;
  }

  /**
   *
   * @returns model to get and set relationship color
   */
  getRelationshipColorModel(): NodeProperty<string | undefined> {
    if (!this.relationshipColorModel)
      this.relationshipColorModel = {
        getValue: () => this.selectedRelationship()?.getModel().getStrokeColor(),
        setValue: (value: string | undefined) => this.designer.changeRelationshipColor(value),
      };
    return this.relationshipColorModel;
  }

  /**
   *
   * @returns model to get and set relationship stroke style
   */
  getRelationshipStrokeStyleModel(): NodeProperty<StrokeStyle> {
    if (!this.relationshipStrokeStyleModel)
      this.relationshipStrokeStyleModel = {
        getValue: () => this.selectedRelationship()?.getModel().getStrokeStyle(),
        setValue: (value: StrokeStyle) => this.designer.changeRelationshipStrokeStyle(value),
      };
    return this.relationshipStrokeStyleModel;
  }

  /**
   *
   * @returns model to get and set relationship end arrow
   */
  getRelationshipEndArrowModel(): NodeProperty<boolean> {
    if (!this.relationshipEndArrowModel)
      this.relationshipEndArrowModel = {
        getValue: () => this.selectedRelationship()?.getModel().getEndArrow() || false,
        setValue: (value: boolean) => this.designer.changeRelationshipEndArrow(value),
      };
    return this.relationshipEndArrowModel;
  }

  /**
   *
   * @returns model to get and set relationship start arrow
   */
  getRelationshipStartArrowModel(): NodeProperty<boolean> {
    if (!this.relationshipStartArrowModel)
      this.relationshipStartArrowModel = {
        getValue: () => this.selectedRelationship()?.getModel().getStartArrow() || false,
        setValue: (value: boolean) => this.designer.changeRelationshipStartArrow(value),
      };
    return this.relationshipStartArrowModel;
  }

  getTopicShapeModel(): NodeProperty<TopicShapeType | undefined> {
    if (!this.topicShapeModel)
      this.topicShapeModel = {
        getValue: () => {
          // Get the model's explicit shape value, not the theme-resolved shape
          const shape = this.uniqueOrUndefined((node) => node.getModel().getShapeType());
          // Map 'none' to undefined for UI consistency
          return shape === 'none' ? undefined : shape;
        },
        setValue: (value: TopicShapeType | undefined) => this.designer.changeShapeType(value),
      };
    return this.topicShapeModel;
  }
}
export default NodePropertyBuilder;
