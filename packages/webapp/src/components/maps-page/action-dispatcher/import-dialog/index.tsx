import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Button, FormControl } from '@material-ui/core';


import Client, { BasicMapInfo, ErrorInfo } from '../../../../classes/client';
import { activeInstance } from '../../../../redux/clientSlice';
import Input from '../../../form/input';
import BaseDialog from '../base-dialog';

export type ImportModel = {
    title: string;
    description?: string;
    contentType?: string;
    content?: ArrayBuffer | null | string;
}

export type CreateProps = {
    onClose: () => void
}

const defaultModel: ImportModel = { title: '' };
const ImportDialog = (props: CreateProps) => {
    const client: Client = useSelector(activeInstance);
    const [model, setModel] = React.useState<ImportModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const intl = useIntl();

    const mutation = useMutation<number, ErrorInfo, ImportModel>((model: ImportModel) => {
        return client.importMap(model);
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
        setModel({ ...model, [name as keyof ImportModel]: value });
    }

    const handleOnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event?.target?.files;
        const reader = new FileReader();

        if (files) {
            const file = files[0];
            var title = file.name;
            title = title.substring(0, title.lastIndexOf("."));

            // Closure to capture the file information.
            reader.onload =  (event) => {
                const fileContent = event?.target?.result;
                model.content = fileContent;

                // Suggest file name ... 
                const fileName = file.name;
                if (fileName) {
                    var title = fileName.split('.')[0]
                    if (!model.title || 0 === model.title.length) {
                        model.title = title;
                    }
                }
                model.contentType = file.name.lastIndexOf(".wxml") != -1 ? "application/xml" : "application/freemind";
                setModel({...model});
            };

            // Read in the image file as a data URL.
            reader.readAsText(file);
        }

    };

    return (
        <div>
            <BaseDialog onClose={handleOnClose} onSubmit={handleOnSubmit} error={error}
                title={intl.formatMessage({ id: 'import.title', defaultMessage: 'Import existing mindmap' })}
                description={intl.formatMessage({ id: 'import.description', defaultMessage: 'You can import FreeMind 1.0.1 and WiseMapping maps to your list of maps. Select the file you want to import.' })}
                submitButton={intl.formatMessage({ id: 'import.button', defaultMessage: 'Create' })}>

                <FormControl fullWidth={true}>
                    <input
                        accept=".wxml,.mm"
                        id="contained-button-file"
                        type="file"
                        required={true}
                        style={{ display: 'none' }}
                        onChange={handleOnFileChange}
                    />

                    <Input name="title" type="text" label={intl.formatMessage({ id: "action.rename-name-placeholder", defaultMessage: "Name" })}
                        value={model.title} onChange={handleOnChange} error={error} fullWidth={true} />

                    <Input name="description" type="text" label={intl.formatMessage({ id: "action.rename-description-placeholder", defaultMessage: "Description" })}
                        value={model.description} onChange={handleOnChange} required={false} fullWidth={true} />

                    <label htmlFor="contained-button-file">
                        <Button variant="outlined" color="primary" component="span" style={{ margin: '10px 5px', width: '100%' }}>
                            <FormattedMessage id="maps.choose-file" defaultMessage="Choose a file" />
                        </Button>
                    </label>
                </FormControl>
            </BaseDialog>
        </div>
    );
}

export default ImportDialog;