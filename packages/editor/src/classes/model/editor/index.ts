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
import { Designer, MindplotWebComponent, PersistenceManager } from '@wisemapping/mindplot';
import Capability from '../../action/capability';

class Editor {
  private component: MindplotWebComponent;
  constructor(mindplotComponent: MindplotWebComponent) {
    this.component = mindplotComponent;
  }

  isMapLoadded(): boolean {
    return this.component.getDesigner()?.getMindmap() != null;
  }

  save(minor: boolean) {
    this.component.save(minor);
  }

  getDesigner(): Designer | undefined {
    return this.component?.getDesigner();
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
