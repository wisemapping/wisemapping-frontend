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
import type { SxProps, Theme } from '@mui/material/styles';
import Header from './header';
import Footer from './footer';

type AccountAccessLayoutProps = {
  headerType: 'only-signup' | 'only-signin' | 'none';
  children: React.ReactNode;
  contentSx?: SxProps<Theme>;
};

const AccountAccessLayout = ({
  headerType,
  children,
  contentSx,
}: AccountAccessLayoutProps): React.ReactElement => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header type={headerType} />
      <Box
        component="section"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { xs: '32px 16px', md: '48px 16px' },
          ...contentSx,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default AccountAccessLayout;
