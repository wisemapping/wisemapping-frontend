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
import React, { ReactElement, useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MapInfo from '../../../../classes/model/map-info';
import { TitleInput } from './styled';
import DesignerKeyboard from '@wisemapping/mindplot/src/components/DesignerKeyboard';

type MapTitleProp = {
  mapInfo: MapInfo;
};

type Status = 'disabled' | 'enabled' | 'active-edition';

const MapTitle = ({ mapInfo }: MapTitleProp): ReactElement => {
  const [state, setState] = useState<Status>('disabled');
  const [title, setTitle] = useState<string>(mapInfo.getTitle());

  useEffect(() => {
    if (state === 'active-edition') {
      DesignerKeyboard.pause();
    } else {
      DesignerKeyboard.resume();
    }
  }, [state]);

  const handleOnMouseEnter = (): void => {
    if (state === 'disabled') {
      setState('enabled');
    }
  };

  const handleOnMouseLeave = (): void => {
    if (state === 'enabled') {
      setState('disabled');
    }
  };
  const handleOnClick = (): void => {
    setState('active-edition');
  };

  const handleSubmit = (e: React.KeyboardEvent): void => {
    console.log(e.key);
    if (e.key === 'Enter') {
      setState('disabled');
    }
  };

  return (
    <Tooltip title={title}>
      <span onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave}>
        {state === 'disabled' ? (
          <Typography
            className="truncated"
            variant="body1"
            component="div"
            sx={{ marginX: '1.5rem' }}
          >
            {title}
          </Typography>
        ) : (
          <TitleInput
            style={{ width: title.length + 'ch' }}
            onClick={handleOnClick}
            value={title}
            onKeyDown={handleSubmit}
            onChange={(event) => setTitle(event.target.value)}
            id="title-input"
          />
        )}
      </span>
    </Tooltip>
  );
};

export default MapTitle;
