/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import React, { ReactElement, useEffect } from 'react';
import NodeProperty from '../../../../classes/model/node-property';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';
import IconImageTab from './image-icon-tab';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';

type IconPickerProp = {
  triggerClose: () => void;
  iconModel: NodeProperty<string | undefined>;
};

const IconPicker = ({ triggerClose, iconModel }: IconPickerProp): ReactElement => {
  const [checked, setChecked] = React.useState(true);

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
    triggerClose();
  };

  return (
    <Box style={{ padding: '5px' }}>
      {checked && (
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          lazyLoadEmojis={true}
          autoFocusSearch={true}
          previewConfig={{ showPreview: false }}
          emojiStyle={EmojiStyle.NATIVE}
          skinTonesDisabled
        />
      )}
      {!checked && <IconImageTab iconModel={iconModel} triggerClose={triggerClose} />}
      <FormGroup sx={{ float: 'right' }}>
        <FormControlLabel
          label={<FormattedMessage id="icon-picker.show-images" defaultMessage="Show images" />}
          control={<Switch onChange={handleCheck} />}
        />
      </FormGroup>
    </Box>
  );
};
export default IconPicker;
