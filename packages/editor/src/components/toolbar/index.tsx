import React from 'react';
import { useIntl } from 'react-intl';

import BackIconSvg from '../../../images/back-icon.svg';
import SaveSvg from '../../../images/save.svg';
import DiscardSvg from '../../../images/discard.svg';
import UndoSvg from '../../../images/undo.svg';
import RedoSvg from '../../../images/redo.svg';
import TopicAddSvg from '../../../images/topic-add.svg';
import TopicDeleteSvg from '../../../images/topic-delete.svg';
import TopicBorderSvg from '../../../images/topic-border.svg';
import TopicColorSvg from '../../../images/topic-color.svg';
import TopicShapeSvg from '../../../images/topic-shape.svg';
import FontTypeSvg from '../../../images/font-type.svg';
import FontSizeSvg from '../../../images/font-size.svg';
import FontBoldSvg from '../../../images/font-bold.svg';
import FontItalicSvg from '../../../images/font-italic.svg';
import FontColorSvg from '../../../images/font-color.svg';
import TopicIconSvg from '../../../images/topic-icon.svg';
import TopicNoteSvg from '../../../images/topic-note.svg';
import TopicLinkSvg from '../../../images/topic-link.svg';
import TopicRelationSvg from '../../../images/topic-relation.svg';
import ExportSvg from '../../../images/export.svg';
import PublicSvg from '../../../images/public.svg';
import HistorySvg from '../../../images/history.svg';
import PrintSvg from '../../../images/print.svg';
import AccountSvg from '../../../images/account.svg';

export type ToolbarActionType = 'export' | 'publish' | 'history' | 'print' | 'share';

export type ToolbarPropsType = {
    memoryPersistence: boolean;
    readOnlyMode: boolean;
    onAction: (action: ToolbarActionType) => void;
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
                <img src={BackIconSvg} />
            </div>
            {!memoryPersistence && (
                <div id="persist" className="buttonContainer">
                    <div id="save" className="buttonOn">
                        <img src={SaveSvg} />
                    </div>
                    <div id="discard" className="buttonOn">
                        <img src={DiscardSvg}/>
                    </div>
                </div>
            )}
            {!readOnlyMode && (
                <>
                    <div id="edit" className="buttonContainer">
                        <div id="undoEdition" className="buttonOn">
                            <img src={UndoSvg} />
                        </div>
                        <div id="redoEdition" className="buttonOn">
                            <img src={RedoSvg} />
                        </div>
                    </div>
                    <div id="nodeStyle" className="buttonContainer">
                        <div id="addTopic" className="buttonOn">
                            <img src={TopicAddSvg} />
                        </div>
                        <div id="deleteTopic" className="buttonOn">
                            <img src={TopicDeleteSvg} />
                        </div>
                        <div id="topicBorder" className="buttonExtOn">
                            <img src={TopicBorderSvg} />
                        </div>
                        <div id="topicColor" className="buttonExtOn">
                            <img src={TopicColorSvg} />
                        </div>
                        <div id="topicShape" className="buttonExtOn">
                            <img src={TopicShapeSvg} />
                        </div>
                    </div>
                    <div id="font" className="buttonContainer">
                        <div id="fontFamily" className="buttonOn">
                            <img src={FontTypeSvg} />
                        </div>
                        <div id="fontSize" className="buttonExtOn">
                            <img src={FontSizeSvg} />
                        </div>
                        <div id="fontBold" className="buttonOn">
                            <img src={FontBoldSvg} />
                        </div>
                        <div id="fontItalic" className="buttonOn">
                            <img src={FontItalicSvg} />
                        </div>
                        <div id="fontColor" className="buttonExtOn">
                            <img src={FontColorSvg} />
                        </div>
                    </div>
                    <div id="nodeContent" className="buttonContainer">
                        <div id="topicIcon" className="buttonExtOn">
                            <img src={TopicIconSvg} />
                        </div>
                        <div id="topicNote" className="buttonOn">
                            <img src={TopicNoteSvg} />
                        </div>
                        <div id="topicLink" className="buttonOn">
                            <img src={TopicLinkSvg} />
                        </div>
                        <div id="topicRelation" className="buttonOn">
                            <img src={TopicRelationSvg} />
                        </div>
                    </div>
                    <div id="separator" className="buttonContainer"></div>
                </>
            )}
            {!memoryPersistence && (
                <div id="toolbarRight">
                    <div id="export" className="buttonOn" onClick={() => onAction('export')}>
                        <img src={ExportSvg} />
                    </div>
                    <div id="publishIt" className="buttonOn" onClick={() => onAction('publish')}>
                        <img src={PublicSvg} />
                    </div>
                    <div id="history" className="buttonOn" onClick={() => onAction('history')}>
                        <img src={HistorySvg} />
                    </div>
                    <div id="print" className="buttonOn" onClick={() => onAction('print')}>
                        <img src={PrintSvg} />
                    </div>
                    <div id="account">
                        <img src={AccountSvg} />
                    </div>
                    <div id="share" className="actionButton" onClick={() => onAction('share')}>
                        { intl.formatMessage({ id: 'action.share', defaultMessage: 'Share' }) }
                    </div>
                </div>
            )}
        </div>
    );
}
