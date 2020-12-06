import axios from 'axios'
type NewUser =
    {
        email: string;
        firstname: string;
        lastname: string;
        password: string;
        recaptcha: string;

    }

interface Service {
    registerNewUser(user: NewUser, onSuccess: () => void, onError: (msg: string) => void): void;
}

class RestService implements Service {
    private baseUrl: string;
    private authFailed: () => void

    constructor(baseUrl: string, authFailed: () => void) {
        this.baseUrl = baseUrl;
    }

     async registerNewUser(user: NewUser, onSuccess: () => void, onError: (msg: string) => void) {

        await axios.post(this.baseUrl + '/service/user',
            JSON.stringify(user),
            { headers: { 'Content-Type': 'application/json' } }
        ).then(response => {
            // All was ok, let's sent to success page ...
            onSuccess();
        }).catch(error => {
            const data = error.response;

            // let errorMsg = intl.formatMessage({ id: "registration.unexpected", defaultMessage: "Unexpected error. Please, try latter." })
            let msg = 'Unexpected error. Please, try latter';
            if (data != null) {
                msg = Object.values(data.fieldErrors)[0] as string;
            }
            onError(msg);
        });
    }
}
export { Service, RestService, NewUser }