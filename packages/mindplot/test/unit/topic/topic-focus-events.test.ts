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
import { buildTopics, stubSvgMeasurement } from './Helper';
import type Topic from '../../../src/components/Topic';

beforeEach(() => {
  stubSvgMeasurement();
});

describe('Topic focus events (TopicEventMap)', () => {
  it('fires ontfocus and ontblur as custom events that carry the topic', () => {
    const { child } = buildTopics();
    const received: { type: string; detail: Topic }[] = [];
    const onFocus = (event: CustomEvent<Topic>) =>
      received.push({ type: event.type, detail: event.detail });
    child.addEvent('ontfocus', onFocus);
    child.addEvent('ontblur', onFocus);

    child.setOnFocus(true);
    child.setOnFocus(false);

    expect(received).toEqual([
      { type: 'ontfocus', detail: child },
      { type: 'ontblur', detail: child },
    ]);

    child.removeEvent('ontfocus', onFocus);
    child.setOnFocus(true);
    expect(received).toHaveLength(2);
  });

  it('types native listeners with their DOM event, and fireEvent with the topic events only', () => {
    const { child } = buildTopics();
    const clicks: MouseEvent[] = [];
    child.addEvent('click', (event) => clicks.push(event));

    child.get2DElement().getNode().dispatchEvent(new MouseEvent('click'));
    expect(clicks).toHaveLength(1);

    // Checked by tsc only: never run.
    const misuses = (): void => {
      // @ts-expect-error a DOM event is not fired through the topic
      child.fireEvent('mousedown', new MouseEvent('mousedown'));
      // @ts-expect-error the focus events carry a topic
      child.fireEvent('ontfocus', 1);
      // @ts-expect-error the detail of ontfocus is a topic, not a string
      child.addEvent('ontfocus', (event: CustomEvent<string>) => event.detail);
    };
    expect(misuses).toBeInstanceOf(Function);
  });
});
