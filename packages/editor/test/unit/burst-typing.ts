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

/** What Cypress types in one `type()` call: long enough to pass React's nested-update limit (50). */
export const BURST_TEXT = 'abcdefghij'.repeat(20);

const setNativeValue = (field: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
  // React tracks the value it last rendered: set it through the prototype, as the browser does.
  const proto = Object.getPrototypeOf(field) as HTMLInputElement | HTMLTextAreaElement;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(field, value);
};

/**
 * Types `text` into a text field the way Cypress 16 does: one key after another, each in the
 * next microtask, with no task in between, and React scheduling for real (not inside act()).
 * In development MUI's FormControl gives its input a new context on every render, so a pane
 * that re-renders a FormControl (a TextField, a Select) on every key can add up to React's
 * nested-update limit ("Maximum update depth exceeded").
 *
 * Returns every error React reported, through console.error or an uncaught error event.
 */
export const typeInBurst = async (
  field: HTMLInputElement | HTMLTextAreaElement,
  text: string = BURST_TEXT,
): Promise<unknown[]> => {
  const reactAct = globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousAct = reactAct.IS_REACT_ACT_ENVIRONMENT;
  reactAct.IS_REACT_ACT_ENVIRONMENT = false;
  const errors: unknown[] = [];
  const consoleError = jest.spyOn(console, 'error').mockImplementation((e) => errors.push(e));
  const onError = (event: ErrorEvent): void => {
    errors.push(event.error);
  };
  window.addEventListener('error', onError);
  try {
    field.focus();
    for (const ch of text) {
      field.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      field.dispatchEvent(new KeyboardEvent('keypress', { key: ch, bubbles: true }));
      // Like a browser, a field at its maxlength takes no more characters.
      if (field.maxLength < 0 || field.value.length < field.maxLength) {
        setNativeValue(field, field.value + ch);
        field.dispatchEvent(
          new InputEvent('input', { inputType: 'insertText', data: ch, bubbles: true }),
        );
      }
      field.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
      // The next key comes in the next microtask, with no task in between.
      await Promise.resolve();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    window.removeEventListener('error', onError);
    consoleError.mockRestore();
    reactAct.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }
  return errors;
};
