import { MindplotWebComponent, PersistenceManager } from '@wisemapping/mindplot';
import Designer from '@wisemapping/mindplot/src/components/Designer';
import Capability from '../../action/capability';

class Editor {
  private component: MindplotWebComponent;
  constructor(mindplotComponent: MindplotWebComponent) {
    this.component = mindplotComponent;
  }

  loadMindmap(mapId: string, persistenceManager: PersistenceManager, widgetManager): void {
    this.component.buildDesigner(persistenceManager, widgetManager);
    this.component.loadMap(mapId);
  }

  registerEvents(setToolbarsRerenderSwitch: (timestamp: number) => void, capability: Capability) {
    const desiger = this.component.getDesigner();
    const onNodeBlurHandler = () => {
      if (!desiger.getModel().selectedTopic()) {
        setToolbarsRerenderSwitch(Date.now());
      }
    };

    const onNodeFocusHandler = () => {
      setToolbarsRerenderSwitch(Date.now());
    };

    // Register events ...
    designer.addEvent('onblur', onNodeBlurHandler);
    designer.addEvent('onfocus', onNodeFocusHandler);
    designer.addEvent('modelUpdate', onNodeFocusHandler);
    designer.getWorkSpace().getScreenManager().addEvent('update', onNodeFocusHandler);

    // Is the save action enabled ... ?
    if (!capability.isHidden('save')) {
      // Register unload save ...
      window.addEventListener('beforeunload', () => {
        this.component.save(false);
        this.component.unlockMap();
      });

      // Autosave on a fixed period of time ...
      setInterval(() => {
        this.component.save(false);
      }, 10000);
    }
  }
}

export default Editor;
