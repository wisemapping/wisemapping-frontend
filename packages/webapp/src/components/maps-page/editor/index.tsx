import React from 'react';
import Toolbar from './toolbar';
import ActionDispatcher from '../action-dispatcher';
import { ActionType } from '../action-chooser';
import { useIntl } from 'react-intl';


export type EditorPropsType = {
    mapId: number;
    memoryPersistence: boolean;
    readOnlyMode: boolean;
};

// HACK. In order to work, we need to load externally the "loader.js" script from mindplot
// TODO: create the Editor component in the editor package, with its own build and include it instead
export default function Editor({ mapId, memoryPersistence, readOnlyMode  } : EditorPropsType): React.ReactElement {
    const intl = useIntl();
    const [activeDialog, setActiveDialog] = React.useState<ActionType | null>(null);

    return <>
        <div id="header">
            <Toolbar 
                memoryPersistence={memoryPersistence}
                readOnlyMode={readOnlyMode}
                onAction={setActiveDialog} />
        </div>
        <div id="mindplot"></div>
        <div id="floating-panel">
            <div id="keyboardShortcuts" className="buttonExtOn">
                <img src="../../images/editor/keyboard.svg"/>
            </div>
            <div id="zoom-button">
                <button id="zoom-plus">
                    <img src="../../images/editor/add.svg" />
                </button>
                <button id="zoom-minus">
                    <img src="../../images/editor/minus.svg" />
                </button>
            </div>
            <div id="position">
                <button id="position-button">
                    <img src="../../images/editor/center_focus.svg" />
                </button>
            </div>
        </div>
        <div id="bottom-logo"></div>
        <div id="headerNotifier"></div>
        {
            memoryPersistence && <div id="tryInfoPanel">
            <p>
                { intl.formatMessage({ id: 'editor.try-welcome' }) }
            </p>
            <p>{ intl.formatMessage({ id: 'editor.try-welcome-description' }) }</p>
            <a href="/c/registration">
                <div className="actionButton">
                    { intl.formatMessage({ id: 'login.signup', defaultMessage: 'Sign Up' }) }
                </div>
            </a>
        </div>
        }
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

