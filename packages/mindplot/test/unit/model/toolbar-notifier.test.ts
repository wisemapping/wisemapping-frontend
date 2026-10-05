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
import { $notify } from '../../../src/components/model/ToolbarNotifier';

describe('ToolbarNotifier timers', () => {
  let container: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="headerNotifier"></div>';
    container = document.getElementById('headerNotifier')!;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('hides a non-fading notification after 2s', () => {
    $notify('first', false);
    jest.advanceTimersByTime(1900);
    expect(container.style.display).toBe('block');

    jest.advanceTimersByTime(200);
    expect(container.style.display).toBe('none');
  });

  it('does not let an earlier non-fading timer hide a newer non-fading notification', () => {
    $notify('first', false);
    jest.advanceTimersByTime(1500);
    $notify('second', false);

    // The first notification's 2s timer would fire here.
    jest.advanceTimersByTime(600);
    expect(container.textContent).toBe('second');
    expect(container.style.display).toBe('block');

    jest.advanceTimersByTime(1500);
    expect(container.style.display).toBe('none');
  });

  it('does not let an earlier non-fading timer hide a newer fading notification', () => {
    $notify('first', false);
    jest.advanceTimersByTime(1500);
    $notify('second', true);

    jest.advanceTimersByTime(600);
    expect(container.textContent).toBe('second');
    expect(container.style.display).toBe('block');
  });

  it('does not let an earlier fade timer turn a newer non-fading notification transparent', () => {
    $notify('first', true);
    jest.advanceTimersByTime(50);
    $notify('second', false);

    // The first notification's 100ms fade-out would fire here.
    jest.advanceTimersByTime(100);
    expect(container.textContent).toBe('second');
    expect(container.style.opacity).toBe('1');
  });

  it('does not let an earlier fade hide timer hide a newer non-fading notification', () => {
    $notify('first', true);
    jest.advanceTimersByTime(1500);
    $notify('second', false);

    jest.advanceTimersByTime(1900);
    expect(container.style.display).toBe('block');
  });
});
