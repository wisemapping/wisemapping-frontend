import React from 'react';
import ActionDispatcher from '../maps-page/action-dispatcher';
import { ActionType } from '../maps-page/action-chooser';
import WiseEditor from '@wisemapping/editor';
import AppI18n from '../../classes/app-i18n';

export type EditorPropsType = {
    mapId: number;
    memoryPersistence: boolean;
    readOnlyMode: boolean;
};

const EditorPage = ({ mapId, ...props }: EditorPropsType): React.ReactElement => {
    const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);

    // Load user locale ...
    const appi18n = new AppI18n();
    const userLocale = appi18n.getUserLocale();

    return <>
        <WiseEditor {...props} onAction={setActiveDialog} locale={userLocale.code} />
        {
            activeDialog &&
            <ActionDispatcher
                action={activeDialog}
                onClose={() => setActiveDialog(null)}
                mapsId={[mapId]}
                fromEditor
            />
        }
    </>
}

export default EditorPage;

