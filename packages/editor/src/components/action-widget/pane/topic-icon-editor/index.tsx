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
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ImageIcon from '@mui/icons-material/Image';
import { FormattedMessage } from 'react-intl';
import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from '../shared/emoji-picker';
import { DesignerKeyboard } from '@wisemapping/mindplot';
import { useTheme } from '../../../../contexts/ThemeContext';
import NodeProperty from '../../../../classes/model/node-property';
import IconImageTab from '../icon-picker/image-icon-tab';
import { StyledEditorsTabs } from '../shared/StyledTabs';
import {
  PickerCloseButton,
  PickerContent,
  PickerEmojiArea,
  PickerScrollArea,
  PickerTabsBar,
} from '../shared/StyledPicker';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';

type TopicIconEditorProps = {
  closeModal: () => void;
  iconModel: NodeProperty<string | undefined>;
};

const TopicIconEditor = ({ closeModal, iconModel }: TopicIconEditorProps): ReactElement => {
  const [tabValue, setTabValue] = React.useState(0); // 0 = Emojis, 1 = Icons Gallery
  const { mode } = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    DesignerKeyboard.pause();
    return () => {
      DesignerKeyboard.resume();
    };
  }, []);

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    const emojiChar = emoji.emoji;
    const setValue = iconModel.setValue;
    if (setValue) {
      setValue(`emoji:${emojiChar}`);
    }
  };

  return (
    <StyledEditorContainer>
      <PickerCloseButton onClick={closeModal}>
        <CloseIcon />
      </PickerCloseButton>

      {/* Tabs */}
      <PickerTabsBar>
        <StyledEditorsTabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          centered
          aria-label="icon editor tabs"
        >
          <Tab
            icon={<SentimentSatisfiedAltIcon />}
            label={<FormattedMessage id="icon-picker.emojis" defaultMessage="Emojis" />}
            iconPosition="start"
          />
          <Tab
            icon={<ImageIcon />}
            label={<FormattedMessage id="icon-picker.icons" defaultMessage="Icons Gallery" />}
            iconPosition="start"
          />
        </StyledEditorsTabs>
      </PickerTabsBar>

      {/* Content area */}
      <PickerContent>
        {tabValue === 0 && (
          <PickerEmojiArea>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              theme={mode === 'dark' ? 'dark' : 'light'}
            />
          </PickerEmojiArea>
        )}
        {tabValue === 1 && (
          <PickerScrollArea>
            <IconImageTab iconModel={iconModel} />
          </PickerScrollArea>
        )}
      </PickerContent>
    </StyledEditorContainer>
  );
};

export default TopicIconEditor;
