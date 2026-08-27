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
import type Model from '../../../src/classes/model/editor';
import type Capability from '../../../src/classes/action/capability';
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

  test('renders topic actions when a topic is selected', () => {
    const selected = {
      getId: () => 42,
      getModel: () => ({
        getShapeType: () => undefined,
        getBorderColor: () => '#000000',
        getBorderStyle: () => undefined,
        getConnectionStyle: () => undefined,
        getConnectionColor: () => undefined,
      }),
      getBackgroundColor: () => '#ffffff',
      getBorderColor: () => '#000000',
      getBorderStyle: () => undefined,
      getConnectionStyle: () => undefined,
      getConnectionColor: () => undefined,
    };
    const mockModel = {
      getDesigner: () => ({
        getModel: () => ({
          selectedTopic: () => selected,
          filterSelectedTopics: () => [selected],
          filterSelectedRelationships: () => [],
        }),
        getThemeVariant: () => 'light',
        addEvent: jest.fn(),
        removeEvent: jest.fn(),
        changeShapeType: jest.fn(),
        changeColorBorder: jest.fn(),
        changeBorderStyle: jest.fn(),
        changeConnectionStyle: jest.fn(),
        changeConnectionColor: jest.fn(),
        changeBackgroundColor: jest.fn(),
      }),
      getDesignerModel: () => ({
        filterSelectedTopics: () => [selected],
        filterSelectedRelationships: () => [],
      }),
    };
    const mockCapability = {
      isHidden: jest.fn(() => false),
      isDisabled: jest.fn(() => false),
    };

    renderWithProviders(
      <Inspector
        open={true}
        model={mockModel as unknown as Model}
        capability={mockCapability as unknown as Capability}
        getDeepLink={(id) => `https://app.test/c/maps/1/edit?node=${id}`}
      />,
    );

    expect(screen.getByTestId('inspector-topic-actions')).toBeDefined();
    expect(screen.getByTestId('inspector-paste-as-child')).toBeDefined();
    expect(screen.getByTestId('inspector-copy-link-to-node')).toBeDefined();
  });
});
