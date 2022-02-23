import React, { useEffect } from 'react';
import ActionDispatcher from '../maps-page/action-dispatcher';
import { ActionType } from '../maps-page/action-chooser';
import Editor from '@wisemapping/editor';
import AppI18n from '../../classes/app-i18n';
import { useSelector } from 'react-redux';
import { hotkeysEnabled } from '../../redux/editorSlice';
import ReactGA from 'react-ga';
import Client from '../../classes/client';
import { activeInstance } from '../../redux/clientSlice';
import { PersistenceManager } from '@wisemapping/mindplot';
import EditorOptionsBulder from './EditorOptionsBuider';

export type EditorPropsType = {
    isTryMode: boolean;
};

const EditorPage = ({ isTryMode }: EditorPropsType): React.ReactElement => {
    const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);
    const hotkey = useSelector(hotkeysEnabled);
    const userLocale = AppI18n.getUserLocale();
    const client: Client = useSelector(activeInstance);
    const [persistenceManager, setPersistenceManager] = React.useState<PersistenceManager>();

    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
        const persistence = client.buildPersistenceManager(isTryMode);
        setPersistenceManager(persistence);
        return () => client.removePersistenceManager();
    }, []);

    // As temporal hack, editor properties are propagated from global variables...
    const { mapId, options } = EditorOptionsBulder.build(userLocale.code, hotkey, isTryMode);
    return persistenceManager ? (
        <>
            <Editor onAction={setActiveDialog}
                options={options}
                persistenceManager={persistenceManager}
                mapId={mapId} />
            {
                activeDialog &&
                <ActionDispatcher
                    action={activeDialog}
                    onClose={() => setActiveDialog(null)}
                    mapsId={[mapId]}
                    fromEditor
                />
            }
        </>) : <></>
}


export default EditorPage;

