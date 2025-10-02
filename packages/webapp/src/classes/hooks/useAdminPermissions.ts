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

import { useFetchAccountWithState } from '../middleware';

interface AdminPermissionsState {
  isAdmin: boolean | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check if the current user has admin permissions
 * This hook uses the isAdmin field from the user's account information
 */
export const useAdminPermissions = (): AdminPermissionsState => {
  const { data: account, isLoading, error } = useFetchAccountWithState();

  // If account is still loading, return loading state
  if (isLoading) {
    return {
      isAdmin: null,
      loading: true,
      error: null,
    };
  }

  // If there was an error loading the account
  if (error) {
    return {
      isAdmin: null,
      loading: false,
      error: error.msg || 'Failed to load account information',
    };
  }

  // If account is loaded, use the isAdmin field
  return {
    isAdmin: account?.isAdmin || false,
    loading: false,
    error: null,
  };
};
