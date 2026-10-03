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
import React, { ReactElement, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Model from '../../classes/model/editor';

/** The zoom a freshly opened map reports before the canvas exists. */
const DEFAULT_PERCENT = 100;

/**
 * Canvas zoom is stored as a scale where larger means further out, so the
 * displayed percentage is its reciprocal.
 */
export const toZoomPercent = (zoom: number | undefined): number => {
  if (!zoom || !Number.isFinite(zoom) || zoom <= 0) {
    return DEFAULT_PERCENT;
  }
  return Math.floor((1 / zoom) * DEFAULT_PERCENT);
};

type ZoomDisplayProps = {
  model: Model;
};

/**
 * The zoom percentage in the visualization toolbar.
 *
 * Its own component with its own subscription, because the canvas fires
 * `update` on every mousemove of a pan. That event used to drive a `setState`
 * in `useEditor`, re-rendering the whole editor -- app bar, both toolbars, the
 * widget popover -- once per frame of every drag, purely so this number could
 * stay current. Now only this leaf re-renders.
 */
export const ZoomDisplay = ({ model }: ZoomDisplayProps): ReactElement => {
  const [percent, setPercent] = useState(DEFAULT_PERCENT);

  useEffect(() => {
    const screenManager = (() => {
      try {
        return model.isMapLoadded() ? model.getDesigner().getWorkSpace()?.getScreenManager() : null;
      } catch {
        return null;
      }
    })();

    const refresh = (): void => {
      try {
        setPercent(toZoomPercent(model.getDesigner().getWorkSpace()?.getZoom()));
      } catch {
        setPercent(DEFAULT_PERCENT);
      }
    };

    refresh();

    if (!screenManager) {
      return undefined;
    }

    screenManager.addEvent('update', refresh);
    return () => {
      screenManager.removeEvent('update', refresh);
    };
  }, [model]);

  return (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="overline" color="gray" data-testid="zoom-percent">
        {percent}%
      </Typography>
    </Box>
  );
};

export default ZoomDisplay;
