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

import React, { useContext, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import { FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ClientContext } from '../../../classes/provider/client-context';
import { ErrorInfo, MapInfo } from '../../../classes/client';
import { getMapEditUrl } from '../../../utils/mapUrls';

dayjs.extend(relativeTime);

export interface RecentActivityStrandProps {
  /** Maximum number of recently-touched maps to show. Defaults to 3. */
  limit?: number;
}

/**
 * "Picked up where you left off" strand for the map library (1b).
 * Reads the same `['maps']` react-query cache MapsList populates — no
 * dedicated fetch. Per plan.md Architecture Decision 4: shows map title +
 * last editor + relative time only, no field-level diff text.
 */
export const RecentActivityStrand = ({
  limit = 3,
}: RecentActivityStrandProps): React.ReactElement | null => {
  const client = useContext(ClientContext);
  const intl = useIntl();

  const { data: mapsData = [] } = useQuery<unknown, ErrorInfo, MapInfo[]>({
    queryKey: ['maps'],
    queryFn: () => client.fetchAllMaps(),
  });

  const recent = useMemo(
    () =>
      [...mapsData]
        .sort(
          (a, b) =>
            new Date(b.lastModificationTime).getTime() - new Date(a.lastModificationTime).getTime(),
        )
        .slice(0, limit),
    [mapsData, limit],
  );

  if (recent.length === 0) {
    return null;
  }

  return (
    <Box data-testid="recent-activity-strand" sx={{ padding: '4px 24px 16px 24px' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: '8px' }}>
        <FormattedMessage
          id="maps.recent-activity-title"
          defaultMessage="Pick up where you left off"
        />
      </Typography>
      <Box sx={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {recent.map((map) => (
          <Card key={map.id} data-testid={`recent-activity-${map.id}`} sx={{ minWidth: '220px' }}>
            <CardContent>
              <Typography variant="body2" noWrap>
                {map.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {intl.formatMessage(
                  {
                    id: 'maps.recent-activity-subtitle',
                    defaultMessage: '{by} · {when}',
                  },
                  { by: map.lastModificationBy, when: dayjs(map.lastModificationTime).fromNow() },
                )}
              </Typography>
              <Button
                component="a"
                href={getMapEditUrl(map)}
                size="small"
                sx={{ marginTop: '4px', paddingLeft: 0 }}
                data-testid={`recent-activity-continue-${map.id}`}
              >
                <FormattedMessage id="maps.recent-activity-continue" defaultMessage="Continue" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default RecentActivityStrand;
