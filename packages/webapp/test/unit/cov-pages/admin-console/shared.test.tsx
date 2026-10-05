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
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import AccountStatusChip, {
  getSuspensionReasonLabel,
} from '../../../../src/components/admin-console/shared/AccountStatusChip';
import SpamStatusChip from '../../../../src/components/admin-console/shared/SpamStatusChip';
import UserInfoCard from '../../../../src/components/admin-console/shared/UserInfoCard';
import UserMapsDialog from '../../../../src/components/admin-console/shared/UserMapsDialog';
import { AuthenticationType } from '../../../../src/classes/client';
import { intl } from '../../mocks/react-intl';
import { renderWithWrapper } from '../providers';
import { makeAdminMap, makeUser } from './fixtures';

const formatDate = (date: string): string => `on-${date.slice(0, 10)}`;

describe('getSuspensionReasonLabel', () => {
  test.each([
    ['ABUSE', 'Abuse'],
    ['TERMS_VIOLATION', 'Terms Violation'],
    ['SECURITY_CONCERN', 'Security Concern'],
    ['MANUAL_REVIEW', 'Manual Review'],
    ['INACTIVITY', 'Inactivity'],
    ['OTHER', 'Other'],
    ['SOMETHING_NEW', 'SOMETHING_NEW'],
  ])('%s reads as %s', (code, label) => {
    expect(getSuspensionReasonLabel(code, intl as never)).toBe(label);
  });
});

describe('AccountStatusChip', () => {
  test('a suspended account shows the date and reason in its tooltip', () => {
    renderWithWrapper(
      <AccountStatusChip
        isActive={true}
        isSuspended={true}
        suspensionReason="ABUSE"
        suspendedDate="2026-03-04T00:00:00Z"
      />,
    );

    expect(screen.getByText('Suspended')).toBeTruthy();
    expect(screen.getByLabelText(/Suspended on: .* \| Reason: Abuse$/)).toBeTruthy();
  });

  test('a suspended account without details falls back to a plain tooltip', () => {
    renderWithWrapper(<AccountStatusChip isActive={true} isSuspended={true} />);
    expect(screen.getByLabelText('Suspended')).toBeTruthy();
  });

  test('a non-activated database account shows "Not Activated"', () => {
    renderWithWrapper(
      <AccountStatusChip
        isActive={false}
        isSuspended={false}
        authenticationType={AuthenticationType.DATABASE}
      />,
    );
    expect(screen.getByText('Not Activated')).toBeTruthy();
    expect(screen.getByLabelText('User has not confirmed their email address yet')).toBeTruthy();
  });

  test.each([AuthenticationType.GOOGLE_OAUTH2, AuthenticationType.FACEBOOK_OAUTH2])(
    'a %s account counts as active even when not activated',
    (authenticationType) => {
      renderWithWrapper(
        <AccountStatusChip
          isActive={false}
          isSuspended={false}
          authenticationType={authenticationType}
        />,
      );
      expect(screen.getByText('Active')).toBeTruthy();
      expect(screen.getByLabelText('Account is activated and in good standing')).toBeTruthy();
    },
  );

  test('a non-interactive chip opens no menu', () => {
    const onSuspend = jest.fn();
    renderWithWrapper(
      <AccountStatusChip isActive={true} isSuspended={false} onSuspend={onSuspend} />,
    );

    fireEvent.click(screen.getByText('Active'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  test('an interactive chip without callbacks opens no menu', () => {
    renderWithWrapper(<AccountStatusChip isActive={true} isSuspended={false} interactive />);

    fireEvent.click(screen.getByText('Active'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  test('clicking an active interactive chip offers to suspend', async () => {
    const onSuspend = jest.fn();
    renderWithWrapper(
      <AccountStatusChip isActive={true} isSuspended={false} interactive onSuspend={onSuspend} />,
    );
    expect(
      screen.getByLabelText('Account is activated and in good standing | Click to change status'),
    ).toBeTruthy();

    fireEvent.click(screen.getByText('Active'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Suspend user' }));

    expect(onSuspend).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  test('clicking a suspended interactive chip offers to unsuspend', async () => {
    const onUnsuspend = jest.fn();
    renderWithWrapper(
      <AccountStatusChip
        isActive={true}
        isSuspended={true}
        interactive
        onUnsuspend={onUnsuspend}
      />,
    );
    expect(screen.getByLabelText('Click to change status')).toBeTruthy();

    fireEvent.click(screen.getByText('Suspended'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));
    expect(onUnsuspend).toHaveBeenCalled();
  });

  test('clicking a non-activated interactive chip offers to activate', async () => {
    const onActivate = jest.fn();
    renderWithWrapper(
      <AccountStatusChip
        isActive={false}
        isSuspended={false}
        interactive
        onActivate={onActivate}
      />,
    );
    expect(
      screen.getByLabelText(
        'User has not confirmed their email address yet | Click to change status',
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByText('Not Activated'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Activate user' }));
    expect(onActivate).toHaveBeenCalled();
  });

  test('the menu only offers the action that has a callback', async () => {
    renderWithWrapper(
      <AccountStatusChip isActive={true} isSuspended={false} interactive onActivate={jest.fn()} />,
    );

    fireEvent.click(screen.getByText('Active'));
    const menu = await screen.findByRole('menu');
    expect(within(menu).queryAllByRole('menuitem')).toHaveLength(0);

    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});

describe('SpamStatusChip', () => {
  test('a clean map shows "Clean" and offers to mark it as spam', () => {
    const onToggleSpam = jest.fn();
    renderWithWrapper(
      <SpamStatusChip spam={false} onToggleSpam={onToggleSpam} formatDate={formatDate} />,
    );

    expect(screen.getByText('Clean')).toBeTruthy();
    expect(screen.getByLabelText('Not marked as spam')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'mark-spam' }));
    expect(onToggleSpam).toHaveBeenCalledWith(true);
  });

  test('a spam map shows its type, date and description and can be cleared', () => {
    const onToggleSpam = jest.fn();
    renderWithWrapper(
      <SpamStatusChip
        spam={true}
        spamType="LINKS"
        spamDescription="Too many links"
        spamDetectedDate="2026-03-04T00:00:00Z"
        onToggleSpam={onToggleSpam}
        formatDate={formatDate}
      />,
    );

    expect(screen.getByText('Spam (LINKS)')).toBeTruthy();
    expect(screen.getByLabelText('Detected as spam on on-2026-03-04')).toBeTruthy();
    expect(screen.getByText('Too many links')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'mark-not-spam' }));
    expect(onToggleSpam).toHaveBeenCalledWith(false);
  });

  test('a spam map without type or date says so', () => {
    renderWithWrapper(<SpamStatusChip spam={true} formatDate={formatDate} />);

    expect(screen.getByText('Spam (Unknown)')).toBeTruthy();
    expect(screen.getByLabelText('Marked as spam')).toBeTruthy();
    // No callback, no toggle.
    expect(screen.queryByRole('button', { name: /spam/ })).toBeNull();
  });

  test('the toggle is disabled while loading and can be hidden', () => {
    const onToggleSpam = jest.fn();
    const { rerender } = renderWithWrapper(
      <SpamStatusChip spam={false} onToggleSpam={onToggleSpam} formatDate={formatDate} loading />,
    );

    expect((screen.getByRole('button', { name: 'mark-spam' }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    rerender(
      <SpamStatusChip
        spam={false}
        onToggleSpam={onToggleSpam}
        formatDate={formatDate}
        showToggleButton={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'mark-spam' })).toBeNull();
  });
});

describe('UserInfoCard', () => {
  test.each([
    [AuthenticationType.DATABASE, 'Database'],
    [AuthenticationType.GOOGLE_OAUTH2, 'Google'],
    [AuthenticationType.FACEBOOK_OAUTH2, 'Facebook'],
    [AuthenticationType.LDAP, 'LDAP'],
  ])('shows the %s authentication as %s', (authenticationType, label) => {
    renderWithWrapper(
      <UserInfoCard user={makeUser({ id: 1, authenticationType })} totalMaps={4} />,
    );

    expect(screen.getByText('User Information')).toBeTruthy();
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
  });

  test('shows a spinner while the maps load, and zero when there are none', () => {
    const { rerender, container } = renderWithWrapper(
      <UserInfoCard user={makeUser({ id: 1 })} isLoadingMaps />,
    );
    expect(container.querySelector('.MuiCircularProgress-root')).toBeTruthy();

    rerender(<UserInfoCard user={makeUser({ id: 1 })} />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  test('explains a suspension and lets the admin lift it', async () => {
    const onUnsuspend = jest.fn();
    renderWithWrapper(
      <UserInfoCard
        user={makeUser({
          id: 1,
          isSuspended: true,
          suspensionReason: 'TERMS_VIOLATION',
          suspendedDate: '2026-03-04T00:00:00Z',
        })}
        onUnsuspend={onUnsuspend}
      />,
    );

    expect(screen.getByText(/Suspension Reason:\s+Terms Violation/)).toBeTruthy();
    expect(screen.getByText(/^Suspended on: /)).toBeTruthy();

    fireEvent.click(screen.getByText('Suspended'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Unsuspend user' }));
    expect(onUnsuspend).toHaveBeenCalled();
  });

  test('a suspension without a date only shows the reason', () => {
    renderWithWrapper(
      <UserInfoCard user={makeUser({ id: 1, isSuspended: true, suspensionReason: 'OTHER' })} />,
    );
    expect(screen.getByText(/Suspension Reason:\s+Other/)).toBeTruthy();
    expect(screen.queryByText(/^Suspended on: /)).toBeNull();
  });
});

describe('UserMapsDialog', () => {
  const user = makeUser({ id: 9, email: 'owner@example.com' });
  const maps = [
    makeAdminMap({ id: 31, title: 'Starred map', starred: true, public: true }),
    makeAdminMap({
      id: 32,
      title: 'Spam map',
      description: '',
      spam: true,
      spamType: 'LINKS',
      isLocked: true,
      isLockedBy: 'eve',
    }),
  ];

  const baseProps = {
    open: true,
    onClose: jest.fn(),
    user,
    maps,
    isLoadingUser: false,
    isLoadingMaps: false,
    formatDate,
  };

  test('titles the dialog with the owner and lists their maps', () => {
    renderWithWrapper(<UserMapsDialog {...baseProps} />);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Maps owned by owner@example.com (ID: #9)')).toBeTruthy();
    expect(within(dialog).getByText('User Information')).toBeTruthy();
    expect(within(dialog).getByRole('link', { name: '#31' })).toHaveProperty(
      'href',
      expect.stringContaining('/c/maps/31/public'),
    );
    expect(within(dialog).getByText('Starred map')).toBeTruthy();
    expect(within(dialog).getByText('No description')).toBeTruthy();
    // Default public/private chips when the page passes no chip renderer.
    expect(within(dialog).getByText('Public')).toBeTruthy();
    expect(within(dialog).getByText('Private')).toBeTruthy();
    expect(within(dialog).getByText('Spam (LINKS)')).toBeTruthy();
    // No action callbacks, no action buttons.
    expect(within(dialog).queryByRole('button', { name: 'View XML' })).toBeNull();
  });

  test('wires the row actions and the page chip renderers', () => {
    const onViewXml = jest.fn();
    const onEditMap = jest.fn();
    const onToggleSpam = jest.fn();
    const onDeleteMap = jest.fn();
    renderWithWrapper(
      <UserMapsDialog
        {...baseProps}
        onViewXml={onViewXml}
        onEditMap={onEditMap}
        onToggleSpam={onToggleSpam}
        onDeleteMap={onDeleteMap}
        getPublicChip={(isPublic) => <span>{isPublic ? 'page-public' : 'page-private'}</span>}
        getLockedChip={(isLocked, by) => (
          <span>{isLocked ? `page-locked-${by}` : 'page-free'}</span>
        )}
        getSuspendedUserChip={(suspended) => (suspended ? <span>page-suspended</span> : null)}
      />,
    );

    expect(screen.getByText('page-public')).toBeTruthy();
    expect(screen.getByText('page-locked-eve')).toBeTruthy();
    expect(screen.queryByText('Public')).toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: 'View XML' })[0]);
    expect(onViewXml).toHaveBeenCalledWith(maps[0]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    expect(onEditMap).toHaveBeenCalledWith(maps[1]);

    fireEvent.click(screen.getByRole('button', { name: 'mark-not-spam' }));
    expect(onToggleSpam).toHaveBeenCalledWith(32, true);
    fireEvent.click(screen.getByRole('button', { name: 'mark-spam' }));
    expect(onToggleSpam).toHaveBeenCalledWith(31, false);

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(onDeleteMap).toHaveBeenCalledWith(31, 'Starred map');
  });

  test('says so when the user has no maps, and closes', () => {
    const onClose = jest.fn();
    renderWithWrapper(<UserMapsDialog {...baseProps} maps={[]} onClose={onClose} />);

    expect(screen.getByText('This user has no maps.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('shows spinners while the user or the maps load', () => {
    const { rerender } = renderWithWrapper(
      <UserMapsDialog {...baseProps} user={null} isLoadingUser isLoadingMaps />,
    );
    expect(screen.getByText('Loading user...')).toBeTruthy();
    expect(screen.queryByText('User Information')).toBeNull();
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);

    rerender(<UserMapsDialog {...baseProps} isLoadingMaps />);
    expect(screen.getByText('User Information')).toBeTruthy();
    expect(screen.queryByText('Starred map')).toBeNull();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });
});
