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
    resetPassword(email:string, onSuccess: () => void, onError: (msg: string) => void): void;
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
            const response = error.response;
            let msg = '';
            if (response) {
                const status: number = response.status;
                const data = response.data;

                switch (status) {
                    case 401:
                        this.authFailed();
                        break;
                    default:
                        console.log(data);
                        // Is a server error ?
                        if (!data.fieldErrors) {
                            msg = response.statusText;
                        } else if (data) {
                            const fieldsError = data.fieldErrors;
                            msg = Object.values(fieldsError)[0] as string;
                        }
                }

            } else {
                // Network related problem ...
                msg = 'Unexpected error. Please, try latter';
            }
            onError(msg);
        });
    }

    resetPassword(email:string, onSuccess: () => void, onError: (msg: string) => void): void {
        
    }

}
export { Service, RestService, NewUser }