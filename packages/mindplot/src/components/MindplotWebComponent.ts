/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $assert } from '@wisemapping/core-js';
import Designer from './Designer';
import buildDesigner from './DesignerBuilder';
import DesignerOptionsBuilder from './DesignerOptionsBuilder';
import EditorRenderMode from './EditorRenderMode';
import PersistenceManager from './PersistenceManager';
import WidgetManager from './WidgetManager';
import mindplotStyles from './styles/mindplot-styles';
import { $notify } from './model/ToolbarNotifier';
import { $msg } from './Messages';
import DesignerKeyboard from './DesignerKeyboard';
import LocalStorageManager from './LocalStorageManager';
import ThemeFactory from './theme/ThemeFactory';

/**
 * WebComponent implementation for minplot designer.
 * This component is registered as mindplot-component in customElements api. (see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)
 * For use it you need to import minplot.js and put in your DOM a <mindplot-component/> tag. In order to create a Designer on it you need to call its buildDesigner method. Maps can be loaded throught loadMap method.
 */
class MindplotWebComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  private _designer: Designer | undefined;

  private _saveRequired: boolean;

  private _isLoaded: boolean;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });

    const mindplotStylesElement = document.createElement('style');
    mindplotStylesElement.innerHTML = mindplotStyles;
    this._shadowRoot.appendChild(mindplotStylesElement);

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wise-editor');
    wrapper.setAttribute('id', 'mindplot-canvas');

    const theme = ThemeFactory.createById('classic');
    wrapper.setAttribute('style', theme.getCanvasCssStyle());

    this._shadowRoot.appendChild(wrapper);
    this._isLoaded = false;
    this._saveRequired = false;
  }

  /**
   * @returns the designer
   */
  getDesigner(): Designer {
    if (!this._designer) {
      throw Error('Designer has not been initialized');
    }
    return this._designer;
  }

  /**
   * Build the designer of the component
   * @param {PersistenceManager} persistence the persistence manager to be used. By default a LocalStorageManager is created
   * @param {UIManager} widgetManager an UI Manager to override default Designer option.
   */
  buildDesigner(persistence: PersistenceManager, widgetManager: WidgetManager) {
    const editorRenderMode = this.getAttribute('mode') as EditorRenderMode;
    const locale = this.getAttribute('locale');
    const zoom = this.getAttribute('zoom');

    const persistenceManager =
      persistence || new LocalStorageManager('map.xml', false, undefined, false);
    const mode = editorRenderMode || 'viewonly';

    const mindplodElem = this._shadowRoot.getElementById('mindplot-canvas');
    $assert(mindplodElem, 'Root mindplot element could not be loaded');

    const options = DesignerOptionsBuilder.buildOptions({
      persistenceManager,
      mode,
      widgetManager,
      divContainer: mindplodElem!,
      zoom: zoom ? Number.parseFloat(zoom) : 1,
      locale: locale || 'en',
    });
    this._designer = buildDesigner(options);
    this._designer.addEvent('modelUpdate', () => {
      this.setSaveRequired(true);
    });

    this.registerShortcuts();

    this._designer.addEvent('loadSuccess', (): void => {
      this._isLoaded = true;
    });

    return this._designer;
  }

  isLoaded(): boolean {
    return this._isLoaded;
  }

  private registerShortcuts() {
    const designerKeyboard = DesignerKeyboard.getInstance();
    if (designerKeyboard) {
      designerKeyboard.addShortcut(['ctrl+s', 'meta+s'], () => {
        this.save(true);
      });
    }
  }

  setSaveRequired(value: boolean) {
    this._saveRequired = value;
  }

  getSaveRequired() {
    return this._saveRequired;
  }

  loadMap(id: string): Promise<void> {
    const instance = PersistenceManager.getInstance();
    return instance.load(id).then((mindmap) => this._designer!.loadMap(mindmap));
  }

  save(saveHistory: boolean) {
    if (!saveHistory && !this.getSaveRequired()) return;
    console.log('Saving...');
    // Load map content ...
    const mindmap = this._designer!.getMindmap();
    const mindmapProp = this._designer!.getMindmapProperties();

    // Display save message ..
    if (saveHistory) {
      $notify($msg('SAVING'));
    }

    // Call persistence manager for saving ...
    const persistenceManager = PersistenceManager.getInstance();
    persistenceManager.save(mindmap, mindmapProp, saveHistory, {
      onSuccess() {
        if (saveHistory) {
          $notify($msg('SAVE_COMPLETE'));
        }
      },
      onError(error) {
        if (saveHistory) {
          $notify(error.message);
        }
      },
    });
    this.setSaveRequired(false);
  }

  unlockMap() {
    const mindmap = this._designer!.getMindmap();
    const persistenceManager = PersistenceManager.getInstance();

    // If the map could not be loaded, partial map load could happen.
    const mapId = mindmap.getId();
    if (mindmap && mapId) {
      persistenceManager.unlockMap(mapId);
    }
  }
}

export default MindplotWebComponent;
