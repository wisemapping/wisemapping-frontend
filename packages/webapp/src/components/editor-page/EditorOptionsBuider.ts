import { EditorOptions } from '@wisemapping/editor';
import AppConfig from '../../classes/app-config';

export default class EditorOptionsBulder {
    static build(locale: string, hotkeys: boolean, isTryMode: boolean): { options: EditorOptions, mapId: number } {

        let options: EditorOptions = {
            enableKeyboardEvents: hotkeys,
            locale: locale,
        };

        if (isTryMode) {
            // Sent to try mode ...
            options.mode = 'showcase';
        } else if (global.mindmapLocked) {
            // Map locked, open for view mode ...
            options.mode = 'viewonly';
        } else {
            options.mode = 'edition';
        }

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