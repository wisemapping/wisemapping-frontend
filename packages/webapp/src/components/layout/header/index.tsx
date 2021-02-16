import { StyledNav, StyledDiv, Logo } from './styled';

import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';

const logo = require('../../../images/logo-small.svg')

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
          <Logo><Link to="/c/login" className="header-logo"><img src={String(logo)} alt="logo" /></Link></Logo>
          {text}
          {signUpButton}
          {signInButton}
        </StyledDiv>
      </StyledNav>
    )
  };
}

interface ButtonProps {
  className?: string;
}

const SignInButton = (props: ButtonProps) => {
  return (
    <span className={`${props.className}`}>
      <Button color="primary" size="medium" variant="outlined" component={Link} to="/c/login"><FormattedMessage id="login.signin" defaultMessage="Sign In" /></Button>
    </span>);
}

const SignUpButton = (props: ButtonProps) => {
  return (
    <span className={`${props.className}`}>
      <Button color="primary" size="medium" variant="outlined" component={Link} to="/c/registration"><FormattedMessage id="login.signup" defaultMessage="Sign Up" /></Button>
    </span>);
}

export { SignInButton, SignUpButton };
export default Header;
