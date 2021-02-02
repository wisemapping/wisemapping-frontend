import React from "react";
import { useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import Client from "../../../../client";
import { activeInstance } from '../../../../reducers/serviceSlice';
import { DialogProps, fetchMapById } from "..";
import BaseDialog from "../action-dialog";
import { useIntl } from "react-intl";


const InfoDialog = (props: DialogProps) => {
  const service: Client = useSelector(activeInstance);
  const queryClient = useQueryClient();
  const intl = useIntl();


  const mapId = props.mapId;
  const handleOnClose = (): void => {
    props.onClose();
  };

  const { map } = fetchMapById(mapId);
  return (
    <div>
      <BaseDialog
        open={props.open} onClose={handleOnClose}
        title={intl.formatMessage({ id: "action.info-title", defaultMessage: "Info" })}>

        <iframe src="http://www.clarin.com" style={{ width: '100%', height: '400px' }} />

      </BaseDialog>
    </div>
  );
}


export default InfoDialog;