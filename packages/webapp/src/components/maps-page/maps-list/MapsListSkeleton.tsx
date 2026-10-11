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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import { BodyCell, CompactCardHeader, MapCardRoot } from './shared.styled';
import {
  DrawerSkeleton,
  LoadingAppBar,
  LoadingContainer,
  LoadingDrawer,
  LoadingDrawerFooter,
  LoadingDrawerItem,
  LoadingDrawerList,
  LoadingDrawerLogo,
  LoadingListPaper,
  LoadingMainContent,
  LoadingSearchToolbar,
  LoadingTableContainer,
  LoadingToolbarCenter,
  LoadingToolbarLeft,
  LoadingToolbarRight,
  SkeletonBlock,
  SkeletonButton,
  SkeletonText,
} from './skeleton.styled';

export const TableRowSkeleton: React.FC = () => {
  return (
    <TableRow hover>
      <BodyCell padding="checkbox">
        <SkeletonBlock animation="wave" variant="rounded" width={18} height={18} />
      </BodyCell>
      <BodyCell>
        <SkeletonText animation="wave" variant="text" width="60%" />
      </BodyCell>
      <BodyCell>
        <SkeletonText animation="wave" variant="text" width="40%" />
      </BodyCell>
      <BodyCell>
        <SkeletonText animation="wave" variant="text" width={100} />
      </BodyCell>
      <BodyCell>
        <SkeletonText animation="wave" variant="text" width={80} />
      </BodyCell>
      <BodyCell padding="checkbox">
        <SkeletonBlock animation="wave" variant="circular" width={24} height={24} />
      </BodyCell>
      <BodyCell>
        <SkeletonBlock animation="wave" variant="circular" width={24} height={24} />
      </BodyCell>
    </TableRow>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <MapCardRoot>
      <CompactCardHeader
        avatar={<SkeletonBlock animation="wave" variant="circular" width={24} height={24} />}
        action={<SkeletonBlock animation="wave" variant="circular" width={24} height={24} />}
        title={<SkeletonText animation="wave" variant="text" width="70%" />}
        subheader={<SkeletonText animation="wave" variant="text" width="50%" />}
      />
    </MapCardRoot>
  );
};

export const MapsListSkeleton: React.FC<{ rowsPerPage: number }> = ({ rowsPerPage }) => {
  const skeletonCount = Math.min(rowsPerPage, 5); // Show max 5 skeleton rows

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <TableRowSkeleton
          // eslint-disable-next-line @eslint-react/no-array-index-key -- identical placeholders in a fixed-length list that never reorders
          key={index}
        />
      ))}
    </>
  );
};

export const MapsPageLoading = (): React.ReactElement => (
  <LoadingContainer>
    {/* Left Drawer Skeleton */}
    <LoadingDrawer>
      {/* Logo */}
      <LoadingDrawerLogo>
        <DrawerSkeleton animation="wave" variant="rectangular" width={40} height={40} />
      </LoadingDrawerLogo>

      {/* Navigation Items */}
      <LoadingDrawerList>
        {[...Array(5)].map((_, i) => (
          <LoadingDrawerItem
            // eslint-disable-next-line @eslint-react/no-array-index-key -- identical placeholders in a fixed-length list that never reorders
            key={i}
          >
            <DrawerSkeleton animation="wave" variant="circular" width={24} height={24} />
            <DrawerSkeleton animation="wave" variant="text" width={180} height={20} />
          </LoadingDrawerItem>
        ))}
      </LoadingDrawerList>

      {/* Divider */}
      <DrawerSkeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={1}
        sx={{ marginTop: 2, marginBottom: 2 }}
      />

      {/* Label Items */}
      <LoadingDrawerList>
        {[...Array(3)].map((_, i) => (
          <LoadingDrawerItem
            // eslint-disable-next-line @eslint-react/no-array-index-key -- identical placeholders in a fixed-length list that never reorders
            key={i}
          >
            <DrawerSkeleton animation="wave" variant="circular" width={24} height={24} />
            <DrawerSkeleton animation="wave" variant="text" width={140} height={20} />
          </LoadingDrawerItem>
        ))}
      </LoadingDrawerList>

      {/* Footer - Powered by */}
      <LoadingDrawerFooter>
        <DrawerSkeleton animation="wave" variant="rectangular" width={120} height={24} />
      </LoadingDrawerFooter>
    </LoadingDrawer>

    {/* Main Content Area */}
    <LoadingMainContent>
      {/* Header AppBar with skeleton toolbar */}
      <LoadingAppBar position="fixed" elevation={0}>
        <Toolbar>
          <SkeletonBlock
            animation="wave"
            variant="circular"
            width={40}
            height={40}
            sx={{ marginRight: 2 }}
          />
          <SkeletonButton
            animation="wave"
            variant="rectangular"
            width={120}
            height={36}
            sx={{ marginRight: 2 }}
          />
          <SkeletonButton animation="wave" variant="rectangular" width={120} height={36} />
          <Box sx={{ flexGrow: 1 }} />
          <SkeletonBlock
            animation="wave"
            variant="circular"
            width={40}
            height={40}
            sx={{ marginRight: 1 }}
          />
          <SkeletonBlock
            animation="wave"
            variant="circular"
            width={40}
            height={40}
            sx={{ marginRight: 1 }}
          />
          <SkeletonBlock animation="wave" variant="circular" width={40} height={40} />
        </Toolbar>
      </LoadingAppBar>

      {/* Main content area with skeleton table */}
      <Box sx={{ width: '100%', marginTop: '80px' }}>
        <LoadingListPaper elevation={0}>
          {/* Search Toolbar Skeleton */}
          <LoadingSearchToolbar variant="dense">
            <LoadingToolbarLeft>
              {/* Placeholder for action buttons - empty when no selection */}
            </LoadingToolbarLeft>
            <LoadingToolbarCenter>
              {/* Search Input Skeleton - centered; a string: sx multiplies a number radius */}
              <SkeletonButton
                animation="wave"
                variant="rectangular"
                width={240}
                height={32}
                sx={{ borderRadius: '9px' }}
              />
            </LoadingToolbarCenter>
            <LoadingToolbarRight>
              {/* Pagination removed - hidden when not needed */}
            </LoadingToolbarRight>
          </LoadingSearchToolbar>

          <LoadingTableContainer>
            <Table sx={{ backgroundColor: 'background.default' }}>
              <TableBody>
                <MapsListSkeleton rowsPerPage={10} />
              </TableBody>
            </Table>
          </LoadingTableContainer>
        </LoadingListPaper>
      </Box>
    </LoadingMainContent>
  </LoadingContainer>
);
