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
import { CloseButton, InfoDialog, InfoDialogContent } from './styled';
import { useIntl } from 'react-intl';

import CloseDialogSvg from '../../../images/close-dialog-icon.svg';
import Capability from '../../classes/action/capability';

export type FooterPropsType = {
  capability: Capability;
  message: string;
};

const WarningDialog = ({ capability, message }: FooterPropsType): React.ReactElement => {
  const intl = useIntl();

  let msgExt: string = '';
  let msg: string = '';
  if (
    capability.mode !== 'viewonly-private' &&
    capability.mode !== 'viewonly-public' &&
    capability.mode !== 'showcase' &&
    capability.isMobile
  ) {
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

  const [open, setOpen] = useState<boolean>(Boolean(msgExt || message).valueOf());
  return (
    <>
      {open && (
        <InfoDialog>
          <InfoDialogContent>
            <CloseButton>
              <button
                onClick={(e) => {
                  setOpen(false);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                name="close"
                aria-label="Close"
              >
                <img src={CloseDialogSvg} title="Close" />
              </button>
            </CloseButton>
            {msgExt && <p>{`${msg} ${msgExt}`}</p>}
            {message && <p>{message}</p>}
          </InfoDialogContent>
        </InfoDialog>
      )}
    </>
  );
};

export default WarningDialog;
