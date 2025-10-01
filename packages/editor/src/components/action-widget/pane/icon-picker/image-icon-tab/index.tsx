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

import Box from '@mui/material/Box';
import React, { ReactElement } from 'react';
import iconGroups from './iconGroups.json';
import { SvgImageIcon } from '@wisemapping/mindplot';
import NodeProperty from '../../../../../classes/model/node-property';
import { SvgIcon } from './styled';

type IconImageTab = {
  iconModel: NodeProperty<string | undefined>;
  triggerClose: () => void;
};
const IconImageTab = ({ iconModel, triggerClose }: IconImageTab): ReactElement => {
  return (
    <Box sx={{ width: '450px' }}>
      {iconGroups.map((family, i) => (
        <span key={i}>
          {family.icons.map((icon: string) => (
            <SvgIcon
              key={icon}
              src={SvgImageIcon.getImageUrl(icon)}
              onClick={() => {
                const setValue = iconModel.setValue;
                if (setValue) {
                  setValue(`image:${icon}`);
                }
                triggerClose();
              }}
            />
          ))}
        </span>
      ))}
    </Box>
  );
};
export default IconImageTab;
