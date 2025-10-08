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
import { Box, Tabs, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ImageIcon from '@mui/icons-material/Image';
import { FormattedMessage } from 'react-intl';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';
import { useTheme } from '../../../../contexts/ThemeContext';
import NodeProperty from '../../../../classes/model/node-property';
import IconImageTab from '../icon-picker/image-icon-tab';

type TopicIconEditorProps = {
  closeModal: () => void;
  iconModel: NodeProperty<string | undefined>;
};

const TopicIconEditor = ({ closeModal, iconModel }: TopicIconEditorProps): ReactElement => {
  const [tabValue, setTabValue] = React.useState(0); // 0 = Emojis, 1 = Icons Gallery
  const { mode } = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
        height: '500px',
        minHeight: '500px',
        maxHeight: '500px',
        backgroundColor: 'background.paper',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={closeModal}
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

      {/* Tabs */}
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
            icon={<SentimentSatisfiedAltIcon />}
            label={<FormattedMessage id="icon-picker.emojis" defaultMessage="Emojis" />}
            iconPosition="start"
          />
          <Tab
            icon={<ImageIcon />}
            label={<FormattedMessage id="icon-picker.icons" defaultMessage="Icons Gallery" />}
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
            />
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
            <IconImageTab iconModel={iconModel} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TopicIconEditor;
