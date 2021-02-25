import React, { ErrorInfo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import Client, { ChangeHistory } from '../../../../classes/client';
import { activeInstance } from '../../../../redux/clientSlice';
import { SimpleDialogProps } from '..';
import BaseDialog from '../base-dialog';
import dayjs from 'dayjs';

import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';

const HistoryDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
    const intl = useIntl();

    const client: Client = useSelector(activeInstance);
    const { data } = useQuery<unknown, ErrorInfo, ChangeHistory[]>('history', () => {
        return client.fetchHistory(mapId);
    });
    const changeHistory: ChangeHistory[] = data ? data : [];

    const handleOnClose = (): void => {
        onClose();
    };

    const handleOnClick = (event, vid): void => {
        event.preventDefault();
        client.revertHistory(mapId, vid).then(() => {
            handleOnClose();
        });
    };

    return (
        <div>
            <BaseDialog
                onClose={handleOnClose}
                title={intl.formatMessage({
                    id: 'action.history-title',
                    defaultMessage: 'Version history',
                })}
                description={intl.formatMessage({
                    id: 'action.history-description',
                    defaultMessage: 'List of changes introduced in the last 90 days.',
                })}
            >
                <TableContainer component={Paper} style={{ maxHeight: '200px' }} variant="outlined">
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">
                                    <FormattedMessage
                                        id="maps.modified-by"
                                        defaultMessage="Modified By"
                                    />
                                </TableCell>
                                <TableCell align="left">
                                    <FormattedMessage
                                        id="maps.modified"
                                        defaultMessage="Modified"
                                    />
                                </TableCell>
                                <TableCell align="left"></TableCell>
                                <TableCell align="left"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {changeHistory.length == 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <FormattedMessage
                                            id="history.no-changes"
                                            defaultMessage="There is no changes available"
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                changeHistory.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell align="left">{row.lastModificationBy}</TableCell>
                                        <TableCell align="left">
                                            <Tooltip
                                                title={dayjs(row.lastModificationTime).format(
                                                    'lll'
                                                )}
                                                placement="bottom-start"
                                            >
                                                <span>
                                                    {dayjs(row.lastModificationTime).fromNow()}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="left">
                                            <Link
                                                href={`c/maps/${mapId}/${row.id}/view`}
                                                target="history"
                                            >
                                                <FormattedMessage
                                                    id="maps.view"
                                                    defaultMessage="View"
                                                />
                                            </Link>
                                        </TableCell>
                                        <TableCell align="left">
                                            <Link
                                                href="#"
                                                onClick={(e) => handleOnClick(e, row.id)}>
                                                <FormattedMessage
                                                    id="maps.revert"
                                                    defaultMessage="Revert"
                                                />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </BaseDialog>
        </div>
    );
};

export default HistoryDialog;
