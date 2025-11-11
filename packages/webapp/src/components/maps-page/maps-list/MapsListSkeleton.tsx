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
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useStyles } from './styled';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

export const TableRowSkeleton: React.FC = () => {
  const classes = useStyles();

  return (
    <TableRow hover>
      <TableCell padding="checkbox" css={classes.bodyCell}>
        <Skeleton
          animation="wave"
          variant="rounded"
          width={18}
          height={18}
          css={classes.skeletonBase}
        />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton animation="wave" variant="text" width="60%" css={classes.skeletonTextLarge} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton animation="wave" variant="text" width="40%" css={classes.skeletonTextSmall} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton animation="wave" variant="text" width={100} css={classes.skeletonTextSmall} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton animation="wave" variant="text" width={80} css={classes.skeletonTextSmall} />
      </TableCell>
      <TableCell padding="checkbox" css={classes.bodyCell}>
        <Skeleton
          animation="wave"
          variant="circular"
          width={24}
          height={24}
          css={classes.skeletonBase}
        />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton
          animation="wave"
          variant="circular"
          width={24}
          height={24}
          css={classes.skeletonBase}
        />
      </TableCell>
    </TableRow>
  );
};

export const CardSkeleton: React.FC = () => {
  const classes = useStyles();

  return (
    <Card css={classes.cardSkeletonContainer}>
      <CardHeader
        css={classes.cardHeader}
        avatar={
          <Skeleton
            animation="wave"
            variant="circular"
            width={24}
            height={24}
            css={classes.skeletonBase}
          />
        }
        action={
          <Skeleton
            animation="wave"
            variant="circular"
            width={24}
            height={24}
            css={classes.skeletonBase}
          />
        }
        title={
          <Skeleton animation="wave" variant="text" width="70%" css={classes.skeletonTextLarge} />
        }
        subheader={
          <Skeleton animation="wave" variant="text" width="50%" css={classes.skeletonTextSmall} />
        }
      />
    </Card>
  );
};

const MapsListSkeleton: React.FC<{ rowsPerPage: number }> = ({ rowsPerPage }) => {
  const skeletonCount = Math.min(rowsPerPage, 5); // Show max 5 skeleton rows

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <TableRowSkeleton key={index} />
      ))}
    </>
  );
};

export const MapsPageLoading = (): React.ReactElement => {
  const classes = useStyles();

  return (
    <Box css={classes.loadingContainer}>
      {/* Left Drawer Skeleton */}
      <Box css={classes.loadingDrawer}>
        {/* Logo */}
        <Box css={classes.loadingDrawerLogo}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={40}
            height={40}
            css={classes.skeletonDrawer}
          />
        </Box>

        {/* Navigation Items */}
        <Box css={classes.loadingDrawerList}>
          {[...Array(5)].map((_, i) => (
            <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Skeleton
                animation="wave"
                variant="circular"
                width={24}
                height={24}
                css={classes.skeletonDrawer}
              />
              <Skeleton
                animation="wave"
                variant="text"
                width={180}
                height={20}
                css={classes.skeletonDrawer}
              />
            </Box>
          ))}
        </Box>

        {/* Divider */}
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height={1}
          css={classes.skeletonDrawer}
          style={{ marginTop: 16, marginBottom: 16 }}
        />

        {/* Label Items */}
        <Box css={classes.loadingDrawerList}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Skeleton
                animation="wave"
                variant="circular"
                width={24}
                height={24}
                css={classes.skeletonDrawer}
              />
              <Skeleton
                animation="wave"
                variant="text"
                width={140}
                height={20}
                css={classes.skeletonDrawer}
              />
            </Box>
          ))}
        </Box>

        {/* Footer - Powered by */}
        <Box css={classes.loadingDrawerFooter}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={120}
            height={24}
            css={classes.skeletonDrawer}
          />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box css={classes.loadingMainContent}>
        {/* Header AppBar with skeleton toolbar */}
        <AppBar
          position="fixed"
          elevation={0}
          css={classes.loadingAppBar}
          style={{ marginLeft: 240, width: 'calc(100% - 240px)' }}
        >
          <Toolbar>
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
              css={classes.loadingSkeletonCircle}
              style={{ marginRight: 16 }}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={120}
              height={36}
              css={classes.loadingSkeletonButton}
              style={{ marginRight: 16 }}
            />
            <Skeleton
              animation="wave"
              variant="rectangular"
              width={120}
              height={36}
              css={classes.loadingSkeletonButton}
            />
            <Box style={{ flexGrow: 1 }} />
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
              css={classes.loadingSkeletonCircle}
              style={{ marginRight: 8 }}
            />
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
              css={classes.loadingSkeletonCircle}
              style={{ marginRight: 8 }}
            />
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
              css={classes.loadingSkeletonCircle}
            />
          </Toolbar>
        </AppBar>

        {/* Main content area with skeleton table */}
        <Box sx={{ width: '100%', marginTop: '80px' }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              marginTop: '30px',
              marginLeft: '96px',
              marginRight: '96px',
              marginBottom: 2,
            }}
          >
            {/* Search Toolbar Skeleton */}
            <Toolbar css={classes.loadingSearchToolbar} variant="dense">
              <Box css={classes.loadingToolbarLeft}>
                {/* Placeholder for action buttons - empty when no selection */}
              </Box>
              <Box css={classes.loadingToolbarCenter}>
                {/* Search Input Skeleton - centered */}
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width={240}
                  height={32}
                  css={classes.loadingSkeletonButton}
                  style={{ borderRadius: 9 }}
                />
              </Box>
              <Box css={classes.loadingToolbarRight}>
                {/* Pagination removed - hidden when not needed */}
              </Box>
            </Toolbar>

            <TableContainer
              sx={{
                backgroundColor: 'background.default',
                border: '1px solid rgba(128, 128, 128, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <Table sx={{ backgroundColor: 'background.default' }}>
                <TableBody>
                  <MapsListSkeleton rowsPerPage={10} />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
