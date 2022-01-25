import React from 'react';
import { useIntl } from 'react-intl';
import ActionDispatcher from '../action-dispatcher';
import { ActionType } from '../action-chooser';
import WiseEditor from '@wisemapping/editor';

export type EditorPropsType = {
    mapId: number;
    memoryPersistence: boolean;
    readOnlyMode: boolean;
};

export default function Editor({ mapId, ...props } : EditorPropsType): React.ReactElement {
    const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);
    const intl = useIntl();
    return <>
        <WiseEditor {...props} onAction={setActiveDialog} locale={intl.locale} />
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

