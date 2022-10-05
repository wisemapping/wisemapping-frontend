import React, { useState } from 'react';
import { StyledLogo, Notifier } from './styled';
import { useIntl } from 'react-intl';

import KeyboardSvg from '../../../images/keyboard.svg';
import AddSvg from '../../../images/add.svg';
import MinusSvg from '../../../images/minus.svg';
import CenterFocusSvg from '../../../images/center_focus.svg';
import CloseDialogSvg from '../../../images/close-dialog-icon.svg';

import ActionButton from '../action-button';
import { EditorRenderMode } from '@wisemapping/mindplot';

export type FooterPropsType = {
  editorMode: EditorRenderMode;
  isMobile: boolean;
};

const Footer = ({ editorMode, isMobile }: FooterPropsType): React.ReactElement => {
  const intl = useIntl();
  const [dialogClass, setDialogClass] = useState('tryInfoPanel');

  var titleKey = undefined;
  var descriptionKey = undefined;
  var showSignupButton = undefined;

  if (editorMode !== 'viewonly' && editorMode !== 'showcase' && isMobile) {
    titleKey = 'editor.edit-mobile';
    descriptionKey = 'editor.edit-description-mobile';
    showSignupButton = false;
  }
  if (editorMode === 'showcase' && isMobile) {
    titleKey = 'editor.try-welcome-mobile';
    descriptionKey = 'editor.edit-description-mobile';
    showSignupButton = true;
  }
  if (editorMode === 'showcase' && !isMobile) {
    titleKey = 'editor.try-welcome';
    descriptionKey = 'editor.try-welcome-description';
    showSignupButton = true;
  }

  // if the toolbar is present, the alert must not overlap
  var alertTopAdjustmentStyle = 'tryInfoPanelWithToolbar';

  return (
    <>
      <Notifier id="headerNotifier"></Notifier>
      {titleKey && (
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
            <p>
              {intl.formatMessage({ id: titleKey })} {intl.formatMessage({ id: descriptionKey })}
            </p>
            {showSignupButton && (
              <a href="/c/registration">
                <ActionButton>
                  {intl.formatMessage({ id: 'login.signup', defaultMessage: 'Sign Up' })}
                </ActionButton>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
