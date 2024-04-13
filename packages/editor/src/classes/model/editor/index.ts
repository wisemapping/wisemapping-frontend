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
import {
  Designer,
  MindplotWebComponent,
  PersistenceManager,
  DesignerModel,
  WidgetManager,
  Topic,
} from '@wisemapping/mindplot';
import Capability from '../../action/capability';

class Editor {
  private component: MindplotWebComponent;

  constructor(component: MindplotWebComponent) {
    this.component = component;
  }

  isMapLoadded(): boolean {
    return this.component.isLoaded();
  }

  save(minor: boolean): void {
    if (!this.component) {
      throw new Error('Designer object has not been initialized.');
    }
    this.component.save(minor);
  }

  getDesigner(): Designer {
    if (!this.component) {
      throw new Error('Designer object has not been initialized.');
    }
    return this.component.getDesigner();
  }

  getDesignerModel(): DesignerModel | undefined {
    return this.getDesigner()!.getModel();
  }

  loadMindmap(
    mapId: string,
    persistenceManager: PersistenceManager,
    widgetManager: WidgetManager,
  ): Promise<void> {
    this.component.buildDesigner(persistenceManager, widgetManager);
    return this.component.loadMap(mapId);
  }

  registerEvents(
    canvasUpdate: (timestamp: number) => void,
    capability: Capability,
    wm: WidgetManager,
  ): void {
    const component = this.component;
    const designer = component!.getDesigner();

    if (designer) {
      const onNodeBlurHandler = () => {
        if (!designer.getModel().selectedTopic()) {
          canvasUpdate(Date.now());
        }
      };

      const onNodeFocusHandler = () => {
        canvasUpdate(Date.now());
      };

      const featureEdition = (value: { event: 'note' | 'link' | 'close'; topic: Topic }): void => {
        const { event, topic } = value;
        console.error('event:' + event);

        switch (event) {
          case 'note': {
            wm.showEditorForNote(topic);
            break;
          }
          case 'link': {
            wm.showEditorForLink(topic);
            break;
          }
        }
        canvasUpdate(Date.now());
      };

      // Register events ...
      designer.addEvent('onblur', onNodeBlurHandler);
      designer.addEvent('onfocus', onNodeFocusHandler);
      designer.addEvent('modelUpdate', onNodeFocusHandler);
      designer.getWorkSpace().getScreenManager().addEvent('update', onNodeFocusHandler);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      designer.addEvent('featureEdit', featureEdition);

      // Is the save action enabled ... ?
      if (!capability.isHidden('save')) {
        // Register unload save ...
        window.addEventListener('beforeunload', () => {
          component.save(false);
          component.unlockMap();
        });

        // Autosave on a fixed period of time ...
        setInterval(() => {
          component.save(false);
        }, 5000);
      }
    }
  }
}

export default Editor;
