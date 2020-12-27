import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReCAPTCHA from 'react-google-recaptcha';
import { useHistory } from 'react-router-dom';
import { ErrorInfo, Service } from '../../services/Service';

import Header from '../layout/header';
import Footer from '../layout/footer';

import { StyledReCAPTCHA } from './styled';
import { PageContent } from '../../theme/global-style';
import { FormControl } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { activeInstance } from '../../reducers/serviceSlice';
import Input from '../form/input';
import GlobalError from '../form/global-error';

export type Model = {
  email: string;
  lastname: string;
  firstname: string;
  password: string;
  recaptcha: string;
}

const defaultModel: Model = { email: '', lastname: '', firstname: '', password: '', recaptcha: '' };
const RegistrationForm = () => {
  const [model, setModel] = useState<Model>(defaultModel);
  const [error, setError] = useState<ErrorInfo>();
  const history = useHistory();
  const intl = useIntl();

  const service: Service = useSelector(activeInstance);
  const mutation = useMutation<void, ErrorInfo, Model>(
    (model: Model) => service.registerNewUser({ ...model }),
    {
      onSuccess: () => history.push("/c/registration-success"),
      onError: (error) => {
        setError(error);
      }
    }
  );

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    mutation.mutate(model);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;
    setModel({ ...model, [name as keyof Model]: value });
  }


  return (
    <PageContent>
      <h1><FormattedMessage id="registration.title" defaultMessage="Become a member of our comunity" /></h1>
      <p><FormattedMessage id="registration.desc" defaultMessage="Signing up is free and just take a moment " /></p>


      <form onSubmit={handleOnSubmit}>
        <GlobalError error={error} />
        
        <Input name="email" type="email" onChange={handleOnChange} label={{ id: "registration.email", defaultMessage: "Email" }}
          autoComplete="email" />

        <Input name="firstname" type="text" onChange={handleOnChange} label={{ id: "registration.firstname", defaultMessage: "First Name" }}
          autoComplete="given-name" />

        <Input name="lastname" type="text" onChange={handleOnChange} label={{ id: "registration.lastname", defaultMessage: "Last Name" }}
          autoComplete="family-name" />

        <Input name="password" type="password" onChange={handleOnChange} label={{ id: "registration.password", defaultMessage: "Password" }}
          autoComplete="new-password" />

        <FormControl>
          <StyledReCAPTCHA>
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={(value: string) => { model.recaptcha = value; setModel(model) }} />
          </StyledReCAPTCHA>
        </FormControl>

        <div style={{ width: "300px", textAlign: "center", fontSize: "12px", margin: "auto" }}>
          <FormattedMessage id="registration.termandconditions" defaultMessage="Terms of Service: Please check the WiseMapping Account information you've entered above, and review the Terms of Service here. By clicking on 'Register' below you are agreeing to the Terms of Service above and the Privacy Policy" />
        </div>

        <input type="submit" value={intl.formatMessage({ id: "registration.register", defaultMessage: "Register" })} />

      </form>
    </PageContent >
  );
}

const RegistationPage = () => {

  useEffect(() => {
    document.title = 'Registration | WiseMapping';
  });

  return (
    <div>
      <Header type='only-signin' />
      <RegistrationForm />
      <Footer />
    </div>
  );
}

export default RegistationPage;


