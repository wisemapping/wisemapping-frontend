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
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import withEmotionStyles from '../../../src/components/HOCs/withEmotionStyles';

const Target = ({ className }: { className?: string }): React.ReactElement => (
  <div data-testid="target" className={className} />
);

const renderThemed = (element: React.ReactElement): HTMLElement => {
  render(<ThemeProvider theme={createTheme()}>{element}</ThemeProvider>);
  return screen.getByTestId('target');
};

describe('withEmotionStyles', () => {
  it('applies the declarations of a `(theme) => ({...})` callback', () => {
    // Regression guard: the callback used to be spread into an object literal,
    // and a function has no own enumerable properties, so every themed style
    // resolved to `{}` and silently never reached the DOM.
    const Styled = withEmotionStyles((theme) => ({
      color: 'rgb(1, 2, 3)',
      backgroundColor: theme.palette.background.paper,
    }))(Target);

    const style = getComputedStyle(renderThemed(<Styled />));
    expect(style.color).toBe('rgb(1, 2, 3)');
    expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
  });

  it('still applies a plain style object', () => {
    const Styled = withEmotionStyles({ padding: '39px' })(Target);

    expect(getComputedStyle(renderThemed(<Styled />)).padding).toBe('39px');
  });

  it('merges `papercss` over the callback it was given', () => {
    const Styled = withEmotionStyles(() => ({ margin: '1px', color: 'rgb(4, 5, 6)' }))(Target);

    const style = getComputedStyle(renderThemed(<Styled papercss={{ margin: '7px' }} />));
    expect(style.margin).toBe('7px');
    expect(style.color).toBe('rgb(4, 5, 6)');
  });

  it('merges `papercss` over a plain style object', () => {
    const Styled = withEmotionStyles({ margin: '1px' })(Target);

    expect(getComputedStyle(renderThemed(<Styled papercss={{ margin: '7px' }} />)).margin).toBe(
      '7px',
    );
  });

  it('names the wrapper after the component it wraps', () => {
    const Styled = withEmotionStyles({})(Target);

    expect(Styled.displayName).toBe('withEmotionStyles(Target)');
  });
});
