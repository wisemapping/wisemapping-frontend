import React from 'react';
import Toolbar from './toolbar';
import ActionDispatcher from '../action-dispatcher';
import { ActionType } from '../action-chooser';


// this component is a hack. In order to work, we need to load externally the "loader.js" script from mindplot
// TODO: create the Editor component in the editor package, with its own build and include it instead
export default function Editor(): React.ReactElement {
    const memoryPersistence = false;
    const readOnlyMode = false;
    const mapId = 1;
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
            <p>TRY_WELCOME</p>
            <p>TRY_WELCOME_DESC</p>
            <a href="/c/registration"><div className="actionButton">
                SIGN_UP</div>
            </a>
        </div>
        }
        {
            activeDialog && 
            <ActionDispatcher
                    action={activeDialog}
                    onClose={() => setActiveDialog(null)}
                    mapsId={[mapId]}
                />
        }
    </>
}

