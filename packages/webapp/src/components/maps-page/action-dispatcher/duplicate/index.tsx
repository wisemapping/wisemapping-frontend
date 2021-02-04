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

export type DuplicateModel = {
    id: number;
    title: string;
    description?: string;
}

const defaultModel: DuplicateModel = { title: '', description: '', id: -1 };
const DuplicateDialog = (props: DialogProps) => {
    const service: Client = useSelector(activeInstance);
    const [model, setModel] = React.useState<DuplicateModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const { mapId, open } = props;

    const intl = useIntl();
    const queryClient = useQueryClient();

    const mutation = useMutation<number, ErrorInfo, DuplicateModel>((model: DuplicateModel) => {
        const { id, ...rest } = model;
        return service.duplicateMap(id, rest);
    },
        {
            onSuccess: (mapId) => {
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

    const { map } = fetchMapById(mapId);
    useEffect(() => {
        if (open && map) {
            setModel(map);
        } else {
            setModel(defaultModel);
            setError(undefined);
        }
    }, [mapId])

    return (
        <div>
            <BaseDialog open={open} onClose={handleOnClose} onSubmit={handleOnSubmit} error={error}
                title={intl.formatMessage({ id: 'duplicate.title', defaultMessage: 'Duplicate' })}
                description={intl.formatMessage({ id: 'rename.description', defaultMessage: 'Please, fill the new map name and description.' })}
                submitButton={intl.formatMessage({ id: 'duplicate.title', defaultMessage: 'Duplicate' })}>

                <FormControl fullWidth={true}>
                    <Input name="title" type="text" label={{ id: "action.rename-name-placeholder", defaultMessage: "Name" }}
                        value={model.title} onChange={handleOnChange} error={error} fullWidth={true} />

                    <Input name="description" type="text" label={{ id: "action.rename-description-placeholder", defaultMessage: "Description" }}
                        value={model.description} onChange={handleOnChange} required={false} fullWidth={true} />
                </FormControl>
            </BaseDialog>
        </div>
    );
}

export default DuplicateDialog;