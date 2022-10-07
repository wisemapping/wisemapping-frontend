import Toolbar from './Toolbar';
import { horizontalPosition } from './ToolbarPositionInterface';
import Header from '../app-bar';
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
export { horizontalPosition, Header };

export type ToolbarActionType = 'export' | 'publish' | 'history' | 'print' | 'share' | 'info';
