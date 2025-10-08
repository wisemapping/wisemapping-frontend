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
import NodeProperty from '../../../../classes/model/node-property';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';
import TopicImageTab from './image-icon-tab';
import { FormattedMessage, useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ImageIcon from '@mui/icons-material/Image';
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

    triggerClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
        height: '500px',
        minHeight: '500px',
        maxHeight: '500px',
        backgroundColor: 'background.paper',
        borderRadius: '12px',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={triggerClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          width: 32,
          height: 32,
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          '& .MuiSvgIcon-root': {
            fontSize: '20px',
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
          backgroundColor: 'background.default',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: '48px',
            '& .MuiTab-root': {
              minHeight: '48px',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            },
            '& .Mui-selected': {
              color: 'primary.main !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
          }}
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
        </Tabs>
      </Box>

      {/* Content area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
        }}
      >
        {tabValue === 0 && (
          <Box
            sx={{
              width: '400px',
              height: '452px', // 500px - 48px (tab height)
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
              width: '400px',
              height: '452px', // 500px - 48px (tab height)
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
    </Box>
  );
};
export default TopicImagePicker;
