import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import {PageContent} from '../../theme/global-style';

import Header, { SignInButton } from '../header'
import Footer from '../footer'

const ForgotPasswordSuccessPage = () => {
  useEffect(() => {
    document.title = 'Reset Password | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <div>
      <PageContent>
        <h1>
          <FormattedMessage id="forgot.success.title" defaultMessage="Your temporal password has been sent" />
        </h1>
        <p>
          <FormattedMessage id="forgot.success.desc" defaultMessage="We've sent you an email that will allow you to reset your password. Please check your email now." />
        </p>

        <SignInButton style='style1' />
      </PageContent>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPasswordSuccessPage 


