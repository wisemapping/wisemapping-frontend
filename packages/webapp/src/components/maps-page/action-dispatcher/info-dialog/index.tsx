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

import { ErrorInfo } from '../../../../classes/client';
import BaseDialog from '../base-dialog';
import { SimpleDialogProps } from '..';
import {
  StyledScrollContainer,
  InfoSection,
  SectionTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
  StyledDivider,
} from './styled';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { useFetchMapById } from '../../../../classes/middleware';

// Load fromNow plugin
dayjs.extend(LocalizedFormat);

const InfoDialog = ({ mapId, onClose }: SimpleDialogProps): React.ReactElement => {
  const { data: map } = useFetchMapById(mapId);
  const [error, setError] = React.useState<ErrorInfo>();

  const intl = useIntl();

  const handleOnClose = (): void => {
    onClose();
    setError(undefined);
  };

  return (
    <BaseDialog
      onClose={handleOnClose}
      error={error}
      title={intl.formatMessage({ id: 'info.title', defaultMessage: 'Info' })}
      description={intl.formatMessage({
        id: 'info.description-msg',
        defaultMessage: 'By publishing the map you make it visible to everyone on the Internet.',
      })}
      submitButton={intl.formatMessage({ id: 'info.button', defaultMessage: 'Accept' })}
    >
      <StyledScrollContainer>
        <InfoSection>
          <SectionTitle variant="body1">
            <FormattedMessage id="info.basic-info" defaultMessage="Basic Info" />
          </SectionTitle>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.name" defaultMessage="Name" />:
            </InfoLabel>
            <InfoValue variant="body2">{map?.title}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.description" defaultMessage="Description" />:
            </InfoLabel>
            <InfoValue variant="body2">{map?.description}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.creator" defaultMessage="Creator" />:
            </InfoLabel>
            <InfoValue variant="body2">{map?.createdBy}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.creation-time" defaultMessage="Creation Date" />:
            </InfoLabel>
            <InfoValue variant="body2">{dayjs(map?.creationTime).format('LLL')}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.modified-tny" defaultMessage="Last Modified By" />:
            </InfoLabel>
            <InfoValue variant="body2">{map?.lastModificationBy}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.modified-time" defaultMessage="Last Modified Date" />:
            </InfoLabel>
            <InfoValue variant="body2">{dayjs(map?.lastModificationTime).format('LLL')}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.starred" defaultMessage="Starred" />:
            </InfoLabel>
            <InfoValue variant="body2">{Boolean(map?.starred).toString()}</InfoValue>
          </InfoRow>
        </InfoSection>

        <StyledDivider />

        <InfoSection>
          <SectionTitle variant="body1">
            <FormattedMessage id="info.sharing" defaultMessage="Sharing" />
          </SectionTitle>

          <InfoRow>
            <InfoLabel variant="caption">
              <FormattedMessage id="info.public-visibility" defaultMessage="Publicly Visible" />:
            </InfoLabel>
            <InfoValue variant="body2">{Boolean(map?.public).toString()}</InfoValue>
          </InfoRow>
        </InfoSection>
      </StyledScrollContainer>
    </BaseDialog>
  );
};

export default InfoDialog;
