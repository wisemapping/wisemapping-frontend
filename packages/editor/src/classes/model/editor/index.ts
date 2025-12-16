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
import {
  Designer,
  MindplotWebComponent,
  PersistenceManager,
  DesignerModel,
  WidgetBuilder,
  Topic,
} from '@wisemapping/mindplot';
import Capability from '../../action/capability';
import { trackEditorInteraction } from '../../../utils/analytics';
import debounce from 'lodash/debounce';

class Editor {
  private component: MindplotWebComponent;

  private pendingFlushPromise: Promise<void> | null = null;

  constructor(component: MindplotWebComponent) {
    this.component = component;
  }

  isMapLoadded(): boolean {
    return this.component.isLoaded();
  }

  save(minor: boolean): Promise<void> {
    if (!this.component) {
      throw new Error('Designer object has not been initialized.');
    }
    return this.component.save(minor);
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
    widgetBuilder: WidgetBuilder,
  ): Promise<void> {
    this.component.buildDesigner(persistenceManager, widgetBuilder);
    return this.component.loadMap(mapId);
  }

  registerEvents(
    canvasUpdate: (timestamp: number) => void,
    capability: Capability,
    widgetBuilder: WidgetBuilder,
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
        // Topic selection tracking removed
        canvasUpdate(Date.now());
      };

      const featureEdition = (value: { event: 'note' | 'link' | 'close'; topic: Topic }): void => {
        const { event, topic } = value;
        switch (event) {
          case 'note': {
            trackEditorInteraction('note_editor_open');
            widgetBuilder.fireEvent('note', topic);
            break;
          }
          case 'link': {
            trackEditorInteraction('link_editor_open');
            widgetBuilder.fireEvent('link', topic);
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
          this.flushPendingChangesOnce().catch((error) => {
            console.error('Save failed on beforeunload:', error);
          });
        });

        // Debounced autosave triggered by model updates
        // Waits 15 seconds after the last change before saving
        const debouncedAutoSave = debounce(() => {
          component.save(false).catch((error) => {
            console.error('Autosave failed:', error);
          });
        }, 15000);

        // Trigger autosave on model updates
        designer.addEvent('modelUpdate', debouncedAutoSave);
      }
    }
  }

  async flushPendingChanges(): Promise<void> {
    // If the map is not loaded, there is no need to flush or unlock
    if (!this.isMapLoadded()) {
      return;
    }

    try {
      await this.save(false);
    } catch (error) {
      console.error('Save failed while leaving editor:', error);
      // We don't rethrow here to ensure unlocking happens (if possible) and cleanup continues
    } finally {
      try {
        this.component.unlockMap();
      } catch (e) {
        console.warn('Failed to unlock map:', e);
      }
    }
  }

  flushPendingChangesOnce(): Promise<void> {
    if (!this.pendingFlushPromise) {
      this.pendingFlushPromise = this.flushPendingChanges().finally(() => {
        this.pendingFlushPromise = null;
      });
    }
    return this.pendingFlushPromise;
  }
}

export default Editor;
