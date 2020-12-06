import React from 'react'
import axios from 'axios'
import { FormattedMessage, useIntl } from 'react-intl'
import useHistory  from 'react-router-dom'
import { ReCaptcha } from 'react-recaptcha-v3'


import Header from './Header';
import Footer from './Footer';

const css = require('../css/registration.css');


interface ErrorMessageDialogProps {
  message: string
}

const ErrorMessageDialog = (props: ErrorMessageDialogProps) => {
  let result;

  const message = props.message;
  if (message) {
    result = <p className='form-error-dialog'>{message}</p>
  } else {
    result = <span></span>
  }
  return result;
}

interface RegistrationFormState {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  recaptcha: string;

  errorMsg: string;
  intl: string;
}

class RegistrationForm extends React.Component<{}, RegistrationFormState> {

  constructor(props: {}) {
    super(props)

    this.handleChange = this.handleChange.bind(this);
    this.handleRecaptchaChange = this.handleRecaptchaChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value }: any = event.target;
    this.setState({ [name]: value } as Pick<RegistrationFormState, keyof RegistrationFormState>);
  }

  handleRecaptchaChange(value: string) {
    this.setState({ recaptcha: value });
  }

  async handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const { errorMsg, ...rest } = this.state;

    await axios.post("http://localhost:8080/service/user",
      rest,
      { headers: { 'Content-Type': 'application/json' } }
    ).then(response => {
      // const history = useHistory();
      // history.push("/c/user/registrationSuccess");
    }).catch(error => {
      // Handle error ...
      const data = error.response.data;
      // const status = error.response.status;

      const errorMsg = Object.values(data.fieldErrors)[0] as string;
      this.setState({ errorMsg: errorMsg });
    });
  }

  render() {
    const intl = useIntl();
    const errrMsg = this.state.errorMsg;

    return (
      <div className="wrapper">
        <div className="content">
          <h1><FormattedMessage id="registration.become" defaultMessage="Become a member of our comunity" /></h1>
          <p><FormattedMessage id="registration.signup" defaultMessage="Signing up is free and just take a moment " /></p>

          <ErrorMessageDialog message={errrMsg} />

          <form action="/" method="POST" onSubmit={this.handleSubmit}>
            <input type="email" name="email" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.email", defaultMessage: "Email" })} required={true} autoComplete="email" />
            <input type="text" name="firstname" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.firstname", defaultMessage: "First Name" })} required={true} autoComplete="given-name" />
            <input type="text" name="lastname" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.lastname", defaultMessage: "Last Name" })} required={true} autoComplete="family-name" />
            <input type="password" name="password" onChange={this.handleChange} placeholder={intl.formatMessage({ id: "registration.password", defaultMessage: "Password" })} required={true} autoComplete="new-password" />

            <div>
              <ReCaptcha
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                verifyCallback={this.handleRecaptchaChange}
              />
            </div>
            <p>
              <FormattedMessage id="registration.termandconditions" defaultMessage="Terms of Service: Please check the WiseMapping Account information you've entered above, and review the Terms of Service here. By clicking on 'Register' below you are agreeing to the Terms of Service above and the Privacy Policy" />
            </p>

            <input type="submit" value={intl.formatMessage({ id: "registration.register", defaultMessage: "Register" })} />
          </form>
        </div>
      </div>
    );
  }
}


const RegistationFormPage = (props: any) => {
  return (
    <div>
      <Header type='only-signin' />
      <RegistrationForm/>
      <Footer />
    </div>
  );
}

const RegistrationSuccessPage = (props: any) => {
  return (
    <div>
      <Header type='only-signup' />
      <div className="wrapper">
        <div className="content">
          <h1><FormattedMessage id="registration.success.title" defaultMessage="Your account has been created successfully" /></h1>
          <p><FormattedMessage id="registration.success.desc" defaultMessage="Your account has been created successfully, click to sign in and start enjoying  WiseMapping." /></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export { RegistationFormPage, RegistrationSuccessPage };


