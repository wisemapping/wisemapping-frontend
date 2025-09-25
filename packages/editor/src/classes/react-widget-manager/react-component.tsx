/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React from 'react';
import TopicLinkEditor from '../../components/action-widget/pane/topic-link-editor';
import TopicNoteEditor from '../../components/action-widget/pane/topic-note-editor';
import NodeProperty from '../model/node-property';

const linkContent = (
  linkModel: NodeProperty<string>,
  closeModal: () => void,
): React.ReactElement => {
  return <TopicLinkEditor closeModal={closeModal} urlModel={linkModel}></TopicLinkEditor>;
};

const noteContent = (
  noteModel: NodeProperty<string | undefined>,
  closeModal: () => void,
): React.ReactElement => {
  return <TopicNoteEditor closeModal={closeModal} noteModel={noteModel} />;
};

export { linkContent, noteContent };
