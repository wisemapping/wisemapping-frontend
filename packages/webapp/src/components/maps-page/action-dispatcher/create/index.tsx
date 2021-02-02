import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { FormControl } from "@material-ui/core";

import Client, { BasicMapInfo, ErrorInfo } from "../../../../client";
import { activeInstance } from '../../../../reducers/serviceSlice';
import Input from "../../../form/input";
import { DialogProps, fetchMapById, handleOnMutationSuccess } from "..";
import BaseDialog from "../action-dialog";

export type CreateModel = {
    name: string;
    description?: string;
}

export type CreateProps = {
    open: boolean,
    onClose: () => void
  }
  
const defaultModel: CreateModel = { name: '', description: ''};
const CreateDialog = (props: CreateProps) => {
    const client: Client = useSelector(activeInstance);
    const [model, setModel] = React.useState<CreateModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const { open } = props;

    const intl = useIntl();
    const queryClient = useQueryClient();

    const mutation = useMutation<CreateModel, ErrorInfo, CreateModel>((model: CreateModel) => {
        const {  ...rest } = model;
        return client.createMap(rest).then(() => model);
    },
        {
            onSuccess: () => {
                handleOnMutationSuccess(props.onClose, queryClient);
            },
            onError: (error) => {
                setError(error);
            }
        }
    );

    const handleOnClose = (): void => {
        props.onClose();
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
        setModel({ ...model, [name as keyof BasicMapInfo]: value });
    }

    return (
        <div>
            <BaseDialog open={open} onClose={handleOnClose} onSubmit={handleOnSubmit} error={error}
                title={intl.formatMessage({ id: 'create.title', defaultMessage: 'Create a new mindmap' })}
                description={intl.formatMessage({ id: 'create.description', defaultMessage: 'Please, fill the new map name and description.' })}
                submitButton={intl.formatMessage({ id: 'create.button', defaultMessage: 'Create' })}>

                <FormControl fullWidth={true}>
                    <Input name="name" type="text" label={{ id: "action.rename-name-placeholder", defaultMessage: "Name" }}
                        value={model.name} onChange={handleOnChange} error={error} fullWidth={true} />

                    <Input name="description" type="text" label={{ id: "action.rename-description-placeholder", defaultMessage: "Description" }}
                        value={model.description} onChange={handleOnChange} required={false} fullWidth={true} />
                </FormControl>
            </BaseDialog>
        </div>
    );
}

export default CreateDialog;