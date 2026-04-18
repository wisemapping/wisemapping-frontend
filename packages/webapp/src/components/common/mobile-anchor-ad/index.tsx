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

import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

const AD_CLIENT = 'ca-pub-4996113942657337';

// Anchor/fixed bottom ad slot — create a "Display" responsive ad in AdSense
// and replace this value with the resulting data-ad-slot.
const AD_SLOT = '7241835609';

// Session storage key so the anchor only shows once per session after dismiss
const SESSION_KEY = 'wm_anchor_dismissed';

const MobileAnchorAd = (): React.ReactElement | null => {
  const isMobile = useMediaQuery('(max-width:767px)');
  const [dismissed, setDismissed] = useState(false);
  const adRef = useRef<HTMLInsElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!isMobile || dismissed || pushed.current || !adRef.current) return;
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      if (win.adsbygoogle !== undefined) {
        (win.adsbygoogle = win.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not available in dev/test environments
    }
  }, [isMobile, dismissed]);

  if (!isMobile || dismissed) return null;

  const handleDismiss = (): void => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage unavailable
    }
    setDismissed(true);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.12)',
      }}
      aria-label="Advertisement"
      role="complementary"
    >
      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.disabled',
            fontSize: '10px',
            pt: 0.5,
            userSelect: 'none',
          }}
        >
          Advertisement
        </Typography>
        <IconButton
          size="small"
          onClick={handleDismiss}
          aria-label="Close advertisement"
          sx={{
            position: 'absolute',
            top: 2,
            right: 4,
            padding: '2px',
            color: 'text.disabled',
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: 50 }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </Box>
    </Box>
  );
};

export default MobileAnchorAd;
