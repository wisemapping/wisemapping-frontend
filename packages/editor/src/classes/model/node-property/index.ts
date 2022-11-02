import { SwitchValueDirection } from '../../../components/toolbar/ToolbarValueModelBuilder';

/**
 * Interface to get and set a property of the mindplot selected node
 */

interface NodeProperty {
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
export default NodeProperty;
