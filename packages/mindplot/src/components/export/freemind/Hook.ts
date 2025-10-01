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

import Parameters from './Parameters';

export default class Hook {
  protected PARAMETERS: Parameters | undefined;

  protected TEXT: string | undefined;

  protected NAME: string | undefined;

  getParameters(): Parameters | undefined {
    return this.PARAMETERS;
  }

  getText(): string | undefined {
    return this.TEXT;
  }

  getName(): string | undefined {
    return this.NAME;
  }

  setParameters(value: Parameters): void {
    this.PARAMETERS = value;
  }

  setText(value: string): void {
    this.TEXT = value;
  }

  setName(value: string): void {
    this.NAME = value;
  }
}
