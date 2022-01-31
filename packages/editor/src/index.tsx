import React from 'react';
import Toolbar, { ToolbarActionType } from './components/toolbar';
import Footer from './components/footer';
import { IntlProvider } from 'react-intl';
import { $notify, buildDesigner, LocalStorageManager, PersistenceManager, RESTPersistenceManager, DesignerOptionsBuilder } from '@wisemapping/mindplot';

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
}

export type EditorPropsType = {
    initCallback?: () => void;
    mapId: number;
    memoryPersistence: boolean;
    readOnlyMode: boolean;
    locale?: string;
    onAction: (action: ToolbarActionType) => void;
};

const initMindplot = () => {

    // Change page title ...
    document.title = `${global.mapTitle} | WiseMapping `

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
        zoom: zoomParam || (global.userOptions?.zoom != undefined ? Number.parseFloat(global.userOptions.zoom as string) : 0.8),
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

    React.useEffect(initCallback, []);

    return (
        <IntlProvider locale={locale} defaultLocale="en" messages={{}}>
            <div id="header">
                <Toolbar
                    memoryPersistence={memoryPersistence}
                    readOnlyMode={readOnlyMode}
                    onAction={onAction}
                />
            </div>
            <div id="mindplot"></div>
            <Footer showTryPanel={memoryPersistence} />
        </IntlProvider>
    );
}