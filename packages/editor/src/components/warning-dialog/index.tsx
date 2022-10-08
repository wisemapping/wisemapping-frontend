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

  var titleKey = undefined;
  var descriptionKey = undefined;

  if (capability.mode !== 'viewonly' && capability.mode !== 'showcase' && capability.isMobile) {
    titleKey = 'editor.edit-mobile';
    descriptionKey = 'editor.edit-description-mobile';
  }
  if (capability.mode === 'showcase' && capability.isMobile) {
    titleKey = 'editor.try-welcome-mobile';
    descriptionKey = 'editor.edit-description-mobile';
  }
  if (capability.mode === 'showcase' && !capability.isMobile) {
    titleKey = 'editor.try-welcome';
    descriptionKey = 'editor.try-welcome-description';
  }

  // if the toolbar is present, the alert must not overlap
  var alertTopAdjustmentStyle = 'tryInfoPanelWithToolbar';

  return (
    <>
      <Notifier id="headerNotifier"></Notifier>
      {(titleKey || message) && (
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
            {titleKey && (
              <p>
                {intl.formatMessage({ id: titleKey })} {intl.formatMessage({ id: descriptionKey })}
              </p>
            )}
            {message && <p>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default WarningDialog;
