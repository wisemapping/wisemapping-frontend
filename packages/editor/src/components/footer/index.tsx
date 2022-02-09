import React from 'react';
import { StyledLogo, Notifier } from './styled';
import { useIntl } from 'react-intl';

import KeyboardSvg from '../../../images/keyboard.svg';
import AddSvg from '../../../images/add.svg';
import MinusSvg from '../../../images/minus.svg';
import CenterFocusSvg from '../../../images/center_focus.svg';
import ActionButton from '../action-button';

export type FooterPropsType = {
    showTryPanel?: boolean;
};

const Footer = ({ showTryPanel }: FooterPropsType): React.ReactElement => {
    const intl = useIntl();

    return (
        <>
            <div id="floating-panel">
                <div id="keyboardShortcuts" className="buttonExtOn">
                    <img src={KeyboardSvg} />
                </div>
                <div id="zoom-button">
                    <button id="zoom-plus">
                        <img src={AddSvg} />
                    </button>
                    <button id="zoom-minus">
                        <img src={MinusSvg} />
                    </button>
                </div>
                <div id="position">
                    <button id="position-button">
                        <img src={CenterFocusSvg} />
                    </button>
                </div>
            </div>
            <StyledLogo id="bottom-logo"></StyledLogo>
            <Notifier id="headerNotifier"></Notifier>
            {showTryPanel && (
                <div id="tryInfoPanel">
                    <p>{intl.formatMessage({ id: 'editor.try-welcome' })}</p>
                    <p>{intl.formatMessage({ id: 'editor.try-welcome-description' })}</p>
                    <a href="/c/registration">
                        <ActionButton>
                            {intl.formatMessage({ id: 'login.signup', defaultMessage: 'Sign Up' })}
                        </ActionButton>
                    </a>
                </div>
            )}
        </>
    );
};

export default Footer;
