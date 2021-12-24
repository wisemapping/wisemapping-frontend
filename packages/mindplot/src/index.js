/* eslint-disable import/no-unresolved */
import jquery from 'jquery';
import * as DesignerBuilder from './components/DesignerBuilder';
import Mindmap from './components/model/Mindmap';
import PersistenceManager from './components/PersistenceManager';
import Designer from './components/Designer';
import LocalStorageManager from './components/LocalStorageManager';

import Menu from './components/widget/Menu';

// This hack is required to initialize Bootstrap. In future, this should be removed.
global.jQuery = jquery;
require('@libraries/bootstrap/js/bootstrap');

export {
  Mindmap, PersistenceManager, Designer, LocalStorageManager, Menu, DesignerBuilder,
};
