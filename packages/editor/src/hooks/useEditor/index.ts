import { DesignerKeyboard, EditorRenderMode, PersistenceManager } from '@wisemapping/mindplot';
import { useState, useRef, useEffect } from 'react';
import Capability from '../../classes/action/capability';
import MapInfo from '../../classes/model/map-info';
import { useWidgetManager } from '../useWidgetManager';
import Model from '../../classes/model/editor';

export type EditorOptions = {
  mode: EditorRenderMode;
  locale: string;
  zoom?: number;
  enableKeyboardEvents: boolean;
  enableAppBar?: boolean;
  saveOnLoad?: boolean;
};

type UseEditorProps = {
  mapInfo: MapInfo;
  options: EditorOptions;
  persistenceManager: PersistenceManager;
};

export interface EditorConfiguration {
  model;
  mindplotRef: React.MutableRefObject<unknown>;
  mapInfo: MapInfo;
  capability: Capability;
  options: EditorOptions;
}

export const useEditor = ({
  mapInfo,
  options,
  persistenceManager,
}: UseEditorProps): EditorConfiguration => {
  // We create model inside useEditor hook to instantiate everything outside Editor Component
  const [model, setModel] = useState<Model | undefined>();
  // useEditor hook creates mindplotRef
  const mindplotRef = useRef(null);
  // This is required to redraw in case of chansges in the canvas...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setCanvasUpdate] = useState<number>();

  const { widgetManager } = useWidgetManager();
  const capability = new Capability(options.mode, mapInfo.isLocked());

  useEffect(() => {
    if (!model) {
      const model = new Model(mindplotRef.current);
      model
        .loadMindmap(mapInfo.getId(), persistenceManager, widgetManager)
        .then(() => {
          setCanvasUpdate(Date.now());
          model.registerEvents(setCanvasUpdate, capability);
        })
        .catch((e) => {
          console.error(e);
          window.newrelic?.noticeError(e);
        });
      setModel(model);
    }
  }, [mindplotRef]);

  useEffect(() => {
    if (options.enableKeyboardEvents) {
      DesignerKeyboard.resume();
    } else {
      DesignerKeyboard.pause();
    }
  }, [options.enableKeyboardEvents]);

  return { model, mindplotRef, mapInfo, capability, options };
};
