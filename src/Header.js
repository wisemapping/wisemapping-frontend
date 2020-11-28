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
        if (pageType === 'login') {
            text = <span class="nav-center"><FormattedMessage id="DONT_HAVE_ACCOUNT" defaultMessage="Don't have an account ?" /></span>;
            signUpButton = <SignUpButton/>;
        } else {
            signUpButton = <SignUpButton/>
            signInButton = <SignInButton/>;
        }

        return (
            <nav>
                <div class="header">
                    <span class="header-logo"><a href="/"><img src={logo} alt="logo" /></a></span>
                    {text}
                    {signUpButton}
                    {signInButton}
                </div>
            </nav>
        ) 
    };
}

class SignInButton extends React.Component {
    render() {
        return <span class="nav-signin"><a href="c/login"><FormattedMessage id="SIGN_IN" defaultMessage="Sign In" /></a></span>;
    }
}
class SignUpButton extends React.Component {
    render() {
        return (
            <span class="nav-signup button-style1">
                <a href="c/registration"><FormattedMessage id="SIGN_UP" defaultMessage="Sign Up" /></a>
            </span>);
    }
}

export default Header;
