/*
 *    Copyright [2015] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

export const createDocument = (): Document => {
  var doc: Document | null = null;
  if (window.document.implementation?.createDocument) {
    doc = window.document.implementation.createDocument('', '', null);
  }

  if (!doc) {
    throw new Error('Document could not be initialized');
  }

  return doc;
};

export const $defined = (obj: any) => {
  return obj != undefined && obj != null;
};

export const $assert = (assert, message: string): void => {
  if (!$defined(assert) || !assert) {
    console.error(message);
    throw new Error(message);
  }
};

export const sign = (value: number): 1 | -1 => {
  return value >= 0 ? 1 : -1;
};
