import React from 'react';
import { FormattedMessage } from 'react-intl'
import logo from './images/header-logo.png'

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: props.type
        };
    }

    render() {
        let signUpButton;
        let signInButton;
        let text;

        const pageType = this.state.type;
        if (pageType === 'only-signup') {
            text = <span className="header-area-content-span"><span><FormattedMessage id="header.donthaveaccount" defaultMessage="Don't have an account ?" /></span></span>;
            signUpButton = <SignUpButton className="header-area-right2" />;
        } else if (pageType === 'only-signin') {
            text = <span className="header-area-content-span"><span><FormattedMessage id="header.haveaccount" defaultMessage="Already have an account?" /></span></span>;
            signUpButton = <SignInButton className="header-area-right2" />;
        } else {
            signUpButton = <SignUpButton />
            signInButton = <SignInButton />;
        }

        return (
            <nav>
                <div className="header">
                    <span className="header-logo"><a href="/"><img src={logo} alt="logo" /></a></span>
                    {text}
                    {signUpButton}
                    {signInButton}
                </div>
            </nav>
        )
    };
}

const SignInButton = (props) => {
    return (
    <span className={`button-style1 ${props.className}`}>
        <a href="/c/login"><FormattedMessage id="login.signin" defaultMessage="Sign In" /></a>
    </span>);
}

const SignUpButton = (props) => {
    return (
        <span className={`button-style1 ${props.className}`}>
            <a href="/c/user/registration"><FormattedMessage id="login.signup" defaultMessage="Sign Up" /></a>
        </span>);
}

export default Header;
