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
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { ComponentType } from 'react';
import type { CSSObject } from '@emotion/react';
import type { Theme } from '@mui/material/styles';

type Styles = CSSObject | ((theme: Theme) => CSSObject);

// The wrapped component's props are forwarded untouched.
type HocProps = { papercss?: CSSObject; [prop: string]: unknown };

function withEmotionStyles<T>(styles: Styles) {
  return (Component: ComponentType<T>) => {
    const Styled = Component as ComponentType<HocProps>;
    const WithEmotionStyles = (hocProps: HocProps): React.ReactElement => {
      // `styles` may be a `(theme) => ({ ... })` callback. Spreading a function
      // yields `{}` -- functions carry no own enumerable properties -- so the
      // callback has to be forwarded for Emotion to resolve against the theme,
      // not spread into an object literal.
      const css =
        typeof styles === 'function'
          ? (theme: Theme) => ({ ...styles(theme), ...hocProps.papercss })
          : { ...styles, ...hocProps.papercss };

      return <Styled {...hocProps} css={css} />;
    };
    WithEmotionStyles.displayName = `withEmotionStyles(${getDisplayName(Component)})`;
    return WithEmotionStyles;
  };
}

function getDisplayName(WrappedComponent: { displayName?: string; name?: string }) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withEmotionStyles;
