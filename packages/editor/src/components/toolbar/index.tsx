import React from 'react';
import { useIntl } from 'react-intl';

import BackIconSvg from '../../../images/back-icon.svg';
import SaveSvg from '../../../images/save.svg';
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
import './global-styled.css';

import { HeaderContainer, ToolbarButton, ToolbarButtonExt, ToolbarRightContainer } from './styled';
import ActionButton from '../action-button';
import { EditorRenderMode } from '@wisemapping/mindplot';

export type ToolbarActionType = 'export' | 'publish' | 'history' | 'print' | 'share';

export type ToolbarPropsType = {
    editorMode: EditorRenderMode;
    onAction: (action: ToolbarActionType) => void;
};

export default function Toolbar({
    editorMode: editorMode,
    onAction,
}: ToolbarPropsType): React.ReactElement {
    const intl = useIntl();
    return (
        <HeaderContainer className="wise-editor">
            <div id="toolbar">
                <div id="backToList">
                    <img src={BackIconSvg} />
                </div>
                {(editorMode === 'edition-editor' || editorMode === 'edition-owner') && (
                    <div id="persist" className="buttonContainer">
                        <ToolbarButton id="save" className="buttonOn">
                            <img src={SaveSvg} />
                        </ToolbarButton>
                    </div>
                )}
                {(editorMode === 'edition-editor' || editorMode === 'edition-owner' || editorMode === 'showcase') && (
                    <>
                        <div id="edit" className="buttonContainer">
                            <ToolbarButton id="undoEdition" className="buttonOn">
                                <img src={UndoSvg} />
                            </ToolbarButton>
                            <ToolbarButton id="redoEdition" className="buttonOn">
                                <img src={RedoSvg} />
                            </ToolbarButton>
                        </div>
                        <div id="nodeStyle" className="buttonContainer">
                            <ToolbarButton id="addTopic" className="buttonOn">
                                <img src={TopicAddSvg} />
                            </ToolbarButton>
                            <ToolbarButton id="deleteTopic" className="buttonOn">
                                <img src={TopicDeleteSvg} />
                            </ToolbarButton>
                            <ToolbarButtonExt id="topicBorder" className="buttonExtOn">
                                <img src={TopicBorderSvg} />
                            </ToolbarButtonExt>
                            <ToolbarButtonExt id="topicColor" className="buttonExtOn">
                                <img src={TopicColorSvg} />
                            </ToolbarButtonExt>
                            <ToolbarButtonExt id="topicShape" className="buttonExtOn">
                                <img src={TopicShapeSvg} />
                            </ToolbarButtonExt>
                        </div>
                        <div id="font" className="buttonContainer">
                            <ToolbarButton id="fontFamily" className="buttonOn">
                                <img src={FontTypeSvg} />
                            </ToolbarButton>
                            <ToolbarButtonExt id="fontSize" className="buttonExtOn">
                                <img src={FontSizeSvg} />
                            </ToolbarButtonExt>
                            <ToolbarButton id="fontBold" className="buttonOn">
                                <img src={FontBoldSvg} />
                            </ToolbarButton>
                            <ToolbarButton id="fontItalic" className="buttonOn">
                                <img src={FontItalicSvg} />
                            </ToolbarButton>
                            <ToolbarButtonExt id="fontColor" className="buttonExtOn">
                                <img src={FontColorSvg} />
                            </ToolbarButtonExt>
                        </div>
                        <div id="nodeContent" className="buttonContainer">
                            <ToolbarButtonExt id="topicIcon" className="buttonExtOn">
                                <img src={TopicIconSvg} />
                            </ToolbarButtonExt>
                            <ToolbarButton id="topicNote" className="buttonOn">
                                <img src={TopicNoteSvg} />
                            </ToolbarButton>
                            <ToolbarButton id="topicLink" className="buttonOn">
                                <img src={TopicLinkSvg} />
                            </ToolbarButton>
                            <ToolbarButton id="topicRelation" className="buttonOn">
                                <img src={TopicRelationSvg} />
                            </ToolbarButton>
                        </div>
                        <div id="separator" className="buttonContainer"></div>
                    </>
                )}
                <ToolbarRightContainer>
                    <ToolbarButton
                        id="export"
                        className="buttonOn"
                        onClick={() => onAction('export')}
                    >
                        <img src={ExportSvg} />
                    </ToolbarButton>
                    {(editorMode === 'edition-owner' || editorMode === 'edition-editor' || editorMode === 'edition-viewer') && (
                        <ToolbarButton
                            id="print"
                            className="buttonOn"
                            onClick={() => onAction('print')}
                        >
                            <img src={PrintSvg} />
                        </ToolbarButton>
                    )}
                    {editorMode === 'edition-owner' && (
                        <>
                            <ToolbarButton
                                id="history"
                                className="buttonOn"
                                onClick={() => onAction('history')}
                            >
                                <img src={HistorySvg} />
                            </ToolbarButton>
                            <ToolbarButton
                                id="publishIt"
                                className="buttonOn"
                                onClick={() => onAction('publish')}
                            >
                                <img src={PublicSvg} />
                            </ToolbarButton>
                        </>
                    )}
                    {(editorMode === 'edition-owner' || editorMode === 'edition-editor') && (
                        <ToolbarButton id="account">
                            <img src={AccountSvg} />
                        </ToolbarButton>
                    )}
                    {editorMode === 'edition-owner' && (
                        <ActionButton onClick={() => onAction('share')}>
                            {intl.formatMessage({ id: 'action.share', defaultMessage: 'Share' })}
                        </ActionButton>

                    )}
                </ToolbarRightContainer>
            </div>
        </HeaderContainer>
    );
}
