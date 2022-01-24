import React from 'react';
import { StyledFooter } from './styled';
import { useIntl } from 'react-intl';

export type FooterPropsType = {
    showTryPanel?: boolean;
};

const Footer = ({ showTryPanel }: FooterPropsType): React.ReactElement => {
    const intl = useIntl();

    return (
        <>
            <div id="floating-panel">
                <div id="keyboardShortcuts" className="buttonExtOn">
                    <img src="../../images/editor/keyboard.svg" />
                </div>
                <div id="zoom-button">
                    <button id="zoom-plus">
                        <img src="../../images/editor/add.svg" />
                    </button>
                    <button id="zoom-minus">
                        <img src="../../images/editor/minus.svg" />
                    </button>
                </div>
                <div id="position">
                    <button id="position-button">
                        <img src="../../images/editor/center_focus.svg" />
                    </button>
                </div>
            </div>
            <div id="bottom-logo"></div>
            <div id="headerNotifier"></div>
            {showTryPanel && (
                <div id="tryInfoPanel">
                    <p>{intl.formatMessage({ id: 'editor.try-welcome' })}</p>
                    <p>{intl.formatMessage({ id: 'editor.try-welcome-description' })}</p>
                    <a href="/c/registration">
                        <div className="actionButton">
                            {intl.formatMessage({ id: 'login.signup', defaultMessage: 'Sign Up' })}
                        </div>
                    </a>
                </div>
            )}
        </>
    );
};

export default Footer;
