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
import TopicImageTab from '../topic-image-picker/image-icon-tab';
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
  // Review ...
  useEffect(() => {
    DesignerKeyboard.pause();
    return () => {
      DesignerKeyboard.resume();
    };
  }, []);

  return (
    <Box style={{ padding: '5px' }}>
      <TopicImageTab iconModel={iconModel} emojiModel={null} triggerClose={triggerClose} />
    </Box>
  );
};
export default IconPicker;
