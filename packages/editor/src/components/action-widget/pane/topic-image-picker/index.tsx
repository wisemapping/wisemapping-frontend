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
import { Box, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ImageIcon from '@mui/icons-material/Image';
import { FormattedMessage, useIntl } from 'react-intl';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

import NodeProperty from '../../../../classes/model/node-property';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';
import TopicImageTab from './image-icon-tab';
import { StyledEditorsTabs } from '../shared/StyledTabs';
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
      <IconButton
        onClick={triggerClose}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
          width: 24,
          height: 24,
          '& .MuiSvgIcon-root': {
            fontSize: '16px',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      {/* Tabs at the top */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          p: 0,
        }}
      >
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
      </Box>

      {/* Content area */}
      <Box
        sx={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
        }}
      >
        {tabValue === 0 && (
          <Box
            sx={{
              width: 'clamp(240px, 85vw, 320px)',
              height: 'clamp(280px, 50vh, 350px)',
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <TopicImageTab iconModel={iconsGalleryModel} emojiModel={emojiModel} />
          </Box>
        )}
        {tabValue === 1 && (
          <Box
            sx={{
              width: 'clamp(240px, 85vw, 320px)',
              height: 'clamp(280px, 50vh, 350px)',
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              lazyLoadEmojis={true}
              autoFocusSearch={true}
              previewConfig={{ showPreview: false }}
              emojiStyle={EmojiStyle.NATIVE}
              skinTonesDisabled
              theme={mode === 'dark' ? Theme.DARK : Theme.LIGHT}
              width="100%"
              height="100%"
              searchPlaceholder={intl.formatMessage({
                id: 'emoji-picker.search-placeholder',
                defaultMessage: 'Search emojis...',
              })}
            />
          </Box>
        )}
      </Box>
    </StyledEditorContainer>
  );
};
export default TopicImagePicker;
