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
import AdUnit from '../ads/AdUnit';

// TODO: Replace these placeholder slot IDs with real AdSense slot IDs.
// Create 3 "Display ads" units in the AdSense console (Ads → By ad unit → Display ads):
//   - Left skyscraper  : 160×600
//   - Right skyscraper : 160×600
//   - Mobile banner    : 320×100
// Then paste the slot IDs (the 10-digit number) below.
const AD_SLOTS = {
  left: '7031912437',
  right: '7199433396',
  mobile: '4501117862',
} as const;

type AccountAccessLayoutProps = {
  headerType: 'only-signup' | 'only-signin' | 'none';
  children: React.ReactNode;
  contentSx?: SxProps<Theme>;
  /** When true, renders 160×600 skyscrapers flanking the card on desktop
   *  and a 320×100 banner below the card on mobile. Ads are served only
   *  after Google Consent Mode v2 signals are ready (see index.html). */
  showAds?: boolean;
};

const AccountAccessLayout = ({
  headerType,
  children,
  contentSx,
  showAds = false,
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
          flexDirection: 'row',
          alignItems: 'center',
          padding: { xs: '32px 16px', md: '48px 16px' },
          ...contentSx,
        }}
      >
        {showAds ? (
          <>
            {/* Left whitespace column — expands to fill available space,
                ad floats in the center of it */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdUnit
                slot={AD_SLOTS.left}
                style={{ display: 'inline-block', width: '160px', height: '600px' }}
              />
            </Box>

            {/* Center content — natural width, stays centered because
                left and right columns grow symmetrically */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
            >
              {children}

              {/* Mobile banner — below the card on small screens */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2 }}>
                <AdUnit
                  slot={AD_SLOTS.mobile}
                  style={{ display: 'inline-block', width: '320px', height: '100px' }}
                />
              </Box>
            </Box>

            {/* Right whitespace column */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdUnit
                slot={AD_SLOTS.right}
                style={{ display: 'inline-block', width: '160px', height: '600px' }}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{children}</Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default AccountAccessLayout;
