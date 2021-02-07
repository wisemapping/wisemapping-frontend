import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Button, FormControl } from '@material-ui/core';


import Client, { BasicMapInfo, ErrorInfo } from '../../../../client';
import { activeInstance } from '../../../../redux/clientSlice';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';

export type ImportModel = {
    title: string;
    description?: string;
}

export type CreateProps = {
    onClose: () => void
}

const defaultModel: ImportModel = { title: '', description: '' };
const ImportDialog = (props: CreateProps) => {
    const client: Client = useSelector(activeInstance);
    const [model, setModel] = React.useState<ImportModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const intl = useIntl();

    const mutation = useMutation<number, ErrorInfo, ImportModel>((model: ImportModel) => {
        return client.createMap(model);
    },
        {
            onSuccess: (mapId: number) => {
                window.location.href = `/c/maps/${mapId}/edit`;
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
            <BaseDialog onClose={handleOnClose} onSubmit={handleOnSubmit} error={error}
                title={intl.formatMessage({ id: 'import.title', defaultMessage: 'Import existing mindmap' })}
                description={intl.formatMessage({ id: 'import.description', defaultMessage: 'You can import FreeMind 1.0.1 and WiseMapping maps to your list of maps. Select the file you want to import.' })}
                submitButton={intl.formatMessage({ id: 'import.button', defaultMessage: 'Create' })}>

                <FormControl fullWidth={true}>
                    <Input name="title" type="text" label={intl.formatMessage({ id: "action.rename-name-placeholder", defaultMessage: "Name" })}
                        value={model.title} onChange={handleOnChange} error={error} fullWidth={true} />

                    <Input name="description" type="text" label={intl.formatMessage({ id: "action.rename-description-placeholder", defaultMessage: "Description" })}
                        value={model.description} onChange={handleOnChange} required={false} fullWidth={true} />

                    <input
                        accept="image/*"
                        id="contained-button-file"
                        type="file"
                        style={{display: 'none'}}
                    />
                    <label htmlFor="contained-button-file">
                        <Button variant="outlined" color="primary" component="span" style={{margin: '10px 5px', width: '100%'}}>
                            <FormattedMessage id="maps.choose-file" defaultMessage="Choose a file"/>
                        </Button>
                    </label>
                </FormControl>
            </BaseDialog>
        </div>
    );
}

export default ImportDialog;