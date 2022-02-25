import React, { useEffect } from 'react';
import Toolbar, { ToolbarActionType } from './components/toolbar';
import Footer from './components/footer';
import { IntlProvider } from 'react-intl';
import {
    $notify,
    buildDesigner,
    PersistenceManager,
    DesignerOptionsBuilder,
    Designer,
    DesignerKeyboard,
    EditorRenderMode,
} from '@wisemapping/mindplot';
import './global-styled.css';
import I18nMsg from './classes/i18n-msg';
import Messages from '@wisemapping/mindplot/src/components/Messages';

declare global {
    // used in mindplot
    var designer: Designer;
    var accountEmail: string;
}

export type EditorOptions = {
    mode: EditorRenderMode,
    locale: string,
    zoom?: number,
    locked?: boolean,
    lockedMsg?: string;
    mapTitle: string;
    enableKeyboardEvents: boolean;
}

export type EditorProps = {
    mapId: string;
    options: EditorOptions;
    persistenceManager: PersistenceManager;
    onAction: (action: ToolbarActionType) => void;
    onLoad?: (designer: Designer) => void;
};

const Editor = ({
    mapId,
    options,
    persistenceManager,
    onAction,
    onLoad,
}: EditorProps) => {

    useEffect(() => {
        // Change page title ...
        document.title = `${options.mapTitle} | WiseMapping `;

        // Load mindmap ...
        const designer = onLoadDesigner(mapId, options, persistenceManager);
        // Has extended actions been customized ...
        if (onLoad) {
            onLoad(designer);
        }

        // Load mindmap ...
        const instance = PersistenceManager.getInstance();
        const mindmap = instance.load(mapId);
        designer.loadMap(mindmap);

        if (options.locked) {
            $notify(options.lockedMsg);
        }
    }, []);

    useEffect(() => {
        if (options.enableKeyboardEvents) {
            DesignerKeyboard.resume();
        } else {
            DesignerKeyboard.pause();
        }
    }, [options.enableKeyboardEvents]);

    useEffect(() => {
        Messages.init(options.locale);
    }, [options.locale]);

    const onLoadDesigner = (mapId: string, options: EditorOptions, persistenceManager: PersistenceManager): Designer => {
        const buildOptions = DesignerOptionsBuilder.buildOptions({
            persistenceManager,
            mode: options.mode,
            mapId: mapId,
            container: 'mindplot',
            zoom: options.zoom,
            locale: options.locale,
        });

        // Build designer ...
        return buildDesigner(buildOptions);
    };

    const locale = options.locale;
    const msg = I18nMsg.loadLocaleData(locale);
    return (
        <IntlProvider locale={locale} messages={msg}>
            {(options.mode !== 'viewonly') &&
                <Toolbar
                    editorMode={options.mode}
                    onAction={onAction}
                />
            }
            <div id="mindplot"></div>
            <Footer editorMode={options.mode} />
        </IntlProvider>
    );
}
export default Editor;
