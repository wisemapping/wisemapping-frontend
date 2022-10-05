import { Designer } from '@wisemapping/mindplot';

export enum SwitchValueDirection {
  'up',
  'down',
}

const fontSizes = [6, 8, 10, 15];

/**
 * Interface to get and set a property of the mindplot selected node
 */
export interface NodePropertyValueModel {
  /**
   * get the property value
   */
  getValue: () => any;
  /**
   * set the property value
   */
  setValue?: (value: any) => void;
  /**
   * toogle boolean values or change for next/previous in reduced lists of values
   */
  switchValue?: (direction?: SwitchValueDirection) => void;
}

/**
 * Given an array and the current value it return the next posible value
 * @param values posible  values
 * @param current the current vaule
 * @returns the next vaule in the array or same if is the last
 */
export function getNextValue(values: any[], current: any): any {
  const nextIndex = values.indexOf(current) + 1;
  if (nextIndex === values.length) return current;
  return values[nextIndex];
}

/**
 * Given an array and the current value it return the previous value
 * @param values posible  values
 * @param current the current vaule
 * @returns the previous vaule in the array or same if is the first
 */
export function getPreviousValue(values: any[], current: any): any {
  const currentIndex = values.indexOf(current);
  if (currentIndex === 0) return current;
  if (currentIndex === -1) return values[values.length - 1];
  return values[currentIndex - 1];
}

/**
 * the unique property value of object in the array or null if more than one exits
 */
export function getTheUniqueValueOrNull(
  objectsArray: object[],
  propertyValueGetter: (object: object) => string | number,
) {
  let result;
  for (let i = 0; i < objectsArray.length; i++) {
    const value = propertyValueGetter(objectsArray[i]);
    if (result != null && result !== value) {
      result = null;
      break;
    }
    result = value;
  }
  return result;
}

/**
 * Given a designer build NodePropertyValueModel instances for the mindplot node properties
 */
export class NodePropertyValueModelBuilder {
  designer: Designer;

  fontSizeModel: NodePropertyValueModel;
  selectedTopicColorModel: NodePropertyValueModel;
  fontFamilyModel: NodePropertyValueModel;
  fontStyleModel: NodePropertyValueModel;
  borderColorModel: NodePropertyValueModel;
  fontColorModel: NodePropertyValueModel;
  topicShapeModel: NodePropertyValueModel;
  topicIconModel: NodePropertyValueModel;
  noteModel: NodePropertyValueModel;
  linkModel: NodePropertyValueModel;

  /**
   *
   * @param designer designer to change node properties values
   */
  constructor(designer: Designer) {
    this.designer = designer;
  }

  private selectedTopic() {
    return designer.getModel().selectedTopic();
  }

  private getFontSize() {
    return designer.getModel().selectedTopic()?.getFontSize();
  }

  private uniqueOrNull(propertyGetter: (Topic) => any | null) {
    const nodes = designer.getModel().filterSelectedTopics();
    return getTheUniqueValueOrNull(nodes, propertyGetter);
  }

  /**
   *
   * @returns model to and switch font weigth
   */
  fontWeigthModel(): NodePropertyValueModel {
    return {
      getValue: () => designer.getModel().selectedTopic()?.getFontWeight(),
      switchValue: () => designer.changeFontWeight(),
    };
  }

  /**
   *
   * @returns model to and switch font size in both directions. Font sizes used to iterate: [6, 8, 10, 15]
   */
  getFontSizeModel(): NodePropertyValueModel {
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
          designer.changeFontSize(newValue);
        },
      };
    return this.fontSizeModel;
  }

  /**
   *
   * @returns model to get and set topic color
   */
  getSelectedTopicColorModel(): NodePropertyValueModel {
    if (!this.selectedTopicColorModel)
      this.selectedTopicColorModel = {
        getValue: () => designer.getModel().selectedTopic()?.getBackgroundColor(),
        setValue: (color) => designer.changeBackgroundColor(color),
      };

    return this.selectedTopicColorModel;
  }

  /**
   *
   * @returns model to get and set the node link
   */
  getLinkModel(): NodePropertyValueModel {
    // const selected = this.selectedTopic();
    if (!this.linkModel)
      this.linkModel = {
        getValue: (): string => this.selectedTopic()?.getLinkValue(),
        setValue: (value: string) => {
          this.selectedTopic().setLinkValue(value);
        },
      };
    return this.linkModel;
  }

  /**
   *
   * @returns model to get and set topic border color
   */
  getColorBorderModel(): NodePropertyValueModel {
    if (!this.borderColorModel)
      this.borderColorModel = {
        getValue: () => this.uniqueOrNull((node) => node.getBorderColor()),
        setValue: (hex: string) => designer.changeBorderColor(hex),
      };
    return this.borderColorModel;
  }

  /**
   *
   * @returns model to get and set topic font color
   */
  getFontColorModel(): NodePropertyValueModel {
    if (!this.fontColorModel)
      this.fontColorModel = {
        getValue: () => this.uniqueOrNull((node) => node.getFontColor()),
        setValue: (hex: string) => designer.changeFontColor(hex),
      };
    return this.fontColorModel;
  }

  /**
   *
   * @returns model to get and set topic icon
   */
  getTopicIconModel(): NodePropertyValueModel {
    if (!this.topicIconModel)
      this.topicIconModel = {
        getValue: () => null,
        setValue: (value: string) => designer.addIconType(value),
      };
    return this.topicIconModel;
  }

  /**
   *
   * @returns model to get and set topic note
   */
  getNoteModel(): NodePropertyValueModel {
    if (!this.noteModel)
      this.noteModel = {
        getValue: (): string => this.selectedTopic()?.getNoteValue(),
        setValue: (value: string) => {
          this.selectedTopic().setNoteValue(value);
        },
      };
    return this.noteModel;
  }

  /**
   *
   * @returns model to get and set topic font family
   */
  getFontFamilyModel(): NodePropertyValueModel {
    if (!this.fontFamilyModel)
      this.fontFamilyModel = {
        getValue: () => this.uniqueOrNull((node) => node.getFontFamily()),
        setValue: (value: string) => designer.changeFontFamily(value),
      };
    return this.fontFamilyModel;
  }

  /**
   *
   * @returns model to get and switch topic style
   */
  getFontStyleModel(): NodePropertyValueModel {
    if (!this.fontStyleModel)
      this.fontStyleModel = {
        getValue: () => this.selectedTopic().getFontStyle(),
        switchValue: () => designer.changeFontStyle(),
      };
    return this.fontStyleModel;
  }

  /**
   *
   * @returns model to get and set topic shape
   */
  getTopicShapeModel(): NodePropertyValueModel {
    if (!this.topicShapeModel)
      this.topicShapeModel = {
        getValue: () => this.uniqueOrNull((node) => node.getShapeType()),
        setValue: (value: string) => designer.changeTopicShape(value),
      };
    return this.topicShapeModel;
  }
}
