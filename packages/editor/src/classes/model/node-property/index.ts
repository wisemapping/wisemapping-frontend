import { SwitchValueDirection } from '../../../components/toolbar/ToolbarValueModelBuilder';

/**
 * Interface to get and set a property of the mindplot selected node
 */

interface NodeProperty<Type> {
  /**
   * get the property value
   */
  getValue: () => Type;
  /**
   * set the property value
   */
  setValue?: (value: Type) => void;
  /**
   * toogle boolean values or change for next/previous in reduced lists of values
   */
  switchValue?: (direction?: SwitchValueDirection) => void;
}
export default NodeProperty;
