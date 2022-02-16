import React, { useEffect } from 'react';
import ActionDispatcher from '../maps-page/action-dispatcher';
import { ActionType } from '../maps-page/action-chooser';
import Editor from '@wisemapping/editor';
import AppI18n from '../../classes/app-i18n';
import { useSelector } from 'react-redux';
import { hotkeysEnabled } from '../../redux/editorSlice';
import ReactGA from 'react-ga';

export type EditorPropsType = {
    mapId: number;
    isTryMode: boolean;
};

const EditorPage = ({ mapId, ...props }: EditorPropsType): React.ReactElement => {
    const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);
    const hotkeys = useSelector(hotkeysEnabled);
    const userLocale = AppI18n.getUserLocale();

    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return <>
        <Editor {...props} onAction={setActiveDialog} locale={userLocale.code} hotkeys={hotkeys} />
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

