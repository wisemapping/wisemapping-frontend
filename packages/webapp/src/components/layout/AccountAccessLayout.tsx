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
import Header from './header';
import Footer from './footer';
import { LayoutContent } from './styled';

type AccountAccessLayoutProps = {
  headerType: 'only-signup' | 'only-signin' | 'none';
  children: React.ReactNode;
  /** Less padding around the content, for the long sign-in and sign-up forms. */
  compact?: boolean;
};

const AccountAccessLayout = ({
  headerType,
  children,
  compact = false,
}: AccountAccessLayoutProps): React.ReactElement => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header type={headerType} />
      <LayoutContent compact={compact}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{children}</Box>
      </LayoutContent>
      <Footer />
    </Box>
  );
};

export default AccountAccessLayout;
