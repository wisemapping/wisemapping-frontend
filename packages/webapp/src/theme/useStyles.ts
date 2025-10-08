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

import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { useMemo } from 'react';

const getStyle = (value) => {
  return css(value);
};

function useClasses<T extends Record<string, any>>(stylesElement: T | ((theme: any) => T)): T {
  const theme = useTheme();

  // Memoize the result based on the theme to avoid recalculating on every render
  return useMemo(() => {
    const rawClasses =
      typeof stylesElement === 'function'
        ? (stylesElement as (theme: any) => T)(theme)
        : stylesElement;
    const prepared = {} as Record<string, any>;

    Object.entries(rawClasses).forEach(([key, value]) => {
      prepared[key] = getStyle(value);
    });

    return prepared as T;
  }, [theme, stylesElement]);
}

export default useClasses;
