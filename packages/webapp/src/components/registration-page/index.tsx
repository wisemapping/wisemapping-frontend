import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReCAPTCHA from 'react-google-recaptcha';
import { useHistory } from 'react-router-dom';
import Client, { ErrorInfo } from '../../classes/client';
import FormContainer from '../layout/form-container';

import Header from '../layout/header';
import Footer from '../layout/footer';

import { useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { activeInstance } from '../../redux/clientSlice';
import Input from '../form/input';
import GlobalError from '../form/global-error';
import SubmitButton from '../form/submit-button';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';

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

  const Client: Client = useSelector(activeInstance);
  const mutation = useMutation<void, ErrorInfo, Model>(
    (model: Model) => Client.registerNewUser({ ...model }),
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
    <FormContainer>
      <Typography variant="h4" component="h1">
        <FormattedMessage id="registration.title" defaultMessage="Become a member" />
      </Typography>

      <Typography paragraph>
        <FormattedMessage id="registration.desc" defaultMessage="Signing up is free and just take a moment " />
      </Typography>

      <FormControl>

        <form onSubmit={handleOnSubmit}>
          <GlobalError error={error} />

          <Input name="email" type="email" onChange={handleOnChange} label={intl.formatMessage({ id: "registration.email", defaultMessage: "Email" })}
            autoComplete="email" error={error} />

          <Input name="firstname" type="text" onChange={handleOnChange} label={intl.formatMessage({ id: "registration.firstname", defaultMessage: "First Name" })}
            autoComplete="given-name" error={error} />

          <Input name="lastname" type="text" onChange={handleOnChange} label={intl.formatMessage({ id: "registration.lastname", defaultMessage: "Last Name" })}
            autoComplete="family-name" error={error} />

          <Input name="password" type="password" onChange={handleOnChange} label={intl.formatMessage({ id: "registration.password", defaultMessage: "Password" })}
            autoComplete="new-password" error={error} />

          <div style={{ width: '330px', padding: '5px 0px 5px 20px' }}>
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={(value: string) => { model.recaptcha = value; setModel(model) }} />
          </div>

          <div style={{ fontSize: "12px", padding: "10px 0px" }}>
            <FormattedMessage id="registration.termandconditions" defaultMessage="Terms of Client: Please check the WiseMapping Account information you've entered above, and review the Terms of Client here. By clicking on 'Register' below you are agreeing to the Terms of Client above and the Privacy Policy" />
          </div>

          <SubmitButton value={intl.formatMessage({ id: "registration.register", defaultMessage: "Register" })} />
        </form>
      </FormControl>

    </FormContainer>
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


