/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MobileLibraryNavBar, MobileShell } from '../../../src/mobile';

jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }) => defaultMessage || '',
  }),
  FormattedMessage: ({ defaultMessage }: { defaultMessage?: string }) => <span>{defaultMessage}</span>,
  IntlProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('MobileLibraryNavBar Component', () => {
  it('renders all mobile bottom navigation tabs', () => {
    renderWithProviders(<MobileLibraryNavBar currentTab="all" />);

    expect(screen.getByText(/All Maps/i)).toBeDefined();
    expect(screen.getByText(/Starred/i)).toBeDefined();
    expect(screen.getByText(/Shared/i)).toBeDefined();
    expect(screen.getByText(/Account/i)).toBeDefined();
  });

  it('triggers onTabChange when tab is clicked', () => {
    const onTabChange = jest.fn();

    renderWithProviders(
      <MobileLibraryNavBar currentTab="all" onTabChange={onTabChange} />,
    );

    const starredTab = screen.getByText(/Starred/i);
    fireEvent.click(starredTab);

    expect(onTabChange).toHaveBeenCalledWith('starred');
  });

  it('renders MobileShell wrapper', () => {
    renderWithProviders(
      <MobileShell>
        <div>Content Inside Shell</div>
      </MobileShell>,
    );

    expect(screen.getByText('Content Inside Shell')).toBeDefined();
  });
});
