import { EditorOptions } from '@wisemapping/editor';
import { EditorRenderMode } from '@wisemapping/mindplot';
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
                zoom: (global.userOptions?.zoom != undefined
                    ? Number.parseFloat(global?.userOptions?.zoom as string)
                    : 0.8),
                locked: global.mindmapLocked,
                lockedMsg: global.mindmapLockedMsg,
                mapTitle: global.mapTitle,
                ...options
            }
        } else {
            // Running in a development mode.
            console.log('Running editor in development mode');
            options = {
                zoom: 0.8,
                locked: false,
                mapTitle: "Develop Mindnap",
                ...options
            }
        }
        return options;
    }

    static loadMapId(): number {
        const result = !AppConfig.isDevelopEnv() ? global.mapId : 11;
        if (result === undefined) {
            throw Error(`Could not resolve mapId. Map Id: global.mapId: ${result} , global.mapTitle: ${global.mapTitle}, global.lockSession: ${global.lockSession}`);
        }
        return result;
    }
}
export default EditorOptionsBuilder;
