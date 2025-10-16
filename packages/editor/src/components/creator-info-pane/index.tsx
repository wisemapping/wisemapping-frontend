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
import MapInfo from '../../classes/model/map-info';
import LogoTextBlackSvg from '../../../images/logo-text-black.svg';
import LogoTextWhiteSvg from '../../../images/pwrdby-white.svg';
import { CreatorInfoContainer, CreatorInfoText } from './styled';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '../../contexts/ThemeContext';

type CreatorInfoPanel = {
  mapInfo: MapInfo;
  showInfo?: boolean; // Control whether to show the text info (map name, creator)
};
const CreatorInfoPanel = ({ mapInfo, showInfo = true }: CreatorInfoPanel): ReactElement => {
  const { mode } = useTheme();
  const logoSrc = mode === 'dark' ? LogoTextWhiteSvg : LogoTextBlackSvg;

  return (
    <CreatorInfoContainer>
      <a href="https://www.wisemapping.com/" target="_blanc">
        <img
          src={logoSrc}
          aria-label="WiseMappping"
          style={{ float: 'left', paddingRight: '10px' }}
        />
      </a>
      {showInfo && (
        <CreatorInfoText>
          {mapInfo.getTitle().trim() != '' && (
            <>
              <b>
                <FormattedMessage id="creator-info-pane.description" defaultMessage="Description" />
                :{' '}
              </b>
              {mapInfo.getTitle()}
            </>
          )}
          <br />
          {mapInfo.getCreatorFullName() != '' && (
            <>
              <b>
                <FormattedMessage id="creator-info-pane.creator" defaultMessage="Creator" />:{' '}
              </b>
              {mapInfo.getCreatorFullName()}
            </>
          )}
        </CreatorInfoText>
      )}
    </CreatorInfoContainer>
  );
};

export default CreatorInfoPanel;
