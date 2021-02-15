import { FormControl } from "@material-ui/core";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import Client, { ErrorInfo } from "../../../../classes/client";
import Input from "../../../form/input";
import BaseDialog from "../../action-dispatcher/base-dialog";
import { useSelector } from 'react-redux';
import { activeInstance, fetchAccount } from "../../../../redux/clientSlice";


type AccountInfoDialogProps = {
    onClose: () => void
}

type AccountInfoModel = {
    email: string,
    firstname: string,
    lastname: string
}

const defaultModel: AccountInfoModel = { firstname: '', lastname: '', email: '' };
const AccountInfoDialog = ({ onClose }: AccountInfoDialogProps) => {
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();

    const [model, setModel] = React.useState<AccountInfoModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const intl = useIntl();

    const mutation = useMutation<void, ErrorInfo, AccountInfoModel>((model: AccountInfoModel) => {
        return client.updateAccountInfo(model.firstname, model.lastname);
    },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('account')
                onClose()
            },
            onError: (error) => {
                setError(error);
            }
        }
    );

    const account = fetchAccount();
    useEffect(() => {
        if (account) {
            setModel({
                email: account?.email,
                lastname: account?.lastname,
                firstname: account?.firstname
            });
        }
    }, [account?.email])


    const handleOnClose = (): void => {
        onClose();
        setModel(defaultModel);
        setError(undefined);
    };

    const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        mutation.mutate(model);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();

        const name = event.target.name;
        const value = event.target.value;
        setModel({ ...model, [name as keyof AccountInfoModel]: value });
    }
    return (
        <BaseDialog onClose={handleOnClose} onSubmit={handleOnSubmit} error={error}
            title={intl.formatMessage({ id: 'accountinfo.title', defaultMessage: 'Account info' })}
            submitButton={intl.formatMessage({ id: 'accountinfo.button', defaultMessage: 'Save' })}>

            <FormControl fullWidth={true}>
                <Input name="email" type="text" disabled={true} label={intl.formatMessage({ id: "accountinfo.email", defaultMessage: "Email" })}
                    value={model.email} onChange={handleOnChange} error={error} fullWidth={true} />

                <Input name="firstname" type="text" label={intl.formatMessage({ id: "accountinfo.firstname", defaultMessage: "First Name" })}
                    value={model.firstname} onChange={handleOnChange} required={true} fullWidth={true} />

                <Input name="lastname" type="text" label={intl.formatMessage({ id: "accountinfo.lastname", defaultMessage: "Last Name" })}
                    value={model.lastname} onChange={handleOnChange} required={true} fullWidth={true} />
            </FormControl>
        </BaseDialog>
    );
}
export default AccountInfoDialog;

