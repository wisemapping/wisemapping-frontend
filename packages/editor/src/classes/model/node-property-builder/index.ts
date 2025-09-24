import { Designer, Topic } from '@wisemapping/mindplot';
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
  private fontColorModel: NodeProperty<string | undefined> | undefined;
  private topicShapeModel: NodeProperty<TopicShapeType> | undefined;
  private topicIconModel: NodeProperty<string | undefined> | undefined;
  private connetionStyleModel: NodeProperty<LineType> | undefined;
  private connectionColoreModel: NodeProperty<string | undefined> | undefined;
  private noteModel: NodeProperty<string | undefined> | undefined;
  private linkModel: NodeProperty<string> | undefined;
  private imageEmojiCharModel: NodeProperty<string | undefined> | undefined;
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

  private getFontSize(): number {
    return this.selectedTopic().getFontSize();
  }

  private uniqueOrUndefined<T>(propertyGetter: (Topic: Topic) => T | undefined): T | undefined {
    const nodes = this.designer.getModel().filterSelectedTopics();
    return nodes.every((n) => propertyGetter(n) == nodes[0]) ? propertyGetter(nodes[0]) : undefined;
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
        getValue: (): string | undefined => this.selectedTopic().getBackgroundColor(),
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
        getValue: () => this.uniqueOrUndefined((node) => node.getBorderColor()),
        setValue: (hex: string | undefined) => this.designer.changeBorderColor(hex),
      };
      this.borderColorModel = result;
    }
    return result;
  }

  /**
   *
   * @returns model to get and set topic font color
   */
  getFontColorModel(): NodeProperty<string | undefined> {
    if (!this.fontColorModel)
      this.fontColorModel = {
        getValue: () => this.uniqueOrUndefined((node) => node.getFontColor()),
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

  getConnectionStyleModel(): NodeProperty<LineType> {
    if (!this.connetionStyleModel)
      this.connetionStyleModel = {
        getValue: () => this.selectedTopic()?.getConnectionStyle(),
        setValue: (value: LineType) => this.designer.changeConnectionStyle(value),
      };
    return this.connetionStyleModel;
  }

  getConnectionColorModel(): NodeProperty<string | undefined> {
    if (!this.connectionColoreModel)
      this.connectionColoreModel = {
        getValue: () => this.selectedTopic()?.getConnectionColor(),
        setValue: (value: string | undefined) => this.designer.changeConnectionColor(value),
      };
    return this.connectionColoreModel;
  }

  getTopicShapeModel(): NodeProperty<TopicShapeType> {
    if (!this.topicShapeModel)
      this.topicShapeModel = {
        getValue: () => this.uniqueOrUndefined((node) => node.getShapeType()) as TopicShapeType,
        setValue: (value: TopicShapeType) => this.designer.changeShapeType(value),
      };
    return this.topicShapeModel;
  }
}
export default NodePropertyBuilder;
