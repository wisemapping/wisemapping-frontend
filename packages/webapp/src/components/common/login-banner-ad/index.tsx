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

import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AD_CLIENT = 'ca-pub-4996113942657337';

// Responsive leaderboard/banner unit — create a "Display" responsive ad in AdSense
// and replace this value with the resulting data-ad-slot.
const AD_SLOT = '5918426301';

const LoginBannerAd = (): React.ReactElement => {
  const adRef = useRef<HTMLInsElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      if (win.adsbygoogle !== undefined) {
        (win.adsbygoogle = win.adsbygoogle || []).push({});
      }
    } catch {
      // AdSense not available in dev/test environments
    }
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: 320, sm: 728 },
        mx: 'auto',
        mb: 2,
        overflow: 'hidden',
      }}
      aria-label="Advertisement"
      role="complementary"
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          color: 'text.disabled',
          fontSize: '10px',
          mb: 0.25,
          userSelect: 'none',
        }}
      >
        Advertisement
      </Typography>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: 50,
        }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </Box>
  );
};

export default LoginBannerAd;
