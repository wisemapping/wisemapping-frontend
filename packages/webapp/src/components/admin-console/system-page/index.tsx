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
import { ReactElement, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import AppConfig from '../../../classes/app-config';
import { useDate } from '../../../classes/app-i18n/dates';

// Material-UI imports with tree shaking
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// Removed Grid import - using Box instead
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import ComputerIcon from '@mui/icons-material/Computer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { SectionHeader } from '../styled';
import { InfoCard, InfoCards, StatTile } from './styled';

// Byte multiples, in steps of 1024, as Intl unit identifiers.
const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];

const SystemInformation = (): ReactElement => {
  const intl = useIntl();
  const date = useDate();
  const client = AppConfig.getAdminClient();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch system information
  const {
    data: systemInfo,
    isLoading: loadingInfo,
    error: infoError,
    refetch: refetchInfo,
  } = useQuery({
    queryKey: ['systemInfo', refreshKey],
    queryFn: () => client.getSystemInfo(),
    refetchInterval: 120000, // Refresh every 2 minutes (less aggressive)
  });

  // Fetch system health
  const {
    data: systemHealth,
    isLoading: loadingHealth,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['systemHealth', refreshKey],
    queryFn: () => client.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds (less aggressive)
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetchInfo();
    refetchHealth();
  };

  // Numbers, units and dates in the page's language, not the browser's.
  const formatBytes = (bytes: number): string => {
    const i =
      bytes > 0 ? Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024))) : 0;
    return intl.formatNumber(bytes / Math.pow(1024, i), {
      style: 'unit',
      unit: BYTE_UNITS[i] ?? 'byte',
      // "0 bytes", but "256 MB".
      unitDisplay: i === 0 ? 'long' : 'short',
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (ratio: number): string =>
    intl.formatNumber(ratio, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts: [number, string][] =
      days > 0
        ? [
            [days, 'day'],
            [hours % 24, 'hour'],
            [minutes % 60, 'minute'],
          ]
        : hours > 0
          ? [
              [hours, 'hour'],
              [minutes % 60, 'minute'],
            ]
          : minutes > 0
            ? [
                [minutes, 'minute'],
                [seconds % 60, 'second'],
              ]
            : [[seconds, 'second']];
    // 2d 3h 4m in English.
    return intl.formatList(
      parts.map(([value, unit]) =>
        intl.formatNumber(value, { style: 'unit', unit, unitDisplay: 'narrow' }),
      ),
      { type: 'unit', style: 'narrow' },
    );
  };

  const formatDate = (timestamp: number): string => date(timestamp).format('LLL');

  const formatCount = (value: number | undefined): string =>
    value === undefined ? '—' : intl.formatNumber(value);

  // The health codes the backend reports (UP, WARNING, DOWN); any other is shown as is.
  const healthLabel = (status: string | undefined): string => {
    if (!status) {
      return intl.formatMessage({
        id: 'admin.system.health.unknown',
        defaultMessage: 'Unknown',
      });
    }
    switch (status.toLowerCase()) {
      case 'up':
        return intl.formatMessage({ id: 'admin.system.health.up', defaultMessage: 'Up' });
      case 'warning':
        return intl.formatMessage({
          id: 'admin.system.health.warning',
          defaultMessage: 'Warning',
        });
      case 'down':
        return intl.formatMessage({ id: 'admin.system.health.down', defaultMessage: 'Down' });
      default:
        return status;
    }
  };

  const getHealthColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status.toLowerCase()) {
      case 'up':
        return 'success';
      case 'warning':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'success';
    }
  };

  const listingMetrics = systemInfo?.mindmapListingMetrics;
  const hasListingSnapshot = listingMetrics?.enabled && listingMetrics.lastUpdated !== undefined;

  if (loadingInfo || loadingHealth) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {intl.formatMessage({
            id: 'admin.system.loading',
            defaultMessage: 'Loading system information...',
          })}
        </Typography>
      </Box>
    );
  }

  if (infoError || healthError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {intl.formatMessage({
            id: 'admin.system.error',
            defaultMessage: 'Failed to load system information',
          })}
        </Alert>
        <Button onClick={handleRefresh} startIcon={<RefreshIcon />} sx={{ mt: 2 }}>
          {intl.formatMessage({ id: 'common.retry', defaultMessage: 'Retry' })}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <SectionHeader>
        <Typography variant="h5" component="h1">
          {intl.formatMessage({ id: 'admin.system.title', defaultMessage: 'System Information' })}
        </Typography>
        <Tooltip
          title={intl.formatMessage({ id: 'admin.system.refresh', defaultMessage: 'Refresh' })}
        >
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            {intl.formatMessage({ id: 'common.refresh', defaultMessage: 'Refresh' })}
          </Button>
        </Tooltip>
      </SectionHeader>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* System Health */}
        <Box>
          <Card>
            <CardHeader
              avatar={<AssessmentIcon color="primary" />}
              title={intl.formatMessage({
                id: 'admin.system.health',
                defaultMessage: 'System Health',
              })}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="body2">
                    {intl.formatMessage({
                      id: 'admin.system.database',
                      defaultMessage: 'Database',
                    })}
                    :
                  </Typography>
                  <Chip
                    label={healthLabel(systemHealth?.database)}
                    color={getHealthColor(systemHealth?.database || '')}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MemoryIcon color="primary" />
                  <Typography variant="body2">
                    {intl.formatMessage({ id: 'admin.system.memory', defaultMessage: 'Memory' })}:
                  </Typography>
                  <Chip
                    label={healthLabel(systemHealth?.memory)}
                    color={getHealthColor(systemHealth?.memory || '')}
                    size="small"
                  />
                  {systemHealth?.memoryUsagePercent && (
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      ({formatPercent(systemHealth.memoryUsagePercent / 100)})
                    </Typography>
                  )}
                </Box>
                {systemHealth?.memoryUsagePercent && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'admin.system.memory.usage',
                        defaultMessage: 'Memory Usage',
                      })}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.memoryUsagePercent}
                      color={systemHealth.memoryUsagePercent > 90 ? 'error' : 'primary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Application and Database Information */}
        <InfoCards>
          {/* Application Information */}
          <InfoCard>
            <Card>
              <CardHeader
                avatar={<ComputerIcon color="primary" />}
                title={intl.formatMessage({
                  id: 'admin.system.application',
                  defaultMessage: 'Application',
                })}
              />
              <CardContent>
                {systemInfo?.application && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.app.name',
                          defaultMessage: 'Name',
                        })}
                      </Typography>
                      <Typography variant="body2">{systemInfo.application.name}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.app.port',
                          defaultMessage: 'Port',
                        })}
                      </Typography>
                      <Typography variant="body2">{systemInfo.application.port}</Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </InfoCard>

          {/* Database Information */}
          <InfoCard>
            <Card>
              <CardHeader
                avatar={<StorageIcon color="primary" />}
                title={intl.formatMessage({
                  id: 'admin.system.database.info',
                  defaultMessage: 'Database',
                })}
              />
              <CardContent>
                {systemInfo?.database && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.db.driver',
                          defaultMessage: 'Driver',
                        })}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                      >
                        {systemInfo.database.driver}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({ id: 'admin.system.db.url', defaultMessage: 'URL' })}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                      >
                        {systemInfo.database.url}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.db.username',
                          defaultMessage: 'Username',
                        })}
                      </Typography>
                      <Typography variant="body2">{systemInfo.database.username}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.db.ddl',
                          defaultMessage: 'Hibernate DDL',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {systemInfo.database.hibernateDdlAuto}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </InfoCard>
        </InfoCards>

        {/* JVM and Memory Information */}
        <InfoCards>
          {/* JVM Information */}
          <InfoCard>
            <Card>
              <CardHeader
                avatar={<MemoryIcon color="primary" />}
                title={intl.formatMessage({ id: 'admin.system.jvm', defaultMessage: 'JVM' })}
              />
              <CardContent>
                {systemInfo?.jvm && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.jvm.version',
                          defaultMessage: 'Java Version',
                        })}
                      </Typography>
                      <Typography variant="body2">{systemInfo.jvm.javaVersion}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.jvm.vendor',
                          defaultMessage: 'Vendor',
                        })}
                      </Typography>
                      <Typography variant="body2">{systemInfo.jvm.javaVendor}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.jvm.uptime',
                          defaultMessage: 'Uptime',
                        })}
                      </Typography>
                      <Typography variant="body2">{formatUptime(systemInfo.jvm.uptime)}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.jvm.start',
                          defaultMessage: 'Start Time',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(systemInfo.jvm.startTime)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.jvm.processors',
                          defaultMessage: 'Processors',
                        })}
                      </Typography>
                      <Typography variant="body2">{systemInfo.jvm.availableProcessors}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.jvm.load',
                          defaultMessage: 'System Load',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {typeof systemInfo.jvm.systemLoadAverage === 'number'
                          ? intl.formatNumber(systemInfo.jvm.systemLoadAverage, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : intl.formatMessage({ id: 'common.na', defaultMessage: 'N/A' })}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </InfoCard>

          {/* Memory Information */}
          <InfoCard>
            <Card>
              <CardHeader
                avatar={<MemoryIcon color="primary" />}
                title={intl.formatMessage({
                  id: 'admin.system.memory.info',
                  defaultMessage: 'Memory',
                })}
              />
              <CardContent>
                {systemInfo?.jvm && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.memory.max',
                          defaultMessage: 'Max Memory',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatBytes(systemInfo.jvm.maxMemory)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.memory.used',
                          defaultMessage: 'Used Memory',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatBytes(systemInfo.jvm.usedMemory)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.memory.total',
                          defaultMessage: 'Total Memory',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatBytes(systemInfo.jvm.totalMemory)}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.memory.usage',
                          defaultMessage: 'Memory Usage',
                        })}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(systemInfo.jvm.usedMemory / systemInfo.jvm.maxMemory) * 100}
                        sx={{ mt: 0.5 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          mt: 0.5,
                          display: 'block',
                        }}
                      >
                        {formatPercent(systemInfo.jvm.usedMemory / systemInfo.jvm.maxMemory)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </InfoCard>
        </InfoCards>

        {/* Mindmap Listing Performance */}
        <Box>
          <Card>
            <CardHeader
              avatar={<QueryStatsIcon color="primary" />}
              title={intl.formatMessage({
                id: 'admin.system.mindmapMetrics.title',
                defaultMessage: 'Mindmap Listing Performance',
              })}
              action={
                <Chip
                  label={
                    listingMetrics?.enabled
                      ? intl.formatMessage({ id: 'common.enabled', defaultMessage: 'Enabled' })
                      : intl.formatMessage({ id: 'common.disabled', defaultMessage: 'Disabled' })
                  }
                  color={listingMetrics?.enabled ? 'success' : 'default'}
                  size="small"
                />
              }
            />
            <CardContent>
              {!listingMetrics?.enabled && (
                <Alert severity="info">
                  {intl.formatMessage({
                    id: 'admin.system.mindmapMetrics.disabled',
                    defaultMessage:
                      'Set `app.monitoring.performance.log-mindmap-listing` to true to capture metrics.',
                  })}
                </Alert>
              )}

              {listingMetrics?.enabled && !hasListingSnapshot && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {intl.formatMessage({
                    id: 'admin.system.mindmapMetrics.pending',
                    defaultMessage:
                      'Waiting for the next mindmap listing request to capture metrics.',
                  })}
                </Typography>
              )}

              {listingMetrics?.enabled && hasListingSnapshot && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.lastUpdated',
                          defaultMessage: 'Last Updated',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {listingMetrics?.lastUpdated
                          ? formatDate(listingMetrics.lastUpdated)
                          : intl.formatMessage({ id: 'common.na', defaultMessage: 'N/A' })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.totalTime',
                          defaultMessage: 'Total Time (ms)',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatCount(listingMetrics?.totalTimeMs)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.mapCount',
                          defaultMessage: 'Maps Returned',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatCount(listingMetrics?.mapCount)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.collaborations',
                          defaultMessage: 'Collaborations Considered',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatCount(listingMetrics?.collaborationCount)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.executedStatements',
                          defaultMessage: 'Prepared Statements',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatCount(listingMetrics?.executedStatements)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.entityLoads',
                          defaultMessage: 'Entity Loads',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {formatCount(listingMetrics?.entityLoads)}
                      </Typography>
                    </Box>
                  </Box>

                  {(listingMetrics?.segments?.length ?? 0) > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.segments',
                          defaultMessage: 'Execution Segments',
                        })}
                      </Typography>
                      {listingMetrics?.segments?.map((segment) => (
                        <Box
                          key={segment.name}
                          sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                        >
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {segment.name}:{' '}
                            {intl.formatNumber(segment.timeMs, {
                              style: 'unit',
                              unit: 'millisecond',
                              unitDisplay: 'short',
                            })}{' '}
                            ({formatPercent(segment.ratio)})
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.max(0, Math.min(100, segment.ratio * 100))}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {(listingMetrics?.topQueries?.length ?? 0) > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="subtitle2">
                        {intl.formatMessage({
                          id: 'admin.system.mindmapMetrics.topQueries',
                          defaultMessage: 'Top Queries',
                        })}
                      </Typography>
                      {listingMetrics?.topQueries?.map((query, index) => (
                        <Box
                          // eslint-disable-next-line @eslint-react/no-array-index-key -- a read-only snapshot, never reordered; the SQL text is not guaranteed unique
                          key={`${query.sql}-${index}`}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                          >
                            {intl.formatNumber(query.executions)}x | {query.sql}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Statistics */}
        <Box>
          <Card>
            <CardHeader
              avatar={<AssessmentIcon color="primary" />}
              title={intl.formatMessage({
                id: 'admin.system.statistics',
                defaultMessage: 'Statistics',
              })}
            />
            <CardContent>
              {systemInfo?.statistics && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <StatTile>
                    <Typography variant="h4" color="primary">
                      {intl.formatNumber(systemInfo.statistics.totalUsers || 0)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'admin.system.stats.users',
                        defaultMessage: 'Total Users',
                      })}
                    </Typography>
                  </StatTile>
                  <StatTile>
                    <Typography variant="h4" color="primary">
                      {intl.formatNumber(systemInfo.statistics.totalMindmaps || 0)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      {intl.formatMessage({
                        id: 'admin.system.stats.mindmaps',
                        defaultMessage: 'Total Mindmaps',
                      })}
                    </Typography>
                  </StatTile>
                </Box>
              )}
              {systemInfo?.statistics?.error && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {systemInfo.statistics.error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemInformation;
