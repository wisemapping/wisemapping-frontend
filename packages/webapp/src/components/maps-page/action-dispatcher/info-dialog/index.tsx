import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { Card, List, ListItem, Paper, Typography } from '@material-ui/core';


import Client, { ErrorInfo } from '../../../../client';
import { activeInstance } from '../../../../redux/clientSlice';
import BaseDialog from '../base-dialog';
import { fetchMapById, SimpleDialogProps } from '..';
import { useStyles } from './style';
import moment from 'moment';

const InfoDialog = (props: SimpleDialogProps) => {
    const { mapId, onClose } = props;
    const { map } = fetchMapById(mapId);
    const [error, setError] = React.useState<ErrorInfo>();
    const [] = React.useState('1');

    const intl = useIntl();
    const classes = useStyles();

    const handleOnClose = (): void => {
        onClose();
        setError(undefined);
    };

    return (
        <BaseDialog onClose={handleOnClose} error={error}
            title={intl.formatMessage({ id: 'info.title', defaultMessage: 'Info' })}
            description={intl.formatMessage({ id: 'info.description-msg', defaultMessage: 'By publishing the map you make it visible to everyone on the Internet.' })}
            submitButton={intl.formatMessage({ id: 'info.button', defaultMessage: 'Accept' })}>

            <Paper style={{ maxHeight: '200px' }}>
                <Card variant="outlined">
                    <List dense={true}>
                        <ListItem>
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                <FormattedMessage id="info.basic-info" defaultMessage="Basic Info" />
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.name" defaultMessage="Name" />:
                        </Typography>
                            <Typography variant="body2">
                                {map?.title}
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.description" defaultMessage="Description" />:
                        </Typography>
                            <Typography variant="body2">
                                {map?.description}
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.creator" defaultMessage="Creator" />:
                        </Typography>
                            <Typography variant="body2">
                                {map?.createdBy}
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.creation-time" defaultMessage="Creation Date" />:
                        </Typography>
                            <Typography variant="body2">
                                {moment(map?.creationTime).format("lll")}
                            </Typography>
                        </ListItem>


                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.modified-tny" defaultMessage="Last Modified By" />:
                        </Typography>
                            <Typography variant="body2">
                                {map?.lastModificationBy}
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.modified-time" defaultMessage="Last Modified Date" />:
                        </Typography>
                            <Typography variant="body2">
                                {moment(map?.lastModificationTime).format("lll")}
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                                <FormattedMessage id="info.starred" defaultMessage="Starred" />:
                        </Typography>
                            <Typography variant="body2">
                                {Boolean(map?.starred).toString()}
                            </Typography>
                        </ListItem>
                    </List>
                </Card>

                <Card variant="outlined" style={{ marginTop: "10px" }}>
                    <List dense={true}>
                        <ListItem>
                            <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                <FormattedMessage id="info.sharing" defaultMessage="Sharing" />
                            </Typography>
                        </ListItem>
                    </List>
                    <ListItem>
                        <Typography variant="caption" color="textPrimary" className={classes.textDesc}>
                            <FormattedMessage id="info.public-visibility" defaultMessage="Publicly Visible" />:
                        </Typography>
                        <Typography variant="body2">
                            {Boolean(map?.isPublic).toString()}
                        </Typography>
                    </ListItem>

                </Card>
            </Paper>
        </BaseDialog>
    )
}

export default InfoDialog;