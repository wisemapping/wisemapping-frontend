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
import React, { ReactElement } from 'react';
import MapInfo from '../../classes/model/map-info';
import LogoTextBlackSvg from '../../../images/logo-text-black.svg';
import { CreatorInfoContainer, CreatorInfoText } from './styled';
import { FormattedMessage } from 'react-intl';

type CreatorInfoPanel = {
  mapInfo: MapInfo;
};
const CreatorInfoPanel = ({ mapInfo }: CreatorInfoPanel): ReactElement => {
  return (
    <CreatorInfoContainer>
      <a href="https://www.wisemapping.com/" target="_blanc">
        <img
          src={LogoTextBlackSvg}
          aria-label="WiseMappping"
          style={{ float: 'left', paddingRight: '10px' }}
        />
      </a>
      <CreatorInfoText>
        {mapInfo.getTitle().trim() != '' && (
          <>
            <b>
              <FormattedMessage id="creator-info-pane.description" defaultMessage="Description" />:{' '}
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
    </CreatorInfoContainer>
  );
};

export default CreatorInfoPanel;
