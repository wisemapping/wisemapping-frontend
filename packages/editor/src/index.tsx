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
} from '@wisemapping/mindplot';
import FR from './compiled-lang/fr.json';
import ES from './compiled-lang/es.json';
import EN from './compiled-lang/en.json';
import DE from './compiled-lang/de.json';
import './global-styled.css';
import { EditorModeType } from '@wisemapping/mindplot/src/components/DesignerOptionsBuilder';


declare global {
    // used in mindplot
    var designer: Designer;
    var accountEmail: string;
}

export type EditorOptions = {
    mode: EditorModeType,
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
    onAction: (action: ToolbarActionType) => void;
    persistenceManager: PersistenceManager;
    initCallback?: (mapId: string, options: EditorOptions, persistenceManager: PersistenceManager) => void;
};

const loadLocaleData = (locale: string) => {
    switch (locale) {
        case 'fr':
            return FR;
        case 'en':
            return EN;
        case 'es':
            return ES;
        case 'de':
            return DE;
        default:
            return EN;
    }
}

const defaultCallback = (mapId: string, options: EditorOptions, persistenceManager: PersistenceManager) => {
    // Change page title ...
    document.title = `${options.mapTitle} | WiseMapping `;

    const buildOptions = DesignerOptionsBuilder.buildOptions({
        persistenceManager,
        mode: options.mode,
        mapId: mapId,
        container: 'mindplot',
        zoom: options.zoom,
        locale: options.locale,
    });

    // Build designer ...
    const designer = buildDesigner(buildOptions);

    // Load map from XML file persisted on disk...
    const instance = PersistenceManager.getInstance();
    const mindmap = instance.load(mapId);
    designer.loadMap(mindmap);

    if (options.locked) {
        $notify(options.lockedMsg);
    }
};

const Editor = ({
    mapId,
    options,
    persistenceManager,
    initCallback = defaultCallback,
    onAction,
}: EditorProps) => {
    useEffect(() => {
        initCallback(mapId, options, persistenceManager);
    }, []);

    useEffect(() => {
        if (options.enableKeyboardEvents) {
            console.log("options.enableKeyboardEvents"+options.enableKeyboardEvents)
            DesignerKeyboard.resume();
        } else {
            DesignerKeyboard.pause();
        }
    }, [options.enableKeyboardEvents]);

    return (
        <IntlProvider locale={options.locale} messages={loadLocaleData(options.locale)}>
            <Toolbar
                isTryMode={options.mode === 'showcase'}
                onAction={onAction}
            />
            <div id="mindplot"></div>
            <Footer showTryPanel={options.mode === 'showcase'} />
        </IntlProvider>
    );
}
export default Editor;
