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
import type { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from '../shared/emoji-picker';
import { DesignerKeyboard } from '@wisemapping/mindplot';
import IconImageTab from './image-icon-tab';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormattedMessage, useIntl } from 'react-intl';
import { PickerRoot, PickerEmojiFrame, PickerShowImages } from './styled';

type IconPickerProp = {
  triggerClose: () => void;
  iconModel: NodeProperty<string | undefined>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IconPicker = ({ triggerClose, iconModel }: IconPickerProp): ReactElement => {
  const [checked, setChecked] = React.useState(true);
  const intl = useIntl();

  const handleCheck = () => {
    setChecked(!checked);
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
    const setValue = iconModel.setValue;
    if (setValue) {
      setValue(`emoji:${emojiChar}`);
    }
    // Don't close the picker - allow multiple emoji selections
    // triggerClose();
  };

  return (
    <PickerRoot>
      {checked && (
        <PickerEmojiFrame>
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme="auto"
            searchPlaceholder={intl.formatMessage({
              id: 'emoji-picker.search-placeholder',
              defaultMessage: 'Search emojis...',
            })}
          />
        </PickerEmojiFrame>
      )}
      {!checked && <IconImageTab iconModel={iconModel} />}
      <PickerShowImages>
        <FormControlLabel
          label={<FormattedMessage id="icon-picker.show-images" defaultMessage="Show images" />}
          control={<Switch onChange={handleCheck} />}
        />
      </PickerShowImages>
    </PickerRoot>
  );
};
export default IconPicker;
