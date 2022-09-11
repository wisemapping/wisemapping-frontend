import Designer from './Designer';
import buildDesigner from './DesignerBuilder';
import DesignerOptionsBuilder from './DesignerOptionsBuilder';
import EditorRenderMode from './EditorRenderMode';
import LocalStorageManager from './LocalStorageManager';
import Mindmap from './model/Mindmap';
import PersistenceManager from './PersistenceManager';
import WidgetManager from './WidgetManager';
import mindplotStyles from './styles/mindplot-styles';

const defaultPersistenceManager = () => new LocalStorageManager('map.xml', false, false);

export type MindplotWebComponentInterface = {
  id: string;
  mode: string;
  ref: any;
};
/**
 * WebComponent implementation for minplot designer.
 * This component is registered as mindplot-component in customElements api. (see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)
 * For use it you need to import minplot.js and put in your DOM a <mindplot-component/> tag. In order to create a Designer on it you need to call its buildDesigner method. Maps can be loaded throught loadMap method.
 */
class MindplotWebComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  private _mindmap: Mindmap;

  private _designer: Designer;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    const mindplotStylesElement = document.createElement('style');
    mindplotStylesElement.innerHTML = mindplotStyles;
    this._shadowRoot.appendChild(mindplotStylesElement);
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wise-editor');
    wrapper.setAttribute('id', 'mindplot');
    this._shadowRoot.appendChild(wrapper);
  }

  /**
   * @returns the designer
   */
  getDesigner(): Designer {
    return this._designer;
  }

  /**
   * Build the designer of the component
   * @param {PersistenceManager} persistence the persistence manager to be used. By default a LocalStorageManager is created
   * @param {UIManager} widgetManager an UI Manager to override default Designer option.
   */
  buildDesigner(persistence?: PersistenceManager, widgetManager?: WidgetManager) {
    const editorRenderMode = this.getAttribute('mode') as EditorRenderMode;
    const persistenceManager = persistence || defaultPersistenceManager();
    const mode = editorRenderMode || 'viewonly';
    const options = DesignerOptionsBuilder.buildOptions({
      persistenceManager,
      mode,
      widgetManager,
      divContainer: this._shadowRoot.getElementById('mindplot'),
      container: 'mindplot',
      zoom: 0.85,
      locale: 'en',
    });
    this._designer = buildDesigner(options);
  }

  /**
   * Load map in designer throught persistence manager instance
   * @param id the map id to be loaded.
   */
  loadMap(id: string) {
    const instance = PersistenceManager.getInstance();
    this._mindmap = instance.load(id);
    this._designer.loadMap(this._mindmap);
  }
}

export default MindplotWebComponent;
