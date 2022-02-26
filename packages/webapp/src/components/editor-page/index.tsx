import React, { useEffect } from 'react';
import ActionDispatcher from '../maps-page/action-dispatcher';
import { ActionType } from '../maps-page/action-chooser';
import Editor from '@wisemapping/editor';
import AppI18n from '../../classes/app-i18n';
import { useSelector } from 'react-redux';
import { hotkeysEnabled } from '../../redux/editorSlice';
import ReactGA from 'react-ga';
import Client from '../../classes/client';
import { activeInstance, fetchAccount } from '../../redux/clientSlice';
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
    const { mapId, options } = EditorOptionsBulder.build(userLocale.code, hotkey, isTryMode);

    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    // Account settings can be null and editor cannot be initilized multiple times. This creates problems
    // at the i18n resource loading.
    const persistence = client.buildPersistenceManager(options.mode);
    const loadCompleted = persistence && (options.mode === 'showcase' || fetchAccount());

    return loadCompleted ? (
        <>
            <Editor onAction={setActiveDialog}
                options={options}
                persistenceManager={persistence}
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

