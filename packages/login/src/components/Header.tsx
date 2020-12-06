import React from 'react';
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

const logo = require('../images/header-logo.png')

interface HeaderProps {
  type: string;
}

class Header extends React.Component<HeaderProps, HeaderProps> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = props;
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
      signUpButton = <SignUpButton className="header-area-right2" />
      signInButton = <SignInButton className="header-area-right2" />;
    }

    return (
      <nav>
        <div className="header">
          <span className="header-logo"><Link to="/"><img src={String(logo)} alt="logo" /></Link></span>
          {text}
          {signUpButton}
          {signInButton}
        </div>
      </nav>
    )
  };
}

interface ButtonProps {
  className: string;
}

const SignInButton = (props: ButtonProps) => {
  return (
    <span className={`button-style1 ${props.className}`}>
      <a href="/c/login"><FormattedMessage id="login.signin" defaultMessage="Sign In" /></a>
    </span>);
}

const SignUpButton = (props: ButtonProps) => {
  return (
    <span className={`button-style1 ${props.className}`}>
      <Link to="/c/user/registration"><FormattedMessage id="login.signup" defaultMessage="Sign Up" /></Link>
    </span>);
}

export default Header;
