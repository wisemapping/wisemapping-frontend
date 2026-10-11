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

import fs from 'fs';
import path from 'path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

// The suite's react-intl stand-in only renders defaultMessage. This one renders a locale's compiled
// messages (literals and {arguments}) and, like react-intl, falls back to the defaultMessage of an
// id the locale does not have.
type MockElement = { type: number; value: string };
type MockDescriptor = { id: string; defaultMessage?: string };
type MockValues = Record<string, unknown>;
jest.mock('react-intl', () => {
  const ReactInContext = jest.requireActual<typeof React>('react');
  const MessagesContext = ReactInContext.createContext<Record<string, MockElement[]>>({});
  const formatWith =
    (messages: Record<string, MockElement[]>) =>
    ({ id, defaultMessage }: MockDescriptor, values?: MockValues): string => {
      const compiled = messages[id];
      if (!compiled) {
        return (defaultMessage ?? id).replace(/\{(\w+)\}/g, (match, key) =>
          values?.[key] === undefined ? match : String(values[key]),
        );
      }
      return compiled
        .map((element) => {
          if (element.type === 0) return element.value;
          if (element.type === 1) return String(values?.[element.value]);
          throw new Error(`${id}: unsupported message element ${element.type}`);
        })
        .join('');
    };
  const useIntl = () => ({
    locale: 'es',
    formatMessage: formatWith(ReactInContext.use(MessagesContext)),
  });
  return {
    useIntl,
    IntlProvider: ({
      messages,
      children,
    }: {
      messages: Record<string, MockElement[]>;
      children?: React.ReactNode;
    }) => <MessagesContext value={messages}>{children}</MessagesContext>,
    FormattedMessage: ({ values, ...descriptor }: MockDescriptor & { values?: MockValues }) => (
      <>{useIntl().formatMessage(descriptor, values)}</>
    ),
  };
});

import { IntlProvider } from 'react-intl';
import EditMapDialog from '../../../../src/components/admin-console/maps-page/EditMapDialog';
import { createAppTheme } from '../../../../src/theme';

const compiled = (locale: string): Record<string, never> =>
  JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../../../../src/compiled-lang/${locale}.json`),
      'utf8',
    ),
  );

// The admin console was partly hard-coded in English: its text now comes from the catalog.
describe('the admin console in Spanish', () => {
  test('the edit map dialog shows its options and validation from the catalog', async () => {
    const onSubmit = jest.fn(() => Promise.resolve(undefined));
    render(
      <ThemeProvider theme={createAppTheme('light')}>
        <IntlProvider locale="es" messages={compiled('es')}>
          <EditMapDialog
            open
            initialData={{ title: '', description: '', public: false, isLocked: false }}
            isPending={false}
            onClose={jest.fn()}
            onSubmit={onSubmit}
          />
        </IntlProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText('Editar mapa')).toBeTruthy();
    // The selected options of the visibility and lock selects.
    expect(screen.getByText('Privado')).toBeTruthy();
    expect(screen.getByText('Desbloqueado')).toBeTruthy();
    expect(screen.queryByText('Private')).toBeNull();
    expect(screen.queryByText('Unlocked')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('El título es obligatorio')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
