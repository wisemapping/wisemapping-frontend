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
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ImageIcon from '@mui/icons-material/Image';
import { FormattedMessage } from 'react-intl';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';
import { useTheme } from '../../../../contexts/ThemeContext';
import NodeProperty from '../../../../classes/model/node-property';
import IconImageTab from '../icon-picker/image-icon-tab';
import { StyledEditorsTabs } from '../shared/StyledTabs';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';

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
    <StyledEditorContainer>
      <IconButton
        onClick={closeModal}
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

      {/* Tabs */}
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
              width: 'clamp(240px, 85vw, 320px)',
              height: 'clamp(280px, 50vh, 350px)',
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <IconImageTab iconModel={iconModel} />
          </Box>
        )}
      </Box>
    </StyledEditorContainer>
  );
};

export default TopicIconEditor;
