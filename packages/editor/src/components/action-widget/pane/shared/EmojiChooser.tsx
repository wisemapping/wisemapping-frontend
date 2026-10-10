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

import React, { ReactElement } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../../../contexts/ThemeContext';

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 10,
  width: 24,
  height: 24,
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
});

const PickerFrame = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 'clamp(280px, 50vh, 350px)',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  '& .EmojiPickerReact': { '--epr-emoji-size': '22px' } as object,
}));

type EmojiChooserProps = {
  onEmojiClick: (emoji: EmojiClickData) => void;
  onClose: () => void;
  searchPlaceholder?: string;
};

/**
 * The one way to pick an icon for a topic: an emoji. The icon editor and the topic image picker
 * show it as their whole content. (The old SVG gallery is gone for new icons; maps that already
 * use it still draw it.)
 */
const EmojiChooser = ({
  onEmojiClick,
  onClose,
  searchPlaceholder,
}: EmojiChooserProps): ReactElement => {
  const { mode } = useTheme();
  return (
    <>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      <PickerFrame>
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          lazyLoadEmojis={true}
          autoFocusSearch={true}
          previewConfig={{ showPreview: false }}
          emojiStyle={EmojiStyle.NATIVE}
          skinTonesDisabled
          theme={mode === 'dark' ? Theme.DARK : Theme.LIGHT}
          width="100%"
          height="100%"
          searchPlaceholder={searchPlaceholder}
        />
      </PickerFrame>
    </>
  );
};

export default EmojiChooser;
