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
 * jsdom never fetches images, so `<img src=x onerror=...>` never fires there.
 * A real browser does fetch it as soon as the markup is parsed into an element
 * owned by a document that has a browsing context (the live `document`), even
 * if that element is detached. Documents created by DOMParser or
 * document.implementation.createHTMLDocument have no browsing context
 * (`defaultView === null`) and are inert.
 *
 * This probe wraps the innerHTML setter and, when the target belongs to a
 * document with a browsing context, fires `error` on the parsed images the way
 * a browser would. Inline handlers then really run in jsdom, so a test can
 * observe the payload executing.
 */
export const installLiveParseProbe = (): (() => void) => {
  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!;
  Object.defineProperty(Element.prototype, 'innerHTML', {
    ...descriptor,
    set(this: Element, value: string) {
      descriptor.set!.call(this, value);
      if (this.ownerDocument?.defaultView) {
        this.querySelectorAll('img').forEach((img) => img.dispatchEvent(new Event('error')));
      }
    },
  });
  return () => Object.defineProperty(Element.prototype, 'innerHTML', descriptor);
};

export const XSS_HOOK = '__mindplotXssHook';

export const installXssHook = (): jest.Mock => {
  const hook = jest.fn();
  (window as unknown as Record<string, unknown>)[XSS_HOOK] = hook;
  return hook;
};

export const IMG_ONERROR_PAYLOAD = `<img src="x" onerror="window.${XSS_HOOK}()">`;
