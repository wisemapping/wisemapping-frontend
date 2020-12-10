import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import StyledDiv from './styled'

import Header, { SignInButton } from '../header'
import Footer from '../footer'
import PageContent from './styled'


const RegistrationSuccessPage = () => {

  useEffect(() => {
    document.title = 'Registration | WiseMapping';
  });

  return (
    <div>
      <Header type='none' />
      <PageContent>
          <h1>
            <FormattedMessage id="registration.success.title" defaultMessage="Your account has been created successfully" />
          </h1>
          <p>
            <FormattedMessage id="registration.success.desc" defaultMessage="Click 'Sign In' button below and start creating mind maps." />
          </p>

          <SignInButton style='style1'/>
        </PageContent>

      <Footer />
    </div>
  );
}

export { RegistrationSuccessPage }


