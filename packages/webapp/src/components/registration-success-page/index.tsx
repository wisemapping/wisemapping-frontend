import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import {PageContent} from '../../theme/global-style';

import Header, { SignInButton } from '../layout/header'
import Footer from '../layout/footer'



const RegistrationSuccessPage = () => {
  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <PageContent>
        <h1>
          <FormattedMessage id="resetpassword.success.title" defaultMessage="Your account has been created successfully" />
        </h1>
        <p>
          <FormattedMessage id="registration.success.desc" defaultMessage="Click 'Sign In' button below and start creating mind maps." />
        </p>
        <SignInButton style='style1' />
      </PageContent>
      <Footer />
    </div>
  );
}

export default RegistrationSuccessPage;


