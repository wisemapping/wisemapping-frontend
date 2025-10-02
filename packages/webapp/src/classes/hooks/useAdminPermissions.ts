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

import { useState, useEffect, useContext } from 'react';
import { ClientContext } from '../provider/client-context';
import AppConfig from '../app-config';
import { AdminClientInterface } from '../client/admin-client';
import JwtTokenConfig from '../jwt-token-config';

interface AdminPermissionsState {
  isAdmin: boolean | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check if the current user has admin permissions
 * This hook attempts to access admin endpoints to verify permissions
 */
export const useAdminPermissions = (): AdminPermissionsState => {
  const [state, setState] = useState<AdminPermissionsState>({
    isAdmin: null,
    loading: true,
    error: null,
  });

  const client = useContext(ClientContext);

  useEffect(() => {
    const checkAdminPermissions = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Get the admin client to test permissions
        const adminClient: AdminClientInterface = AppConfig.getAdminClient();

        // Try to access a simple admin endpoint to check permissions
        await adminClient.getAdminUsers({ page: 0, pageSize: 1 });

        setState({
          isAdmin: true,
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        console.log('Admin permission check failed:', err);

        const error = err as Record<string, unknown>;

        // Handle CORS errors specifically
        const errorMessage = error?.message as string;
        if (
          errorMessage?.includes('CORS') ||
          errorMessage?.includes('Access-Control-Allow-Origin')
        ) {
          console.warn(
            'CORS error detected - this may indicate the frontend and backend are on different domains',
          );
          setState({
            isAdmin: false,
            loading: false,
            error: null, // Don't show error for CORS issues, just assume no admin access
          });
        } else if (error?.status === 403 || error?.status === 401) {
          setState({
            isAdmin: false,
            loading: false,
            error: 'Access denied. Admin permissions required.',
          });
        } else {
          setState({
            isAdmin: false,
            loading: false,
            error: 'Failed to verify admin permissions. Please try again.',
          });
        }
      }
    };

    // Only check permissions if user is authenticated (has JWT token)
    const jwtToken = JwtTokenConfig.retreiveToken();
    if (jwtToken) {
      checkAdminPermissions();
    } else {
      setState({
        isAdmin: false,
        loading: false,
        error: null,
      });
    }
  }, [client]);

  return state;
};
