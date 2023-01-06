import { Designer, Topic } from '@wisemapping/mindplot';
import NodeProperty from '../node-property';
import {
  getTheUniqueValueOrNull,
  SwitchValueDirection,
  getPreviousValue,
  fontSizes,
  getNextValue,
} from '../../../components/toolbar/ToolbarValueModelBuilder';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';

class NodePropertyBuilder {
  designer: Designer;

  private fontSizeModel: NodeProperty<number>;
  private selectedTopicColorModel: NodeProperty<string>;
  private fontFamilyModel: NodeProperty<string>;
  private fontStyleModel: NodeProperty<string>;
  private borderColorModel: NodeProperty<string>;
  private fontColorModel: NodeProperty<string>;
  private topicShapeModel: NodeProperty<TopicShapeType>;
  private topicIconModel: NodeProperty<string>;
  private connetionStyleModel: NodeProperty<LineType>;
  private connectionColoreModel: NodeProperty<string>;
  private noteModel: NodeProperty<string>;
  private linkModel: NodeProperty<string>;

  constructor(designer: Designer) {
    this.designer = designer;
  }

  private selectedTopic() {
    return this.designer.getModel().selectedTopic();
  }

  private getFontSize() {
    return this.designer.getModel().selectedTopic()?.getFontSize();
  }

  private uniqueOrNull(
    propertyGetter: (Topic: Topic) => string | number | null | LineType,
  ): string {
    const nodes = this.designer.getModel().filterSelectedTopics();
    return getTheUniqueValueOrNull(nodes, propertyGetter);
  }

  /**
   *
   * @returns model to and switch font weigth
   */
  fontWeigthModel(): NodeProperty<string> {
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
          let newValue = undefined;
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
    if (!this.selectedTopicColorModel)
      this.selectedTopicColorModel = {
        getValue: () => this.designer.getModel().selectedTopic()?.getBackgroundColor(),
        setValue: (color) => this.designer.changeBackgroundColor(color),
      };

    return this.selectedTopicColorModel;
  }

  /**
   *
   * @returns model to get and set the node link
   */
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

  /**
   *
   * @returns model to get and set topic border color
   */
  getColorBorderModel(): NodeProperty<string | undefined> {
    if (!this.borderColorModel)
      this.borderColorModel = {
        getValue: () => this.uniqueOrNull((node) => node.getBorderColor()),
        setValue: (hex: string) => this.designer.changeBorderColor(hex),
      };
    return this.borderColorModel;
  }

  /**
   *
   * @returns model to get and set topic font color
   */
  getFontColorModel(): NodeProperty<string | undefined> {
    if (!this.fontColorModel)
      this.fontColorModel = {
        getValue: () => this.uniqueOrNull((node) => node.getFontColor()),
        setValue: (hex: string) => this.designer.changeFontColor(hex),
      };
    return this.fontColorModel;
  }

  getTopicIconModel(): NodeProperty<string> {
    if (!this.topicIconModel)
      this.topicIconModel = {
        getValue: () => null,
        setValue: (value: string) => {
          const values = value.split(':');
          this.designer.addIconType(values[0] as 'image' | 'emoji', values[1]);
        },
      };
    return this.topicIconModel;
  }

  /**
   *
   * @returns model to get and set topic note
   */
  getNoteModel(): NodeProperty<string> {
    if (!this.noteModel)
      this.noteModel = {
        getValue: (): string => this.selectedTopic()?.getNoteValue(),
        setValue: (value: string) => {
          const note = value && value.trim() !== '' ? value : undefined;
          this.selectedTopic()?.setNoteValue(note);
        },
      };
    return this.noteModel;
  }

  /**
   *
   * @returns model to get and set topic font family
   */
  getFontFamilyModel(): NodeProperty<string> {
    if (!this.fontFamilyModel)
      this.fontFamilyModel = {
        getValue: () => this.uniqueOrNull((node) => node.getFontFamily()),
        setValue: (value: string) => this.designer.changeFontFamily(value),
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
        getValue: () => this.uniqueOrNull((node) => node.getShapeType()) as TopicShapeType,
        setValue: (value: TopicShapeType) => this.designer.changeTopicShape(value),
      };
    return this.topicShapeModel;
  }
}
export default NodePropertyBuilder;
