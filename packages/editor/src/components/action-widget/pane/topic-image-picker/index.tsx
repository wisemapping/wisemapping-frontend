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
import { useIntl } from 'react-intl';
import { EmojiClickData } from 'emoji-picker-react';
import { DesignerKeyboard } from '@wisemapping/mindplot';
import NodeProperty from '../../../../classes/model/node-property';
import EmojiChooser from '../shared/EmojiChooser';
import { StyledEditorContainer } from '../shared/StyledEditorContainer';

type TopicImagePickerProp = {
  triggerClose: () => void;
  emojiModel: NodeProperty<string | undefined>;
  /** Only cleared: maps made with the old icon gallery may still have one of its icons. */
  iconsGalleryModel: NodeProperty<string | undefined>;
};

const TopicImagePicker = ({
  triggerClose,
  emojiModel,
  iconsGalleryModel,
}: TopicImagePickerProp): ReactElement => {
  const intl = useIntl();

  useEffect(() => {
    DesignerKeyboard.pause();
    return () => {
      DesignerKeyboard.resume();
    };
  }, []);

  // The picker stays open: several emojis can be tried in a row.
  const handleEmojiSelect = (emoji: EmojiClickData) => {
    const setEmojiValue = emojiModel.setValue;
    const setIconsValue = iconsGalleryModel.setValue;
    if (setEmojiValue) {
      setEmojiValue(emoji.emoji);
    }
    // The emoji replaces the gallery icon the topic may still have.
    if (setIconsValue) {
      setIconsValue(undefined);
    }
  };

  return (
    <StyledEditorContainer>
      <EmojiChooser
        onEmojiClick={handleEmojiSelect}
        onClose={triggerClose}
        searchPlaceholder={intl.formatMessage({
          id: 'emoji-picker.search-placeholder',
          defaultMessage: 'Search emojis...',
        })}
      />
    </StyledEditorContainer>
  );
};
export default TopicImagePicker;
