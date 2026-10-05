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
import { $assert } from './util/assert';
import Designer from './Designer';
import buildDesigner from './DesignerBuilder';
import DesignerOptionsBuilder from './DesignerOptionsBuilder';
import EditorRenderMode from './EditorRenderMode';
import PersistenceManager, { SaveOptions } from './PersistenceManager';
import WidgetBuilder from './WidgetBuilder';
import mindplotStyles from './styles/mindplot-styles';
import { $notify } from './model/ToolbarNotifier';
import { $msg } from './Messages';
import DesignerKeyboard from './DesignerKeyboard';
import LocalStorageManager from './LocalStorageManager';
import ThemeFactory from './theme/ThemeFactory';

/**
 * WebComponent implementation for the mindplot designer.
 * This component is registered as mindplot-component in customElements api. (see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)
 * To use it, import @wisemapping/mindplot (its entry point registers the element) and put a <mindplot-component/> tag in your DOM. To create a Designer on it, call its buildDesigner method. Maps are loaded through the loadMap method.
 */
class MindplotWebComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  private _designer: Designer | undefined;

  // The persistence the designer was built with. Kept here rather than read back from the
  // static PersistenceManager instance, which the next designer built replaces ...
  private _persistence: PersistenceManager | undefined;

  private _saveRequired: boolean;

  // Incremented on every model change, so a save can tell whether the model changed
  // after it was serialized.
  private _revision: number;

  private _isLoaded: boolean;

  private loadMaterialIconsFont(): void {
    // Check if Material Icons font is already loaded
    if (document.querySelector('link[href*="Material+Icons"]')) {
      return;
    }

    // Load Material Icons font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  private loadInterFont(): void {
    // Check if Inter font is already loaded
    if (document.querySelector('link[href*="Inter"]')) {
      return;
    }

    // Load Inter font
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });

    // Load fonts
    this.loadMaterialIconsFont();
    this.loadInterFont();

    const mindplotStylesElement = document.createElement('style');
    mindplotStylesElement.innerHTML = mindplotStyles;
    this._shadowRoot.appendChild(mindplotStylesElement);

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wise-editor');
    wrapper.setAttribute('id', 'mindplot-canvas');

    const theme = ThemeFactory.createById('classic', 'light'); // Default theme for web component - will be updated by theme variant
    const backgroundColor = theme.getCanvasBackgroundColor();
    const opacity = theme.getCanvasOpacity();
    const showGrid = theme.getCanvasShowGrid();
    const gridColor = theme.getCanvasGridColor();
    const gridPattern = theme.getCanvasGridPattern();

    let style = `position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: ${opacity};
      background-color: ${backgroundColor};
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;`;

    // Add grid if enabled
    if (showGrid && gridColor) {
      if (gridPattern === 'dots') {
        style += `
        background-image: radial-gradient(circle, ${gridColor} 1px, transparent 1px);
        background-size: 20px 20px;`;
      } else {
        style += `
        background-image: linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(to right, ${gridColor} 1px, ${backgroundColor} 1px);
        background-size: 20px 20px;`;
      }
    }

    wrapper.setAttribute('style', style);

    this._shadowRoot.appendChild(wrapper);
    this._isLoaded = false;
    this._saveRequired = false;
    this._revision = 0;
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
   * @param persistence the persistence manager to be used. When undefined, a LocalStorageManager
   * reading `map.xml` (and keeping the changes in the browser local storage) is created.
   * @param widgetManager builds the link and note editors and tooltips. Required: there is no
   * default, WidgetBuilder is abstract.
   */
  buildDesigner(persistence: PersistenceManager | undefined, widgetManager: WidgetBuilder) {
    const editorRenderMode = this.getAttribute('mode') as EditorRenderMode;
    const locale = this.getAttribute('locale');
    const zoom = this.getAttribute('zoom');
    // Selection assistance is enabled by default

    // Clear theme cache to ensure updated configurations are loaded
    ThemeFactory.clearCache();

    const persistenceManager =
      persistence || new LocalStorageManager('map.xml', false, undefined, false);
    const mode: EditorRenderMode = editorRenderMode || 'viewonly-private';

    const mindplodElem = this._shadowRoot.getElementById('mindplot-canvas');
    $assert(mindplodElem, 'Root mindplot element could not be loaded');

    const options = DesignerOptionsBuilder.buildOptions({
      persistenceManager,
      mode,
      widgetManager,
      divContainer: mindplodElem,
      zoom: zoom ? Number.parseFloat(zoom) : 1,
      locale: locale || 'en',
    });

    this._persistence = persistenceManager;
    this._designer = buildDesigner(options);
    this._designer.addEvent('modelUpdate', () => {
      if (this._isLoaded) {
        this._revision += 1;
        this.setSaveRequired(true);
      }
    });

    this.registerShortcuts();

    this._designer.addEvent('loadSuccess', (): void => {
      this._isLoaded = true;
      this.setSaveRequired(false);
    });

    return this._designer;
  }

  isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Disposes the designer once the element has left the page. A move (removed and inserted
   * again in the same task) keeps it. The designer and its persistence stay reachable, so that
   * pending changes can still be saved and the map unlocked.
   */
  disconnectedCallback(): void {
    queueMicrotask(() => {
      if (!this.isConnected && this._designer) {
        this._designer.dispose();
        if (this._persistence) {
          PersistenceManager.clear(this._persistence);
        }
      }
    });
  }

  private getPersistence(): PersistenceManager {
    if (!this._persistence) {
      throw Error('Designer has not been initialized');
    }
    return this._persistence;
  }

  private registerShortcuts() {
    const designerKeyboard = DesignerKeyboard.getInstance();
    if (designerKeyboard) {
      designerKeyboard.addShortcut(['ctrl+s', 'meta+s'], () => {
        this.save(true).catch((error) => {
          console.error('Save failed from keyboard shortcut:', error);
        });
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
    this._isLoaded = false;
    this.setSaveRequired(false);

    return this.getPersistence()
      .load(id)
      .then((mindmap) => this._designer!.loadMap(mindmap));
  }

  /**
   * @param options.urgent a flush (e.g. when leaving the editor): skips the save rate limit.
   */
  save(saveHistory: boolean, options?: SaveOptions): Promise<void> {
    if (!saveHistory && !this.getSaveRequired()) {
      return Promise.resolve();
    }
    console.log('Saving...');
    // Load map content ...
    const mindmap = this._designer!.getMindmap();
    const mindmapProp = this._designer!.getMindmapProperties();

    // Display save message ..
    if (saveHistory) {
      $notify($msg('SAVING'));
    }

    // Call persistence manager for saving ...
    const persistenceManager = this.getPersistence();
    // The map is serialized synchronously by save(), so this is the revision being sent.
    const savedRevision = this._revision;
    return new Promise<void>((resolve, reject) => {
      persistenceManager.save(
        mindmap,
        mindmapProp,
        saveHistory,
        {
          onSuccess: () => {
            if (saveHistory) {
              $notify($msg('SAVE_COMPLETE'));
            }
            // Changes made while the save was in flight are not included, keep them pending.
            if (this._revision === savedRevision) {
              this.setSaveRequired(false);
            }
            resolve();
          },
          onError: (error) => {
            if (saveHistory) {
              $notify(error.message);
            }
            reject(error);
          },
        },
        options,
      );
    });
  }

  unlockMap(): Promise<void> {
    const mindmap = this._designer!.getMindmap();
    const persistenceManager = this.getPersistence();

    // If the map could not be loaded, partial map load could happen.
    const mapId = mindmap?.getId();
    if (mapId) {
      return Promise.resolve(persistenceManager.unlockMap(mapId));
    }
    return Promise.resolve();
  }
}

export default MindplotWebComponent;
