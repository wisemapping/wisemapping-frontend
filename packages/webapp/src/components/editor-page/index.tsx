import React from 'react';
import ActionDispatcher from '../maps-page/action-dispatcher';
import { ActionType } from '../maps-page/action-chooser';
import Editor from '@wisemapping/editor';
import AppI18n from '../../classes/app-i18n';

export type EditorPropsType = {
    mapId: number;
    isTryMode: boolean;
};

const EditorPage = ({ mapId, ...props }: EditorPropsType): React.ReactElement => {
    const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);

    // Load user locale ...
    const userLocale = AppI18n.getUserLocale();

    return <>
        <Editor {...props} onAction={setActiveDialog} locale={userLocale.code} />
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

