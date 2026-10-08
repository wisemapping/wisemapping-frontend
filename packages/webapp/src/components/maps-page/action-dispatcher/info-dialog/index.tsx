/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Chip from '@mui/material/Chip';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicIcon from '@mui/icons-material/Public';
import StarIcon from '@mui/icons-material/Star';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

import BaseDialog from '../base-dialog';
import { SimpleDialogProps } from '..';
import UserAvatar from '../user-avatar';
import { useFetchMapById } from '../../../../classes/middleware';
import {
  DetailLabel,
  DetailList,
  DetailRow,
  DetailValue,
  MapDescription,
  MapName,
  SectionTitle,
  StatusChips,
} from './styled';

dayjs.extend(LocalizedFormat);

// A date the backend did not send (or while the map loads) is shown as a dash, not as today.
const formatDate = (value?: string): string => (value ? dayjs(value).format('LLL') : '—');

const Person = ({ name }: { name?: string }): React.ReactElement =>
  name ? (
    <>
      <UserAvatar name={name} />
      {name}
    </>
  ) : (
    <>—</>
  );

const InfoDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const { data: map } = useFetchMapById(mapId);
  const intl = useIntl();

  return (
    <BaseDialog
      onClose={onClose}
      title={intl.formatMessage({ id: 'info.title', defaultMessage: 'Info' })}
      description={intl.formatMessage({
        id: 'info.subtitle',
        defaultMessage: 'Details about this map and the people who work on it.',
      })}
    >
      <MapName>{map?.title}</MapName>
      <MapDescription empty={!map?.description}>
        {map?.description || (
          <FormattedMessage id="info.no-description" defaultMessage="No description" />
        )}
      </MapDescription>

      <StatusChips>
        {map?.public ? (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            icon={<PublicIcon />}
            label={intl.formatMessage({ id: 'info.public', defaultMessage: 'Public' })}
          />
        ) : (
          <Chip
            size="small"
            variant="outlined"
            icon={<LockOutlinedIcon />}
            label={intl.formatMessage({ id: 'info.private', defaultMessage: 'Private' })}
          />
        )}
        {map?.starred && (
          <Chip
            size="small"
            variant="outlined"
            icon={<StarIcon />}
            label={intl.formatMessage({ id: 'info.starred', defaultMessage: 'Starred' })}
          />
        )}
      </StatusChips>

      <SectionTitle>
        <FormattedMessage id="info.basic-info" defaultMessage="Basic Info" />
      </SectionTitle>
      <DetailList>
        <DetailRow>
          <DetailLabel>
            <FormattedMessage id="info.creator" defaultMessage="Creator" />
          </DetailLabel>
          <DetailValue>
            <Person name={map?.createdBy} />
          </DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>
            <FormattedMessage id="info.creation-time" defaultMessage="Creation Date" />
          </DetailLabel>
          <DetailValue>{formatDate(map?.creationTime)}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>
            <FormattedMessage id="info.modified-tny" defaultMessage="Last Modified By" />
          </DetailLabel>
          <DetailValue>
            <Person name={map?.lastModificationBy} />
          </DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>
            <FormattedMessage id="info.modified-time" defaultMessage="Last Modified Date" />
          </DetailLabel>
          <DetailValue>{formatDate(map?.lastModificationTime)}</DetailValue>
        </DetailRow>
      </DetailList>
    </BaseDialog>
  );
};

export default InfoDialog;
