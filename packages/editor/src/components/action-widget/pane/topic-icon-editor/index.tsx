/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { ReactElement, useEffect } from 'react';
import { EmojiClickData } from 'emoji-picker-react';
import { DesignerKeyboard } from '@wisemapping/mindplot';
import NodeProperty from '../../../../classes/model/node-property';
import EmojiChooser from '../shared/EmojiChooser';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';

type TopicIconEditorProps = {
  closeModal: () => void;
  iconModel: NodeProperty<string | undefined>;
};

const TopicIconEditor = ({ closeModal, iconModel }: TopicIconEditorProps): ReactElement => {
  useEffect(() => {
    DesignerKeyboard.pause();
    return () => {
      DesignerKeyboard.resume();
    };
  }, []);

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    const setValue = iconModel.setValue;
    if (setValue) {
      setValue(`emoji:${emoji.emoji}`);
    }
  };

  return (
    <StyledEditorContainer>
      <EmojiChooser onEmojiClick={handleEmojiSelect} onClose={closeModal} />
    </StyledEditorContainer>
  );
};

export default TopicIconEditor;
