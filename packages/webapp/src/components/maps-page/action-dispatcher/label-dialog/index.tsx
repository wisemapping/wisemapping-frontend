/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
import { Interpolation, Theme } from '@emotion/react';

const LabelDialog = ({ mapsId, onClose }: MultiDialogProps): React.ReactElement => {
  const intl = useIntl();
  const classes = useStyles();
  const client: Client = useSelector(activeInstance);
  const queryClient = useQueryClient();

  const { data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
    return client.fetchAllMaps();
  });
  const [error, setError] = React.useState<ErrorInfo>();
  const maps = data?.filter((m) => mapsId.includes(m.id));

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
    if (maps) {
      changeLabelMutation.mutate({ maps, label, checked });
    }
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
        papercss={classes.paper}
        error={error}
      >
        {maps && (
          <>
            <Typography
              variant="body2"
              marginTop="10px"
              css={classes.title as Interpolation<Theme>}
            >
              <FormattedMessage id="label.add-for" defaultMessage="Editing labels for " />
              {maps && maps.length > 1 ? (
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
        )}
      </BaseDialog>
    </div>
  );
};

export default LabelDialog;
