import { EditorOptions } from '@wisemapping/editor';
import { EditorRenderMode } from '@wisemapping/editor';
import AppConfig from '../../classes/app-config';

class EditorOptionsBuilder {
  static build(locale: string, mode: EditorRenderMode, hotkeys: boolean): EditorOptions {
    let options: EditorOptions = {
      enableKeyboardEvents: hotkeys,
      locale: locale,
      mode: mode,
    };

    if (!AppConfig.isDevelopEnv()) {
      options = {
        zoom: globalThis.userOptions?.zoom ? globalThis?.userOptions?.zoom : 0.8,
        locked: globalThis.mindmapLocked,
        lockedMsg: globalThis.mindmapLockedMsg,
        mapTitle: globalThis.mapTitle,
        ...options,
      };
    } else {
      // Running in a development mode.
      console.log('Running editor in development mode');
      options = {
        zoom: 0.8,
        locked: false,
        mapTitle: 'Develop Mindnap',
        ...options,
      };
    }
    return options;
  }

  static loadMapId(): number {
    const result = !AppConfig.isDevelopEnv() ? globalThis.mapId : 11;
    if (result === undefined) {
      throw Error(
        `Could not resolve mapId. Map Id: globalThis.mapId: ${result} , globalThis.mapTitle: ${globalThis.mapTitle}, globalThis.lockSession: ${globalThis.lockSession}`,
      );
    }
    return result;
  }
}
export default EditorOptionsBuilder;
