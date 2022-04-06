import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import Client, { ErrorInfo, Permission } from '../../../../classes/client';
import { activeInstance } from '../../../../redux/clientSlice';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { useStyles } from './style';
import RoleIcon from '../../role-icon';
import Tooltip from '@mui/material/Tooltip';

type ShareModel = {
    emails: string;
    role: 'editor' | 'viewer';
    message: string;
};

const defaultModel: ShareModel = { emails: '', role: 'editor', message: '' };
const ShareDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
    const intl = useIntl();
    const client: Client = useSelector(activeInstance);
    const queryClient = useQueryClient();
    const classes = useStyles();
    const [showMessage, setShowMessage] = React.useState<boolean>(false);
    const [model, setModel] = React.useState<ShareModel>(defaultModel);
    const [error, setError] = React.useState<ErrorInfo>();

    const deleteMutation = useMutation(
        (email: string) => {
            return client.deleteMapPermission(mapId, email);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(`perm-${mapId}`);
                setModel(defaultModel);
            },
            onError: (error: ErrorInfo) => {
                setError(error);
            },
        }
    );

    const splitEmail = (emails: string): string[] => {
        return emails.split(/,|;/)
            .map(e => e.trim().replace(/\s/g, ''))
            .filter(e => e.trim().length > 0);
    }


    const addMutation = useMutation(
        (model: ShareModel) => {
            const emails = splitEmail(model.emails);
            const permissions = emails.map((email: string) => {
                return { email: email, role: model.role };
            });
            return client.addMapPermissions(mapId, model.message, permissions);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(`perm-${mapId}`);
                setModel(defaultModel);
            },
            onError: (error: ErrorInfo) => {
                setError(error);
            },
        }
    );

    const handleOnClose = (): void => {
        onClose();

        // Invalidate cache ...
        const queryClient = useQueryClient();
        queryClient.invalidateQueries(`perm-${mapId}`);        
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();

        const name = event.target.name;
        const value = event.target.value;
        setModel({ ...model, [name as keyof ShareModel]: value });
        event.stopPropagation();
    };

    const handleOnAddClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        event.stopPropagation();
        addMutation.mutate(model);
        event.stopPropagation();
    };

    const handleOnDeleteClick = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        email: string
    ): void => {
        event.stopPropagation();
        deleteMutation.mutate(email);
    };

    const { isLoading, data: permissions = [] } = useQuery<unknown, ErrorInfo, Permission[]>(`perm-${mapId}`,
        () => {
            return client.fetchMapPermissions(mapId);
        }
    );

    const formatName = (perm: Permission): string => {
        return perm.name ? `${perm.name}<${perm.email}>` : perm.email;
    };

    // very basic email validation, just make sure the basic syntax is fine
    const isValid = splitEmail(model.emails)
        .every(str => /\S+@\S+\.\S+/.test((str || '')
            .trim()));

    return (
        <div>
            <BaseDialog
                onClose={handleOnClose}
                title={intl.formatMessage({
                    id: 'share.delete-title',
                    defaultMessage: 'Share with people',
                })}
                description={intl.formatMessage({
                    id: 'share.delete-description',
                    defaultMessage:
                        'Invite people to collaborate with you in the creation of your mindmap. They will be notified by email. ',
                })}
                PaperProps={{ classes: { root: classes.paper } }}
                error={error}
            >
                <div className={classes.actionContainer}>
                    <TextField
                        id="emails"
                        name="emails"
                        required={true}
                        style={{ width: '300px' }}
                        size="small"
                        type="email"
                        variant="outlined"
                        placeholder="Add collaborator email"
                        label="Emails"
                        onChange={handleOnChange}
                        value={model.emails}
                    />

                    <Select
                        variant="outlined"
                        onChange={handleOnChange}
                        value={model.role}
                        name="role"
                        style={{ margin: '0px 10px' }}
                    >
                        <MenuItem value="editor">
                            <FormattedMessage id="share.can-edit" defaultMessage="Can edit" />
                        </MenuItem>
                        <MenuItem value="viewer">
                            <FormattedMessage id="share.can-view" defaultMessage="Can view" />
                        </MenuItem>
                    </Select>

                    <FormControlLabel
                        value="start"
                        onChange={(event, value) => {
                            setShowMessage(value);
                        }}
                        style={{ fontSize: '5px' }}
                        control={<Checkbox color="primary" />}
                        label={
                            <Typography variant="subtitle2">
                                <FormattedMessage
                                    id="share.add-message"
                                    defaultMessage="Add message"
                                />
                            </Typography>
                        }
                        labelPlacement="end"
                    />

                    <Button
                        color="primary"
                        type="button"
                        variant="contained"
                        disableElevation={true}
                        onClick={handleOnAddClick}
                        disabled={!isValid}
                    >
                        <FormattedMessage id="share.add-button" defaultMessage="Add" />
                    </Button>

                    {showMessage && (
                        <TextField
                            multiline
                            rows={3}
                            maxRows={3}
                            className={classes.textArea}
                            variant="filled"
                            name="message"
                            onChange={handleOnChange}
                            value={model.message}
                            label={intl.formatMessage({
                                id: 'share.message',
                                defaultMessage: 'Message',
                            })}
                        />
                    )}
                </div>

                {!isLoading && (
                    <Paper elevation={1} className={classes.listPaper} variant="outlined">
                        <List>
                            {permissions &&
                                permissions.map((permission) => {
                                    return (
                                        <ListItem
                                            key={permission.email}
                                            role={undefined}
                                            dense
                                            button
                                        >
                                            <ListItemText
                                                id={permission.email}
                                                primary={formatName(permission)}
                                            />

                                            <RoleIcon role={permission.role} />
                                            <ListItemSecondaryAction>
                                                <Tooltip
                                                    title={
                                                        <FormattedMessage
                                                            id="share.delete"
                                                            defaultMessage="Delete collaborator"
                                                        />
                                                    }
                                                >
                                                    <IconButton
                                                        edge="end"
                                                        disabled={permission.role == 'owner'}
                                                        onClick={(e) =>
                                                            handleOnDeleteClick(e, permission.email)
                                                        }
                                                        size="large">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })}
                        </List>
                    </Paper>
                )}
            </BaseDialog>
        </div>
    );
};

export default ShareDialog;
