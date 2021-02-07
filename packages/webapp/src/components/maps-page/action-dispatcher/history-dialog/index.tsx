import React, { ErrorInfo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import Client, { ChangeHistory } from "../../../../client";
import { activeInstance } from '../../../../redux/clientSlice';
import { DialogProps } from "..";
import BaseDialog from "../base-dialog";
import { Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@material-ui/core";
import moment from "moment";


const HistoryDialog = (props: DialogProps) => {
  const intl = useIntl();
  const mapId = props.mapId;

  const client: Client = useSelector(activeInstance);
  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, ChangeHistory[]>('history', () => {
    return client.fetchHistory(mapId);
  });
  const changeHistory: ChangeHistory[] = data ? data : [];

  const handleOnClose = (): void => {
    props.onClose();
  };

  const handleOnClick = (event, vid): void => {
    event.preventDefault();
    client.revertHistory(mapId, vid)
      .then((mapId) => {
        handleOnClose();
      })
  };


  return (
    <div>
      <BaseDialog
        onClose={handleOnClose}
        title={intl.formatMessage({ id: "action.history-title", defaultMessage: "Version history" })}
        description={intl.formatMessage({ id: "action.history-description", defaultMessage: "List of changes introduced in the last 90 days." })} >

        <TableContainer component={Paper} style={{ maxHeight: '200px' }} variant="outlined">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="left"><FormattedMessage id="maps.modified-by" defaultMessage="Modified By" /></TableCell>
                <TableCell align="left"><FormattedMessage id="maps.modified" defaultMessage="Modified" /></TableCell>
                <TableCell align="left"></TableCell>
                <TableCell align="left"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

              {changeHistory.length == 0 ? (
                <TableRow>
                  <TableCell colSpan={4}><FormattedMessage id='history.no-changes' defaultMessage='There is no changes available' />
                  </TableCell>
                </TableRow>
              ) :
                changeHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="left">{row.lastModificationBy}</TableCell>
                    <TableCell align="left">
                      <Tooltip title={moment(row.lastModificationTime).format("lll")} placement="bottom-start">
                        <span>{moment(row.lastModificationTime).fromNow()}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left"><Link href={`c/maps/${mapId}/${row.id}/view`} target="history"><FormattedMessage id="maps.view" defaultMessage="View" /></Link></TableCell>
                    <TableCell align="left"><Link href="#" onClick={(e) => handleOnClick(e, row.id)}><FormattedMessage id="maps.revert" defaultMessage="Revert" /></Link></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>


      </BaseDialog>
    </div>
  );
}

export default HistoryDialog;