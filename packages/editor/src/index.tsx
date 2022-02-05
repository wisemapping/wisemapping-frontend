import React from 'react';
import Toolbar, { ToolbarActionType } from './components/toolbar';
import Footer from './components/footer';
import { IntlProvider } from 'react-intl';
import {
    $notify,
    buildDesigner,
    LocalStorageManager,
    PersistenceManager,
    RESTPersistenceManager,
    DesignerOptionsBuilder,
    Designer
} from '@wisemapping/mindplot';
import FR from './compiled-lang/fr.json';
import ES from './compiled-lang/es.json';
import EN from './compiled-lang/en.json';
import DE from './compiled-lang/de.json';


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
    initCallback?: () => void;
    mapId: number;
    memoryPersistence: boolean;
    readOnlyMode: boolean;
    locale?: string;
    onAction: (action: ToolbarActionType) => void;
};

function loadLocaleData(locale: string) {
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

const initMindplot = () => {
    // Change page title ...
    document.title = `${global.mapTitle} | WiseMapping `;

    // Configure persistence manager ...
    let persistence;
    if (!global.memoryPersistence && !global.readOnly) {
        persistence = new RESTPersistenceManager({
            documentUrl: '/c/restful/maps/{id}/document',
            revertUrl: '/c/restful/maps/{id}/history/latest',
            lockUrl: '/c/restful/maps/{id}/lock',
            timestamp: global.lockTimestamp,
            session: global.lockSession,
        });
    } else {
        persistence = new LocalStorageManager(
            `/c/restful/maps/{id}/${global.historyId ? `${global.historyId}/` : ''}document/xml${!global.isAuth ? '-pub' : ''
            }`,
            true
        );
    }

    const params = new URLSearchParams(window.location.search.substring(1));

    const zoomParam = Number.parseFloat(params.get('zoom'));
    const options = DesignerOptionsBuilder.buildOptions({
        persistenceManager: persistence,
        readOnly: Boolean(global.readOnly || false),
        mapId: String(global.mapId),
        container: 'mindplot',
        zoom:
            zoomParam ||
            (global.userOptions?.zoom != undefined
                ? Number.parseFloat(global.userOptions.zoom as string)
                : 0.8),
        locale: global.locale,
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

export default function Editor({
    initCallback = initMindplot,
    mapId,
    memoryPersistence,
    readOnlyMode,
    locale = 'en',
    onAction,
}: EditorPropsType): React.ReactElement {
    const [localeTranslation, setLocaleTranslation] = React.useState(null);
    React.useEffect(() => {
        if (localeTranslation && !global.designer) {
            initCallback();
        }
    }, [localeTranslation]);
    React.useEffect(() => {
        const loadAndSetLocale = async () => {
            setLocaleTranslation(await loadLocaleData(locale));
        };
        loadAndSetLocale();
    }, [locale])
    if (!localeTranslation) {
        return null;
    }
    return (
        <IntlProvider locale={locale} defaultLocale="en" messages={localeTranslation}>
            <Toolbar
                memoryPersistence={memoryPersistence}
                readOnlyMode={readOnlyMode}
                onAction={onAction}
            />
            <div id="mindplot"></div>
            <Footer showTryPanel={memoryPersistence} />
        </IntlProvider>
    );
}
