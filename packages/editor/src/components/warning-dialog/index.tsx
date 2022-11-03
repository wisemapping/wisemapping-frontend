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
import React, { useState } from 'react';
import { Notifier } from './styled';
import { useIntl } from 'react-intl';

import CloseDialogSvg from '../../../images/close-dialog-icon.svg';
import Capability from '../../classes/action/capability';

export type FooterPropsType = {
  capability: Capability;
  message: string;
};

const WarningDialog = ({ capability, message }: FooterPropsType): React.ReactElement => {
  const intl = useIntl();
  const [dialogClass, setDialogClass] = useState('tryInfoPanel');

  let msgExt, msg: string;
  if (capability.mode !== 'viewonly' && capability.mode !== 'showcase' && capability.isMobile) {
    msg = intl.formatMessage({
      id: 'editor.edit-mobile',
      defaultMessage: 'Note for mobile devices.',
    });
    msgExt = intl.formatMessage({
      id: 'editor.edit-description-mobile',
      defaultMessage:
        'Limited mindmap edition capabilities are supported in Mobile devices. Use Desktop browser for full editor capabilities.',
    });
  }

  if (capability.mode === 'showcase' && capability.isMobile) {
    msg = intl.formatMessage({
      id: 'editor.try-welcome-mobile',
      defaultMessage: 'This edition space showcases some of the mindmap editor capabilities!',
    });
    msgExt = intl.formatMessage({
      id: 'editor.try-welcome-description-mobile',
      defaultMessage:
        'Sign Up to start creating, sharing and publishing unlimited number of mindmaps for free. Limited mindmap edition capabilties are supported in Mobile devices. Use Desktop browser for full editor capabilies.',
    });
  }

  if (capability.mode === 'showcase' && !capability.isMobile) {
    msg = intl.formatMessage({
      id: 'editor.try-welcome',
      defaultMessage: 'This edition space showcases some of the mindmap editor capabilities!',
    });
    msgExt = intl.formatMessage({
      id: 'editor.try-welcome-description',
      defaultMessage:
        'Sign Up to start creating, sharing and publishing unlimited number of mindmaps for free.',
    });
  }

  // if the toolbar is present, the alert must not overlap
  const alertTopAdjustmentStyle = 'tryInfoPanelWithToolbar';

  return (
    <>
      <Notifier id="headerNotifier"></Notifier>
      {(msgExt || message) && (
        <div className={dialogClass + ' ' + alertTopAdjustmentStyle}>
          <div className="tryInfoPanelInner">
            <div className="closeButton">
              <button
                onClick={(e) => {
                  setDialogClass('tryInfoPanelClosed');
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <img src={CloseDialogSvg} />
              </button>
            </div>
            {msgExt && <p>{`${msg} ${msgExt}`}</p>}
            {message && <p>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default WarningDialog;
