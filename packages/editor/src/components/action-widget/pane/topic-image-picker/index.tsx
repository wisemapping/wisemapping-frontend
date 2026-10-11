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
import { FormattedMessage, useIntl } from 'react-intl';
import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from '../shared/emoji-picker';

import NodeProperty from '../../../../classes/model/node-property';
import { DesignerKeyboard } from '@wisemapping/mindplot';
import TopicImageTab from './image-icon-tab';
import { StyledEditorsTabs } from '../shared/StyledTabs';
import {
  PickerCloseButton,
  PickerContent,
  PickerEmojiArea,
  PickerScrollArea,
  PickerTabsBar,
} from '../shared/StyledPicker';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';
import { useTheme } from '../../../../contexts/ThemeContext';

type TopicImagePickerProp = {
  triggerClose: () => void;
  emojiModel: NodeProperty<string | undefined>;
  iconsGalleryModel: NodeProperty<string | undefined>;
};

const TopicImagePicker = ({
  triggerClose,
  emojiModel,
  iconsGalleryModel,
}: TopicImagePickerProp): ReactElement => {
  const [tabValue, setTabValue] = React.useState(0); // 0 = Image Gallery, 1 = Emojis
  const { mode } = useTheme();
  const intl = useIntl();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Review ...
  useEffect(() => {
    DesignerKeyboard.pause();
    return () => {
      DesignerKeyboard.resume();
    };
  }, []);

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    const emojiChar = emoji.emoji;
    const setEmojiValue = emojiModel.setValue;
    const setIconsValue = iconsGalleryModel.setValue;

    if (setEmojiValue) {
      setEmojiValue(emojiChar); // Store just the emoji character
    }

    // Clear the icons gallery when emoji is selected
    if (setIconsValue) {
      setIconsValue(undefined);
    }

    // Don't close the picker - allow multiple emoji selections
    // triggerClose();
  };

  return (
    <StyledEditorContainer>
      <PickerCloseButton onClick={triggerClose}>
        <CloseIcon />
      </PickerCloseButton>
      {/* Tabs at the top */}
      <PickerTabsBar>
        <StyledEditorsTabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          centered
          aria-label="icon picker tabs"
        >
          <Tab
            icon={<ImageIcon />}
            label={<FormattedMessage id="icon-picker.icons" defaultMessage="Icons Gallery" />}
            iconPosition="start"
          />
          <Tab
            icon={<SentimentSatisfiedAltIcon />}
            label={<FormattedMessage id="icon-picker.emojis" defaultMessage="Emojis" />}
            iconPosition="start"
          />
        </StyledEditorsTabs>
      </PickerTabsBar>

      {/* Content area */}
      <PickerContent>
        {tabValue === 0 && (
          <PickerScrollArea>
            <TopicImageTab iconModel={iconsGalleryModel} emojiModel={emojiModel} />
          </PickerScrollArea>
        )}
        {tabValue === 1 && (
          <PickerEmojiArea>
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              theme={mode === 'dark' ? 'dark' : 'light'}
              searchPlaceholder={intl.formatMessage({
                id: 'emoji-picker.search-placeholder',
                defaultMessage: 'Search emojis...',
              })}
            />
          </PickerEmojiArea>
        )}
      </PickerContent>
    </StyledEditorContainer>
  );
};
export default TopicImagePicker;
