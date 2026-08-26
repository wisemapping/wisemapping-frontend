/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBarOverflowMenu from '../../../src/components/app-bar/overflow-menu';

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

describe('AppBarOverflowMenu Component', () => {
  it('renders overflow button and opens menu on click', () => {
    const onAction = jest.fn();

    renderWithProviders(<AppBarOverflowMenu onAction={onAction} />);

    const button = screen.getByLabelText(/More options/i);
    expect(button).toBeDefined();

    fireEvent.click(button);

    expect(screen.getByText(/Print/i)).toBeDefined();
    expect(screen.getByText(/Export/i)).toBeDefined();
    expect(screen.getByText(/History/i)).toBeDefined();
  });

  it('triggers action callback when a menu item is clicked', () => {
    const onAction = jest.fn();

    renderWithProviders(<AppBarOverflowMenu onAction={onAction} />);

    const button = screen.getByLabelText(/More options/i);
    fireEvent.click(button);

    const printItem = screen.getByText(/Print/i);
    fireEvent.click(printItem);

    expect(onAction).toHaveBeenCalledWith('print');
  });

  it('toggles star when star item is clicked', () => {
    const onToggleStar = jest.fn();

    renderWithProviders(
      <AppBarOverflowMenu isStarred={false} onToggleStar={onToggleStar} />,
    );

    const button = screen.getByLabelText(/More options/i);
    fireEvent.click(button);

    const starItem = screen.getByText(/Star Map/i);
    fireEvent.click(starItem);

    expect(onToggleStar).toHaveBeenCalled();
  });
});
