import React from 'react';
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

declare global {
    var memoryPersistence: boolean;
    var readOnly: boolean;
    var lockTimestamp: string;
    var lockSession: string;
    var historyId: string;
    var isAuth: boolean;
    var mapId: number;
    var userOptions: { zoom: string | number } | null;
    var locale: string;
    var mindmapLocked: boolean;
    var mindmapLockedMsg: string;
    var mapTitle: string;

    // used in mindplot
    var designer: Designer;
    var accountEmail: string;
}

export type EditorPropsType = {
    initCallback?: (locale: string, persistenceManager: PersistenceManager) => void;
    mapId?: number;
    isTryMode: boolean;
    readOnlyMode: boolean;
    locale?: string;
    onAction: (action: ToolbarActionType) => void;
    hotkeys?: boolean;
    persistenceManager: PersistenceManager;
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

const initMindplot = (locale: string, persistenceManager: PersistenceManager) => {
    // Change page title ...
    document.title = `${global.mapTitle} | WiseMapping `;

    const params = new URLSearchParams(window.location.search.substring(1));

    const zoomParam = Number.parseFloat(params.get('zoom'));
    const options = DesignerOptionsBuilder.buildOptions({
        persistenceManager,
        readOnly: Boolean(global.readOnly || false),
        mapId: String(global.mapId),
        container: 'mindplot',
        zoom:
            zoomParam ||
            (global.userOptions?.zoom != undefined
                ? Number.parseFloat(global.userOptions.zoom as string)
                : 0.8),
        locale: locale,
    });

    // Build designer ...
    const designer = buildDesigner(options);

    // Load map from XML file persisted on disk...
    const instance = PersistenceManager.getInstance();
    const mindmap = instance.load(String(global.mapId));
    designer.loadMap(mindmap);

    if (global.mindmapLocked) {
        $notify(global.mindmapLockedMsg);
    }
};

const Editor = ({
    initCallback = initMindplot,
    mapId,
    isTryMode: isTryMode,
    locale = 'en',
    onAction,
    hotkeys = true,
    persistenceManager,
}: EditorPropsType): React.ReactElement => {
    React.useEffect(() => {
        initCallback(locale, persistenceManager);
    }, []);

    React.useEffect(() => {
        if (hotkeys) {
            DesignerKeyboard.resume();
        } else {
            DesignerKeyboard.pause();
        }
    }, [hotkeys]);

    return (
        <IntlProvider locale={locale} messages={loadLocaleData(locale)}>
            <Toolbar
                isTryMode={isTryMode}
                onAction={onAction}
            />
            <div id="mindplot"></div>
            <Footer showTryPanel={isTryMode} />
        </IntlProvider>
    );
}
export default Editor;
