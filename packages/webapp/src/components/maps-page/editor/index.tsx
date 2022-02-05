import React from 'react';
import ActionDispatcher from '../action-dispatcher';
import { ActionType } from '../action-chooser';
import WiseEditor from '@wisemapping/editor';
import AppI18n from '../../../classes/app-i18n';

export type EditorPropsType = {
    mapId: number;
    memoryPersistence: boolean;
    readOnlyMode: boolean;
};

export default function Editor({ mapId, ...props }: EditorPropsType): React.ReactElement {
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

