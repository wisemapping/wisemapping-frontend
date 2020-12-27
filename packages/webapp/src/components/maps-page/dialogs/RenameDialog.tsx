import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TextField } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { BasicMapInfo, ErrorInfo, Service } from "../../../services/Service";
import { activeInstance } from '../../../reducers/serviceSlice';
import { DialogProps, fetchMapById, handleOnMutationSuccess } from "./DialogCommon";

export type RenameModel = {
    id: number;
    name: string;
    description?: string;
}

const defaultModel: RenameModel = { name: '', description: '', id: -1 };
const RenameDialog = (props: DialogProps) => {
    const service: Service = useSelector(activeInstance);
    const [model, setModel] = React.useState<RenameModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();
    const { mapId, open } = props;

    const intl = useIntl();
    const queryClient = useQueryClient();

    const mutation = useMutation<RenameModel, ErrorInfo, RenameModel>((model: RenameModel) => {
        const { id, ...rest } = model;
        return service.renameMap(id, rest).then(() => model);
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
        setModel(defaultModel);
        setError(undefined);
        props.onClose();
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
            <Dialog
                open={open}
                onClose={() => handleOnClose()} >
                <form autoComplete="off" onSubmit={handleOnSubmit}>
                    <DialogTitle>
                        <FormattedMessage id="action.rename-title" defaultMessage="Rename" />
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            <FormattedMessage id="action.rename-description" defaultMessage="Please, update the name and description for your mindmap." />
                        </DialogContentText>

                        {Boolean(error?.msg) ? <Alert severity="error" variant="filled" hidden={!Boolean(error?.msg)}>{error?.msg}</Alert> : null}
                      
                        <FormControl margin="normal" required fullWidth>
                            <TextField name="name" label={intl.formatMessage({ id: "action.rename-name-placeholder", defaultMessage: "Name" })}
                                value={model.name} onChange={handleOnChange}
                                error={Boolean(error?.fields?.get('name'))} helperText={error?.fields?.get('name')}
                                variant="filled" required={true} />
                        </FormControl>
                        <FormControl margin="normal" required fullWidth>
                            <TextField name="description" label={intl.formatMessage({ id: "action.rename-description-placeholder", defaultMessage: "Description" })} 
                            value={model.description} onChange={handleOnChange} variant="filled" />
                        </FormControl>
                    </DialogContent>

                    <DialogActions>
                        <Button color="primary" variant="outlined" type="submit">
                            <FormattedMessage id="action.rename-button" defaultMessage="Rename" />
                        </Button>

                        <Button color="secondary" variant="outlined" autoFocus onClick={handleOnClose}>
                            <FormattedMessage id="action.cancel-button" defaultMessage="Cancel" />
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}

export default RenameDialog;