import React from 'react';
import { useIntl } from 'react-intl';
import { ActionType } from '../action-chooser';

export type ToolbarPropsType = {
    memoryPersistence: boolean;
    readOnlyMode: boolean;
    onAction: (action: ActionType) => void;
};

export default function Toolbar({
    memoryPersistence,
    readOnlyMode,
    onAction,
}: ToolbarPropsType): React.ReactElement {
    const intl = useIntl();
    return (
        <div id="toolbar">
            <div id="backToList">
                <img src="../../images/editor/back-icon.svg" />
            </div>
            {!memoryPersistence && (
                <div id="persist" className="buttonContainer">
                    <div id="save" className="buttonOn">
                        <img src="../../images/editor/save.svg" />
                    </div>
                    <div id="discard" className="buttonOn">
                        <img src="../../images/editor/discard.svg" />
                    </div>
                </div>
            )}
            {!readOnlyMode && (
                <>
                    <div id="edit" className="buttonContainer">
                        <div id="undoEdition" className="buttonOn">
                            <img src="../../images/editor/undo.svg" />
                        </div>
                        <div id="redoEdition" className="buttonOn">
                            <img src="../../images/editor/redo.svg" />
                        </div>
                    </div>
                    <div id="nodeStyle" className="buttonContainer">
                        <div id="addTopic" className="buttonOn">
                            <img src="../../images/editor/topic-add.svg" />
                        </div>
                        <div id="deleteTopic" className="buttonOn">
                            <img src="../../images/editor/topic-delete.svg" />
                        </div>
                        <div id="topicBorder" className="buttonExtOn">
                            <img src="../../images/editor/topic-border.svg" />
                        </div>
                        <div id="topicColor" className="buttonExtOn">
                            <img src="../../images/editor/topic-color.svg" />
                        </div>
                        <div id="topicShape" className="buttonExtOn">
                            <img src="../../images/editor/topic-shape.svg" />
                        </div>
                    </div>
                    <div id="font" className="buttonContainer">
                        <div id="fontFamily" className="buttonOn">
                            <img src="../../images/editor/font-type.svg" />
                        </div>
                        <div id="fontSize" className="buttonExtOn">
                            <img src="../../images/editor/font-size.svg" />
                        </div>
                        <div id="fontBold" className="buttonOn">
                            <img src="../../images/editor/font-bold.svg" />
                        </div>
                        <div id="fontItalic" className="buttonOn">
                            <img src="../../images/editor/font-italic.svg" />
                        </div>
                        <div id="fontColor" className="buttonExtOn">
                            <img src="../../images/editor/font-color.svg" />
                        </div>
                    </div>
                    <div id="nodeContent" className="buttonContainer">
                        <div id="topicIcon" className="buttonExtOn">
                            <img src="../../images/editor/topic-icon.svg" />
                        </div>
                        <div id="topicNote" className="buttonOn">
                            <img src="../../images/editor/topic-note.svg" />
                        </div>
                        <div id="topicLink" className="buttonOn">
                            <img src="../../images/editor/topic-link.svg" />
                        </div>
                        <div id="topicRelation" className="buttonOn">
                            <img src="../../images/editor/topic-relation.svg" />
                        </div>
                    </div>
                    <div id="separator" className="buttonContainer"></div>
                </>
            )}
            {!memoryPersistence && (
                <div id="toolbarRight">
                    <div id="export" className="buttonOn" onClick={() => onAction('export')}>
                        <img src="../../images/editor/export.svg" />
                    </div>
                    <div id="publishIt" className="buttonOn" onClick={() => onAction('publish')}>
                        <img src="../../images/editor/public.svg" />
                    </div>
                    <div id="history" className="buttonOn" onClick={() => onAction('history')}>
                        <img src="../../images/editor/history.svg" />
                    </div>
                    <div id="print" className="buttonOn" onClick={() => onAction('print')}>
                        <img src="../../images/editor/print.svg" />
                    </div>
                    <div id="account">
                        <img src="../../images/editor/account.svg" />
                    </div>
                    <div id="share" className="actionButton" onClick={() => onAction('share')}>
                        { intl.formatMessage({ id: 'action.share', defaultMessage: 'Share' }) }
                    </div>
                </div>
            )}
        </div>
    );
}
