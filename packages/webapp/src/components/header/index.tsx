import { StyledNav, StyledDiv,Logo } from './styled';

import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

const logo = require('../../images/header-logo.png')

interface HeaderProps {
  type: 'only-signup' | 'only-signin' | 'none';
}

class Header extends React.Component<HeaderProps, HeaderProps> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = { type: props.type };
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
    } else if (pageType === 'none') {
      text = '';
      signUpButton = '';
    } else {
      signUpButton = <SignUpButton className="header-area-right2" />
      signInButton = <SignInButton className="header-area-right2" />;
    }

    return (
      <StyledNav>
        <StyledDiv>
          <Logo><Link to="/" className="header-logo"><img src={String(logo)} alt="logo" /></Link></Logo>
          {text}
          {signUpButton}
          {signInButton}
        </StyledDiv>
      </StyledNav>
    )
  };
}

interface ButtonProps {
  style?: 'style1' | 'style2' | 'style3';
  className?: string;
}

const SignInButton = (props: ButtonProps) => {
  const style = props.style ? props.style : 'style1';
  return (
    <span className={`button-${style} ${props.className}`}>
      <Link to="/c/login"><FormattedMessage id="login.signin" defaultMessage="Sign In" /></Link>
    </span>);
}

const SignUpButton = (props: ButtonProps) => {
  const style = props.style ? props.style : 'style1';
  return (
    <span className={`button-${style} ${props.className}`}>
      <Link to="/c/user/registration"><FormattedMessage id="login.signup" defaultMessage="Sign Up" /></Link>
    </span>);
}

export { SignInButton, SignUpButton };
export default Header;
