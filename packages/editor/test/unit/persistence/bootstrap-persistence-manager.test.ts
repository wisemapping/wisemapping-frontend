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

/**
 * @jest-environment jsdom
 */
import type { PersistenceManager } from '@wisemapping/mindplot';
import BootstrapPersistenceManager from '../../../src/classes/persistence/BootstrapPersistenceManager';

jest.mock('@wisemapping/mindplot', () => ({
  PersistenceManager: class {},
}));

const BOOTSTRAP_XML = '<map version="tango"><topic central="true" id="1"/></map>';

describe('BootstrapPersistenceManager', () => {
  it('forwards the save events and options to the wrapped manager', () => {
    const wrapped = { saveMapXml: jest.fn() };
    const manager: PersistenceManager = new BootstrapPersistenceManager(
      wrapped as unknown as PersistenceManager,
      BOOTSTRAP_XML,
    );
    const mapXml = document.implementation.createDocument(null, 'map');
    const events = { onSuccess: jest.fn(), onError: jest.fn() };

    manager.saveMapXml('1', mapXml, '{}', false, events, { urgent: true });

    expect(wrapped.saveMapXml).toHaveBeenCalledWith('1', mapXml, '{}', false, events, {
      urgent: true,
    });
  });
});
