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
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';

/**
 * Loading skeleton that mimics the editor layout for smooth transition
 */
const EditorLoadingSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Top Toolbar Skeleton */}
      <Box
        sx={{
          height: 48,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
        }}
      >
        {/* Toolbar buttons skeleton */}
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={40} height={32} sx={{ borderRadius: 1 }} />
        ))}
      </Box>

      {/* Visualization Toolbar Skeleton */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          padding: 1,
          boxShadow: theme.shadows[4],
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
        ))}
      </Box>

      {/* Canvas Area with Central Node Skeleton */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Central Topic Skeleton */}
        <Skeleton
          variant="rectangular"
          width={200}
          height={60}
          sx={{
            borderRadius: 2,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.5 },
            },
          }}
        />

        {/* Surrounding nodes skeleton - subtle branches */}
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            gap: 4,
            opacity: 0.2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mr: 30 }}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1.5 }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 30 }}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1.5 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EditorLoadingSkeleton;
