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

type DesignerEventType = Parameters<Designer['addEvent']>[0];
type DesignerHandler = Parameters<Designer['addEvent']>[1];

class Editor {
  private component: MindplotWebComponent;

  private pendingFlushPromise: Promise<void> | null = null;

  private beforeUnloadHandler: (() => void) | null = null;

  // The debounced autosave and the designer it listens on, released by dispose() ...
  private autoSave: { designer: Designer; save: (() => void) & { cancel: () => void } } | null =
    null;

  // The designer handlers added by registerEvents, removed by dispose() ...
  private designerHandlers: {
    designer: Designer;
    handlers: [DesignerEventType, DesignerHandler][];
  } | null = null;

  constructor(component: MindplotWebComponent) {
    this.component = component;
  }

  isMapLoadded(): boolean {
    return this.component.isLoaded();
  }

  /**
   * @param saveHistory true for an explicit save that records a history entry;
   * false for a minor save (autosave, flush), skipped when nothing changed.
   */
  save(saveHistory: boolean): Promise<void> {
    if (!this.component) {
      throw new Error('Designer object has not been initialized.');
    }
    return this.component.save(saveHistory);
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
      //
      // Deliberately NOT subscribed to the screen manager's 'update': that
      // fires once per mousemove while the canvas is dragged, and routing it
      // here re-rendered the entire editor chrome per frame. The one piece of
      // chrome that needs it -- the zoom percentage -- subscribes directly in
      // visualization-toolbar/zoom-display.tsx, so only that leaf re-renders.
      this.removeDesignerHandlers();
      const handlers: [DesignerEventType, DesignerHandler][] = [
        ['onblur', onNodeBlurHandler],
        ['onfocus', onNodeFocusHandler],
        ['modelUpdate', onNodeFocusHandler],
        ['featureEdit', featureEdition as DesignerHandler],
      ];
      handlers.forEach(([type, handler]) => designer.addEvent(type, handler));
      this.designerHandlers = { designer, handlers };

      // Is the save action enabled ... ?
      if (!capability.isHidden('save')) {
        // Register unload save ...
        this.removeBeforeUnloadHandler();
        this.beforeUnloadHandler = () => {
          this.flushPendingChangesOnce(true).catch((error) => {
            console.error('Save failed on beforeunload:', error);
          });
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);

        // Debounced autosave triggered by model updates
        // Waits 15 seconds after the last change before saving
        this.removeAutoSave();
        const debouncedAutoSave = debounce(() => {
          component.save(false).catch((error) => {
            console.error('Autosave failed:', error);
          });
        }, 15000);

        // Trigger autosave on model updates
        designer.addEvent('modelUpdate', debouncedAutoSave);
        this.autoSave = { designer, save: debouncedAutoSave };
      }
    }
  }

  /**
   * Saves the pending changes and unlocks the map.
   * @param unloading the page is unloading: the save response would arrive after the page is gone,
   * so the unlock is sent right away instead of after the save.
   */
  async flushPendingChanges(unloading = false): Promise<void> {
    // If the map is not loaded, there is no need to flush or unlock
    if (!this.isMapLoadded()) {
      return;
    }

    let unlocked = false;
    try {
      const saved = this.component.save(false, { urgent: true });
      if (unloading) {
        this.unlockMap();
        unlocked = true;
      }
      await saved;
    } catch (error) {
      console.error('Save failed while leaving editor:', error);
      // We don't rethrow here to ensure unlocking happens (if possible) and cleanup continues
    } finally {
      if (!unlocked) {
        this.unlockMap();
      }
    }
  }

  flushPendingChangesOnce(unloading = false): Promise<void> {
    if (!this.pendingFlushPromise) {
      this.pendingFlushPromise = this.flushPendingChanges(unloading).finally(() => {
        this.pendingFlushPromise = null;
      });
    }
    return this.pendingFlushPromise;
  }

  /**
   * Releases the listeners added by registerEvents. A pending autosave is dropped, not run: the
   * caller flushes the pending changes before disposing.
   */
  dispose(): void {
    this.removeBeforeUnloadHandler();
    this.removeAutoSave();
    this.removeDesignerHandlers();
  }

  private removeDesignerHandlers(): void {
    if (this.designerHandlers) {
      const { designer, handlers } = this.designerHandlers;
      handlers.forEach(([type, handler]) => designer.removeEvent(type, handler));
      this.designerHandlers = null;
    }
  }

  private removeAutoSave(): void {
    if (this.autoSave) {
      this.autoSave.save.cancel();
      this.autoSave.designer.removeEvent('modelUpdate', this.autoSave.save);
      this.autoSave = null;
    }
  }

  private removeBeforeUnloadHandler(): void {
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }

  private unlockMap(): void {
    try {
      this.component.unlockMap();
    } catch (e) {
      console.warn('Failed to unlock map:', e);
    }
  }
}

export default Editor;
