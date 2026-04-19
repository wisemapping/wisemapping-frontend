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
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

const AD_CLIENT = 'ca-pub-4996113942657337';
const DEFAULT_AD_SLOT = '9706710065';
const SESSION_KEY = 'wm_vignette_shown';
const AUTO_DISMISS_MS = 6000;

type Props = {
  open: boolean;
  onClose: () => void;
  adSlot?: string;
};

const VignetteAdModal = ({ open, onClose, adSlot = DEFAULT_AD_SLOT }: Props): React.ReactElement => {
  const [countdown, setCountdown] = useState(Math.round(AUTO_DISMISS_MS / 1000));
  const adRef = useRef<HTMLInsElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;

    setCountdown(Math.round(AUTO_DISMISS_MS / 1000));
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !adRef.current) return;
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      if (win.adsbygoogle !== undefined) {
        (win.adsbygoogle = win.adsbygoogle || []).push({});
      }
    } catch {
      // AdSense not available in dev/test
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="vignette-ad-title"
      disableAutoFocus
      sx={{ zIndex: 1400 }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', sm: 480 },
          maxWidth: 520,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          outline: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Typography
            id="vignette-ad-title"
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '11px', userSelect: 'none' }}
          >
            Advertisement
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            sx={{ minWidth: 'unset', px: 1.5, py: 0.25, fontSize: '12px', lineHeight: 1.4 }}
          >
            {countdown > 0 ? `Skip (${countdown})` : 'Skip'}
          </Button>
        </Box>
        <Box
          sx={{
            width: '100%',
            minHeight: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f9f9f9',
          }}
        >
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: 250 }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </Box>
      </Box>
    </Modal>
  );
};

/**
 * Returns true if the vignette should be shown this session (max once per session).
 * Marks it shown on first call so subsequent calls return false.
 */
export function shouldShowVignette(key: string = SESSION_KEY): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}

export default VignetteAdModal;
