import React from 'react';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: props.type
        };
    }

    render() {
        let buttons;
        const pageType = this.state.type;
        if (pageType == 'login') {
            buttons = <SignUpButton/>;
        } else {
            buttons = <span><SignUpButton/><SignInButton/></span>;
        }

        return (
            <nav>
                <div class="header">
                    <span class="header-logo"><a href="/"><img src="images/header-logo.png" alt="logo" /></a></span>
                    {buttons}
                </div>
            </nav>
        ) 
    };
}

class SignInButton extends React.Component {
    render() {
        return <span class="nav-signin"><a href="https://app.wisemapping.com/c/login">Sign In</a></span>;
    }
}
class SignUpButton extends React.Component {
    render() {
        return <span class="nav-signup"><a href="https://app.wisemapping.com/c/user/registration">Sign Up</a></span>;
    }
}

export default Header;
