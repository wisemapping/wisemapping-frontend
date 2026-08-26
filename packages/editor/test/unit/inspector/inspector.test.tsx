/**
 * @jest-environment jsdom
 */
import { TextEncoder, TextDecoder } from 'util';
Object.assign(globalThis, { TextEncoder, TextDecoder });
jest.mock('react-ga4', () => ({
  default: { event: jest.fn(), send: jest.fn() },
  event: jest.fn(),
  send: jest.fn(),
}));

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage || '',
  }),
  FormattedMessage: ({ defaultMessage }: { defaultMessage?: string }) => (
    <span>{defaultMessage}</span>
  ),
  IntlProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Inspector from '../../../src/components/inspector';
const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Inspector Collapsible Component', () => {
  test('renders expanded inspector with title and collapse button when open=true', () => {
    const onToggleOpen = jest.fn();
    renderWithProviders(<Inspector open={true} onToggleOpen={onToggleOpen} />);

    expect(screen.getByTestId('editor-inspector')).toBeDefined();
    expect(screen.getByText('Inspector')).toBeDefined();
    expect(screen.getByTestId('collapse-inspector-button')).toBeDefined();

    fireEvent.click(screen.getByTestId('collapse-inspector-button'));
    expect(onToggleOpen).toHaveBeenCalledTimes(1);
  });

  test('renders collapsed rail with tab buttons when open=false', () => {
    const onToggleOpen = jest.fn();
    renderWithProviders(<Inspector open={false} onToggleOpen={onToggleOpen} />);

    expect(screen.getByTestId('editor-inspector-collapsed')).toBeDefined();
    expect(screen.getByTestId('expand-inspector-button')).toBeDefined();
    expect(screen.getByTestId('inspector-rail-style')).toBeDefined();
    expect(screen.getByTestId('inspector-rail-font')).toBeDefined();
    expect(screen.getByTestId('inspector-rail-props')).toBeDefined();
    expect(screen.getByTestId('inspector-rail-comments')).toBeDefined();

    fireEvent.click(screen.getByTestId('expand-inspector-button'));
    expect(onToggleOpen).toHaveBeenCalledTimes(1);
  });

  test('clicking a tab button in collapsed rail triggers onToggleOpen', () => {
    const onToggleOpen = jest.fn();
    renderWithProviders(<Inspector open={false} onToggleOpen={onToggleOpen} />);

    fireEvent.click(screen.getByTestId('inspector-rail-font'));
    expect(onToggleOpen).toHaveBeenCalledTimes(1);
  });
});
