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
import { fireEvent, screen, waitFor } from '@testing-library/react';

import SystemInformation from '../../../../src/components/admin-console/system-page';
import AppConfig from '../../../../src/classes/app-config';
import type {
  AdminClientInterface,
  SystemHealth,
  SystemInfo,
} from '../../../../src/classes/client/admin-client';
import { renderWithWrapper } from '../providers';
import { buildAdminClient, MockAdminClient } from './fixtures';

const MB = 1024 * 1024;

const systemInfo = (overrides: Partial<SystemInfo> = {}): SystemInfo => ({
  application: { name: 'wisemapping-api', port: '8080' },
  database: {
    driver: 'org.postgresql.Driver',
    url: 'jdbc:postgresql://db/wisemapping',
    username: 'wise',
    hibernateDdlAuto: 'validate',
  },
  jvm: {
    javaVersion: '21.0.2',
    javaVendor: 'Eclipse Adoptium',
    uptime: (2 * 24 * 3600 + 3 * 3600 + 4 * 60) * 1000,
    startTime: Date.UTC(2026, 0, 1),
    maxMemory: 1024 * MB,
    usedMemory: 256 * MB,
    totalMemory: 512 * MB,
    availableProcessors: 8,
    systemLoadAverage: 1.234,
  },
  statistics: { totalUsers: 120, totalMindmaps: 3400 },
  ...overrides,
});

const health = (overrides: Partial<SystemHealth> = {}): SystemHealth => ({
  database: 'UP',
  memory: 'WARNING',
  memoryUsagePercent: 42.5,
  ...overrides,
});

let client: MockAdminClient;

const setup = (info: SystemInfo = systemInfo(), systemHealth: SystemHealth = health()) => {
  client.getSystemInfo.mockResolvedValue(info);
  client.getSystemHealth.mockResolvedValue(systemHealth);
  return renderWithWrapper(<SystemInformation />);
};

describe('SystemInformation', () => {
  beforeEach(() => {
    client = buildAdminClient();
    jest
      .spyOn(AppConfig, 'getAdminClient')
      .mockReturnValue(client as unknown as AdminClientInterface);
  });

  test('shows a loading message first', () => {
    client.getSystemInfo.mockReturnValue(new Promise(() => undefined));
    client.getSystemHealth.mockReturnValue(new Promise(() => undefined));
    renderWithWrapper(<SystemInformation />);

    expect(screen.getByText('Loading system information...')).toBeTruthy();
  });

  test('shows the health, application, database, JVM, memory and statistics', async () => {
    setup();

    expect(await screen.findByText('System Information')).toBeTruthy();
    // Health chips.
    expect(screen.getByText('UP').closest('.MuiChip-root')?.className).toContain('colorSuccess');
    expect(screen.getByText('WARNING').closest('.MuiChip-root')?.className).toContain(
      'colorWarning',
    );
    expect(screen.getByText('(42.5%)')).toBeTruthy();
    // Application and database.
    expect(screen.getByText('wisemapping-api')).toBeTruthy();
    expect(screen.getByText('8080')).toBeTruthy();
    expect(screen.getByText('org.postgresql.Driver')).toBeTruthy();
    expect(screen.getByText('jdbc:postgresql://db/wisemapping')).toBeTruthy();
    expect(screen.getByText('validate')).toBeTruthy();
    // JVM.
    expect(screen.getByText('21.0.2')).toBeTruthy();
    expect(screen.getByText('2d 3h 4m')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('1.23')).toBeTruthy();
    // Memory, in human units.
    expect(screen.getByText('1 GB')).toBeTruthy();
    expect(screen.getByText('256 MB')).toBeTruthy();
    expect(screen.getByText('512 MB')).toBeTruthy();
    expect(screen.getByText('25.0%')).toBeTruthy();
    // Statistics.
    expect(screen.getByText('120')).toBeTruthy();
    expect(screen.getByText('3400')).toBeTruthy();
  });

  test.each([
    [5 * 3600 * 1000 + 7 * 60 * 1000, '5h 7m'],
    [3 * 60 * 1000 + 9000, '3m 9s'],
    [42 * 1000, '42s'],
  ])('formats an uptime of %d ms as %s', async (uptime, text) => {
    const info = systemInfo();
    info.jvm = { ...info.jvm, uptime };
    setup(info);

    expect(await screen.findByText(text)).toBeTruthy();
  });

  test('handles missing values: unknown health, no load average, zero bytes, no statistics', async () => {
    const info = systemInfo({ statistics: { error: 'Statistics unavailable' } });
    info.jvm = {
      ...info.jvm,
      usedMemory: 0,
      systemLoadAverage: undefined as unknown as number,
    };
    setup(info, { database: 'DOWN', memory: '' } as SystemHealth);

    expect(await screen.findByText('DOWN')).toBeTruthy();
    expect(screen.getByText('DOWN').closest('.MuiChip-root')?.className).toContain('colorError');
    expect(screen.getByText('Unknown')).toBeTruthy();
    expect(screen.getByText('N/A')).toBeTruthy();
    expect(screen.getByText('0 Bytes')).toBeTruthy();
    expect(screen.getByText('Statistics unavailable')).toBeTruthy();
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  test('an unrecognised health status is shown as healthy', async () => {
    setup(systemInfo(), health({ database: 'DEGRADED', memoryUsagePercent: 95 }));

    expect((await screen.findByText('DEGRADED')).closest('.MuiChip-root')?.className).toContain(
      'colorSuccess',
    );
    // Over 90 % the usage bar turns red.
    expect(document.querySelector('.MuiLinearProgress-colorError')).toBeTruthy();
  });

  test('explains how to enable the listing metrics when they are off', async () => {
    setup();

    expect(await screen.findByText('Disabled')).toBeTruthy();
    expect(screen.getByText(/log-mindmap-listing/)).toBeTruthy();
  });

  test('waits for a first listing request before showing metrics', async () => {
    setup(systemInfo({ mindmapListingMetrics: { enabled: true } }));

    expect(await screen.findByText('Enabled')).toBeTruthy();
    expect(
      screen.getByText('Waiting for the next mindmap listing request to capture metrics.'),
    ).toBeTruthy();
  });

  test('shows the last listing snapshot with its segments and top queries', async () => {
    setup(
      systemInfo({
        mindmapListingMetrics: {
          enabled: true,
          lastUpdated: Date.UTC(2026, 4, 1),
          totalTimeMs: 1534,
          mapCount: 12,
          collaborationCount: 30,
          executedStatements: 7,
          segments: [
            { name: 'query', timeMs: 900, ratio: 0.587 },
            { name: 'mapping', timeMs: 634, ratio: 1.5 },
          ],
          topQueries: [{ sql: 'select * from mindmap', executions: 3 }],
        },
      }),
    );

    expect(await screen.findByText('Enabled')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    // Missing counters read as a dash.
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText(/query: 900 ms \(\s*58\.7%\)/)).toBeTruthy();
    expect(screen.getByText(/mapping: 634 ms \(\s*150\.0%\)/)).toBeTruthy();
    expect(screen.getByText('3x | select * from mindmap')).toBeTruthy();
  });

  test('a snapshot without segments or queries shows only the counters', async () => {
    setup(
      systemInfo({
        mindmapListingMetrics: { enabled: true, lastUpdated: 0, segments: [], topQueries: [] },
      }),
    );

    expect(await screen.findByText('Enabled')).toBeTruthy();
    // lastUpdated 0 is a snapshot, but has no date to show.
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    expect(screen.queryByText('Execution Segments')).toBeNull();
    expect(screen.queryByText('Top Queries')).toBeNull();
  });

  test('"Refresh" reloads both the information and the health', async () => {
    setup();
    await screen.findByText('System Information');
    const infoCalls = client.getSystemInfo.mock.calls.length;
    const healthCalls = client.getSystemHealth.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => expect(client.getSystemInfo.mock.calls.length).toBeGreaterThan(infoCalls));
    expect(client.getSystemHealth.mock.calls.length).toBeGreaterThan(healthCalls);
  });

  test('a failure offers to retry', async () => {
    client.getSystemInfo.mockRejectedValue(new Error('down'));
    client.getSystemHealth.mockResolvedValue(health());
    renderWithWrapper(<SystemInformation />);

    expect(await screen.findByText('Failed to load system information')).toBeTruthy();

    client.getSystemInfo.mockResolvedValue(systemInfo());
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('System Information')).toBeTruthy();
  });
});
