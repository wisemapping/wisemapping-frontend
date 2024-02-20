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
// import { useIntl } from 'react-intl';

type CreatorInfoPanel = {
  mapInfo: MapInfo;
};
const CreatorInfoPanel = ({ mapInfo }: CreatorInfoPanel): ReactElement => {
  // const intl = useIntl();
  console.log('CreatorInfoPanel');
  return (
    <div
      style={{
        zIndex: 10000,
        height: '100px',
        position: 'fixed',
        float: 'left',
        top: '90%',
        left: '2%',
      }}
    >
      <a href="https://www.wisemapping.com/">
        <img src={LogoTextBlackSvg} aria-label="WiseMappping" />
      </a>
      <span
        style={{
          lineHeight: '100px',
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          paddingLeft: '10px',
          fontSize: '14px',
          color: '#909090',
        }}
      >
        <b>Description:</b> {mapInfo.getTitle()} <b>Creator:</b> {mapInfo.getCreatorFullName()}
      </span>
    </div>
  );
};

export default CreatorInfoPanel;
