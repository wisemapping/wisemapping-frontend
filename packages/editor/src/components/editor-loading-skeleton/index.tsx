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
import {
  AppBarCenter,
  AppBarLeft,
  AppBarRight,
  AppBarSkeleton,
  ButtonSkeleton,
  CanvasSkeleton,
  CentralNodeSkeleton,
  FormattingToolbarSkeleton,
  LeftNodes,
  LoadingContainer,
  RightNodes,
  SideNodes,
  SkeletonBlock,
  ToolbarActionSkeleton,
  ZoomToolbarSkeleton,
} from './styled';

/**
 * Loading skeleton that mimics the editor layout for smooth transition
 */
const EditorLoadingSkeleton: React.FC = () => {
  return (
    <LoadingContainer>
      {/* Top AppBar Header Skeleton */}
      <AppBarSkeleton>
        {/* Left side - Back button, Logo, Title */}
        <AppBarLeft>
          <SkeletonBlock animation="wave" variant="circular" width={32} height={32} />
          <ButtonSkeleton animation="wave" variant="rectangular" width={120} height={32} />
          <SkeletonBlock animation="wave" variant="text" width={180} height={28} />
        </AppBarLeft>

        {/* Center - Actions */}
        <AppBarCenter>
          <ToolbarActionSkeleton animation="wave" variant="circular" width={36} height={36} />
          <ToolbarActionSkeleton animation="wave" variant="circular" width={36} height={36} />
          <ToolbarActionSkeleton animation="wave" variant="circular" width={36} height={36} />
          <ToolbarActionSkeleton animation="wave" variant="circular" width={36} height={36} />
          <SkeletonBlock animation="wave" variant="circular" width={36} height={36} />
        </AppBarCenter>

        {/* Right side - Account, Help, Export, Theme */}
        <AppBarRight>
          <SkeletonBlock animation="wave" variant="circular" width={36} height={36} />
          <SkeletonBlock animation="wave" variant="circular" width={36} height={36} />
          <SkeletonBlock animation="wave" variant="circular" width={36} height={36} />
          <SkeletonBlock animation="wave" variant="circular" width={36} height={36} />
        </AppBarRight>
      </AppBarSkeleton>

      {/* Canvas Area with Central Node Skeleton */}
      <CanvasSkeleton>
        {/* Central Topic Skeleton */}
        <CentralNodeSkeleton animation="wave" variant="rectangular" width={200} height={60} />

        {/* Surrounding nodes skeleton - subtle branches */}
        <SideNodes>
          <LeftNodes>
            <ButtonSkeleton animation="wave" variant="rectangular" width={120} height={40} />
            <ButtonSkeleton animation="wave" variant="rectangular" width={120} height={40} />
            <ButtonSkeleton animation="wave" variant="rectangular" width={100} height={36} />
          </LeftNodes>
          <RightNodes>
            <ButtonSkeleton animation="wave" variant="rectangular" width={120} height={40} />
            <ButtonSkeleton animation="wave" variant="rectangular" width={120} height={40} />
            <ButtonSkeleton animation="wave" variant="rectangular" width={100} height={36} />
          </RightNodes>
        </SideNodes>
      </CanvasSkeleton>

      {/* Right Vertical Toolbar Skeleton */}
      <FormattingToolbarSkeleton>
        {[...Array(8)].map((_, i) => (
          <ButtonSkeleton key={i} animation="wave" variant="rectangular" width={32} height={32} />
        ))}
      </FormattingToolbarSkeleton>

      {/* Bottom Visualization Toolbar Skeleton */}
      <ZoomToolbarSkeleton>
        <ButtonSkeleton animation="wave" variant="rectangular" width={32} height={32} />
        <ButtonSkeleton animation="wave" variant="rectangular" width={32} height={32} />
        <ButtonSkeleton animation="wave" variant="rectangular" width={60} height={32} />
        <ButtonSkeleton animation="wave" variant="rectangular" width={32} height={32} />
        <ButtonSkeleton animation="wave" variant="rectangular" width={32} height={32} />
      </ZoomToolbarSkeleton>
    </LoadingContainer>
  );
};

export default EditorLoadingSkeleton;
