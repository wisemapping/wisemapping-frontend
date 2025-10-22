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
import { useEditorLoadingStyles } from './styled';

/**
 * Loading skeleton that mimics the editor layout for smooth transition
 */
const EditorLoadingSkeleton: React.FC = () => {
  const styles = useEditorLoadingStyles();

  return (
    <Box sx={styles.container}>
      {/* Top AppBar Header Skeleton */}
      <Box sx={styles.appBar}>
        {/* Left side - Back button, Logo, Title */}
        <Box sx={styles.appBarLeft}>
          <Skeleton
            animation="wave"
            variant="circular"
            width={32}
            height={32}
            sx={styles.skeletonBase}
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={120}
            height={32}
            sx={styles.skeletonButton}
          />
          <Skeleton
            animation="wave"
            variant="text"
            width={180}
            height={28}
            sx={styles.skeletonBase}
          />
        </Box>

        {/* Center - Actions */}
        <Box sx={styles.appBarCenter}>
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
            style={{ marginRight: 8 }}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
            style={{ marginRight: 8 }}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
            style={{ marginRight: 8 }}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
            style={{ marginRight: 8 }}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
          />
        </Box>

        {/* Right side - Account, Help, Export, Theme */}
        <Box sx={styles.appBarRight}>
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
          />
          <Skeleton
            animation="wave"
            variant="circular"
            width={36}
            height={36}
            sx={styles.skeletonBase}
          />
        </Box>
      </Box>

      {/* Canvas Area with Central Node Skeleton */}
      <Box sx={styles.canvas}>
        {/* Central Topic Skeleton */}
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={200}
          height={60}
          sx={{
            ...styles.centralNode,
            ...styles.skeletonBase,
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.5 },
            },
          }}
        />

        {/* Surrounding nodes skeleton - subtle branches */}
        <Box sx={styles.sideNodes}>
          <Box sx={styles.leftNodes}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={120}
              height={40}
              sx={styles.skeletonButton}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={120}
              height={40}
              sx={styles.skeletonButton}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={100}
              height={36}
              sx={styles.skeletonButton}
            />
          </Box>
          <Box sx={styles.rightNodes}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={120}
              height={40}
              sx={styles.skeletonButton}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={120}
              height={40}
              sx={styles.skeletonButton}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={100}
              height={36}
              sx={styles.skeletonButton}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Vertical Toolbar Skeleton */}
      <Box sx={styles.rightToolbar}>
        {[...Array(8)].map((_, i) => (
          <Skeleton
            key={i}
            animation="wave"
            variant="rectangular"
            width={32}
            height={32}
            sx={styles.skeletonButton}
          />
        ))}
      </Box>

      {/* Bottom Visualization Toolbar Skeleton */}
      <Box sx={styles.visualizationToolbar}>
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={32}
          height={32}
          sx={styles.skeletonButton}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={32}
          height={32}
          sx={styles.skeletonButton}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={60}
          height={32}
          sx={styles.skeletonButton}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={32}
          height={32}
          sx={styles.skeletonButton}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={32}
          height={32}
          sx={styles.skeletonButton}
        />
      </Box>
    </Box>
  );
};

export default EditorLoadingSkeleton;
