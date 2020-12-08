import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import Header, { SignInButton } from '../header'
import Footer from '../footer'

const css = require('../../css/success.css');

const RegistrationSuccessPage = () => {

  useEffect(() => {
    document.title = 'Registration | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <div className="wrapper">
        <div className="rcontent">
          <h1>
            <FormattedMessage id="registration.success.title" defaultMessage="Your account has been created successfully" />
          </h1>
          <p>
            <FormattedMessage id="registration.success.desc" defaultMessage="Click 'Sign In' button below and start creating mind maps." />
          </p>

          <SignInButton style='style1'/>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export { RegistrationSuccessPage }


