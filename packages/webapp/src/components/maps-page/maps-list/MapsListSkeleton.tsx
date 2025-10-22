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
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useStyles } from './styled';

interface MapsListSkeletonProps {
  rowsPerPage: number;
}

export const TableRowSkeleton: React.FC = () => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell padding="checkbox" css={classes.bodyCell}>
        <Skeleton variant="rectangular" width={18} height={18} />
      </TableCell>
      <TableCell padding="checkbox" css={classes.bodyCell}>
        <Skeleton variant="circular" width={24} height={24} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton variant="text" width="60%" height={20} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Box display="flex" gap={0.5}>
          <Skeleton variant="rounded" width={60} height={20} />
          <Skeleton variant="rounded" width={70} height={20} />
        </Box>
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton variant="text" width={100} height={20} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton variant="text" width={80} height={20} />
      </TableCell>
      <TableCell css={classes.bodyCell}>
        <Skeleton variant="circular" width={24} height={24} />
      </TableCell>
    </TableRow>
  );
};

export const CardSkeleton: React.FC = () => {
  const classes = useStyles();

  return (
    <Card css={{ maxWidth: '94vw', margin: '3vw' }}>
      <CardHeader
        css={classes.cardHeader}
        avatar={<Skeleton variant="circular" width={24} height={24} />}
        action={<Skeleton variant="circular" width={24} height={24} />}
        title={<Skeleton variant="text" width="70%" height={24} />}
        subheader={<Skeleton variant="text" width="50%" height={20} />}
      />
    </Card>
  );
};

export const MapsListSkeleton: React.FC<MapsListSkeletonProps> = ({ rowsPerPage }) => {
  const skeletonCount = Math.min(rowsPerPage, 5); // Show max 5 skeleton rows

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <TableRowSkeleton key={index} />
      ))}
    </>
  );
};

export const MapsCardsListSkeleton: React.FC<MapsListSkeletonProps> = ({ rowsPerPage }) => {
  const skeletonCount = Math.min(rowsPerPage, 5); // Show max 5 skeleton cards

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
};
