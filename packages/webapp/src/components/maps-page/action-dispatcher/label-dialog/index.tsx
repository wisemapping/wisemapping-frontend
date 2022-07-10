import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Typography from '@mui/material/Typography';

import { useStyles } from './style';
import { MultiDialogProps } from '..';
import BaseDialog from '../base-dialog';
import Client, { ErrorInfo, Label, MapInfo } from '../../../../classes/client';
import { LabelSelector } from '../../maps-list/label-selector';
import { activeInstance } from '../../../../redux/clientSlice';
import { ChangeLabelMutationFunctionParam, getChangeLabelMutationFunction } from '../../maps-list';

const LabelDialog = ({ mapsId, onClose }: MultiDialogProps): React.ReactElement => {
  const intl = useIntl();
  const classes = useStyles();
  const client: Client = useSelector(activeInstance);
  const queryClient = useQueryClient();

  // TODO: pass down map data instead of using query?
  const { data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
    return client.fetchAllMaps();
  });
  const [error, setError] = React.useState<ErrorInfo>();

  const maps = data.filter((m) => mapsId.includes(m.id));

  const changeLabelMutation = useMutation<
    void,
    ErrorInfo,
    ChangeLabelMutationFunctionParam,
    number
  >(getChangeLabelMutationFunction(client), {
    onSuccess: () => {
      queryClient.invalidateQueries('maps');
      queryClient.invalidateQueries('labels');
    },
    onError: (error) => {
      setError(error);
    },
  });

  const handleChangesInLabels = (label: Label, checked: boolean) => {
    setError(undefined);
    changeLabelMutation.mutate({
      maps,
      label,
      checked,
    });
  };

  return (
    <div>
      <BaseDialog
        onClose={onClose}
        title={intl.formatMessage({
          id: 'label.title',
          defaultMessage: 'Add a label',
        })}
        description={intl.formatMessage({
          id: 'label.description',
          defaultMessage: 'Use labels to organize your maps.',
        })}
        PaperProps={{ classes: { root: classes.paper } }}
        error={error}
      >
        <>
          <Typography variant="body2" marginTop="10px">
            <FormattedMessage id="label.add-for" defaultMessage="Editing labels for " />
            {maps.length > 1 ? (
              <FormattedMessage
                id="label.maps-count"
                defaultMessage="{count} maps"
                values={{ count: maps.length }}
              />
            ) : (
              maps.map((m) => m.title).join(', ')
            )}
          </Typography>
          <LabelSelector onChange={handleChangesInLabels} maps={maps} />
        </>
      </BaseDialog>
    </div>
  );
};

export default LabelDialog;
