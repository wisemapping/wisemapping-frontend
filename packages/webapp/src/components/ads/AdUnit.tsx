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

const ADSENSE_CLIENT = 'ca-pub-6240866993689964';

type AdUnitProps = {
  slot: string;
  style?: React.CSSProperties;
  /**
   * AdSense ad format. Leave undefined for a FIXED-size unit: the `data-ad-format`
   * attribute is then omitted and the slot is sized from the inline width/height
   * in `style`. Set to e.g. 'auto' only for responsive units that size from their
   * parent's width. Using 'auto' on a fixed-size unit makes AdSense ignore the
   * inline size and read the parent width instead, which fails with
   * "No slot size for availableWidth=0" when the parent reports zero width at
   * evaluation time — the cause of the second skyscraper never filling.
   */
  format?: string;
  fullWidthResponsive?: boolean;
};

/**
 * Renders a single AdSense ad unit and queues a push() call after mount.
 *
 * GDPR compliance: The AdSense script is injected by index.html only after
 * Google Consent Mode v2 signals are ready (CONSENT_MODE_DATA_READY callback
 * or 3-second fallback). push() calls queued here before the script loads are
 * processed by AdSense once — and only once — consent is established.
 */
const AdUnit = ({
  slot,
  style,
  format,
  fullWidthResponsive = false,
}: AdUnitProps): React.ReactElement => {
  const pushed = useRef(false);

  useEffect(() => {
    // Guard against React strict-mode double-invocation in development.
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not yet loaded — push is queued and will be
      // processed when the script loads post-consent.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      {...(format ? { 'data-ad-format': format } : {})}
      {...(fullWidthResponsive ? { 'data-full-width-responsive': 'true' } : {})}
    />
  );
};

export default AdUnit;
