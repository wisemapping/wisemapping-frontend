import EditorOptions from '@wisemapping/editor';
import AppConfig from '../../classes/app-config';

export default class EditorOptionsBulder {
    static build(locale: string, hotkeys: boolean, isTryMode: boolean): { options: EditorOptions, mapId: number } {

        let options: EditorOptions = {
            editorKeyboardEnabled: hotkeys,
            locale: locale,
            mode: isTryMode ? 'showcase' : 'editor',
        };

        let mapId: number;
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
            mapId = global.mapId;
        } else {
            // Running in a development mode.
            console.log('Running editor in development mode');
            options = {
                zoom: 0.8,
                locked: false,
                mapTitle: "Develop Mindnap",
                ...options
            }
            mapId = 666;
        }
        return { options, mapId };
    }
}