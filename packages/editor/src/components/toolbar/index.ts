import Toolbar from './Toolbar';
import { horizontalPosition } from './ToolbarPositionInterface';
import Appbar from './AppBar';
import {
  buildEditorAppBarConfiguration,
  buildToolbarCongiruation,
  buildZoomToolbarConfiguration,
} from './toolbarConfigurationBuilder';

export default Toolbar;
export const configurationBuilder = {
  buildEditorAppBarConfiguration,
  buildToolbarCongiruation,
  buildZoomToolbarConfiguration,
};
export { horizontalPosition, Appbar };

export type ToolbarActionType = 'export' | 'publish' | 'history' | 'print' | 'share' | 'info';
