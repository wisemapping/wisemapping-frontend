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

/// <reference types="cypress" />

/** The part of <mindplot-component> (MindplotWebComponent) the specs use. */
type DesignerHost<T> = Element & { getDesigner(): T };

/**
 * The designer of the page's <mindplot-component>, or undefined while there is no component or
 * its designer is not built yet (getDesigner() throws until then). `T` is the part of the
 * mindplot Designer the spec uses.
 */
export const designerOf = <T>(win: Cypress.AUTWindow): T | undefined => {
  const host = win.document.querySelector<DesignerHost<T>>('mindplot-component');
  if (!host) {
    return undefined;
  }
  try {
    return host.getDesigner();
  } catch {
    return undefined;
  }
};

/** Like designerOf, for a spec that needs the designer to be there: fails otherwise. */
export const designerIn = <T>(win: Cypress.AUTWindow): T => {
  const designer = designerOf<T>(win);
  expect(designer, 'designer of <mindplot-component>').to.not.equal(undefined);
  return designer!;
};
