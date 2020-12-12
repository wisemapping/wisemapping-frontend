import axios from 'axios'

type NewUser = {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    recaptcha: string | null;
}


interface Service {
    registerNewUser(user: NewUser, onSuccess: () => void, onError: (msg: string) => void): void;
    resetPassword(email: string, onSuccess: () => void, onError: (msg: string) => void): void;
}

class RestService implements Service {
    private baseUrl: string;
    private authFailed: () => void

    constructor(baseUrl: string, authFailed: () => void) {
        this.baseUrl = baseUrl;
    }

    async registerNewUser(user: NewUser, onSuccess: () => void, onError: (msg: string) => void) {

        await axios.post(this.baseUrl + '/service/users',
            JSON.stringify(user),
            { headers: { 'Content-Type': 'application/json' } }
        ).then(response => {
            // All was ok, let's sent to success page ...
            onSuccess();
        }).catch(error => {
            const response = error.response;
            const errorMsg = this.parseResponseOnError(response);
            onError(errorMsg);
        });
    }

    async resetPassword(email: string, onSuccess: () => void, onError: (msg: string) => void) {
        await axios.put(this.baseUrl + '/service/users/resetPassword?email=' + email,
            null,
            { headers: { 'Content-Type': 'application/json' } }
        ).then(response => {
            // All was ok, let's sent to success page ...
            onSuccess();
        }).catch(error => {
            const response = error.response;
            const errorMsg = this.parseResponseOnError(response);
            onError(errorMsg);
        });
    }

    private parseResponseOnError = (response: any) => {
        let msg;
        if (response) {
            const status: number = response.status;
            const data = response.data;
            console.log(data);

            switch (status) {
                case 401:
                    this.authFailed();
                    break;
                default:
                    if (data) {
                        let errors: string[] = [];
                        if (data.globalErrors) {
                            errors = data.globalErrors;
                        } else if (data.fieldErrors) {
                            errors = Object.values(data.fieldErrors);
                        }

                        if (errors.length > 0) {
                            msg = errors[0];
                        }

                    } else {
                        msg = response.statusText;
                    }
            }
        }

        // Network related problem ...
        if (!msg) {
            msg = 'Unexpected error. Please, try latter';
        }

        return msg;
    }

}
export { Service, RestService, NewUser }