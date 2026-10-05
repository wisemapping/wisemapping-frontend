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

/*
 * Pure geometry (no DOM): the number formats and the path builder that the path peers share.
 */

/** A point, or a vector, in workspace units. */
export type Vec = { readonly x: number; readonly y: number };

/** Writes one coordinate of a path or of a points list. */
export type NumberFormat = (value: number) => string;

/** The number as JavaScript prints it, at full precision (`-0` is written `0`). */
export const fullPrecision: NumberFormat = (value) => `${value}`;

/** `toFixed(digits)`. A negative value that rounds to zero keeps its sign, as in `-0.0`. */
export const fixed =
  (digits: number): NumberFormat =>
  (value) =>
    value.toFixed(digits);

/** `toFixed(digits)`, but a value that rounds to zero is always unsigned: `0.0`, never `-0.0`. */
export const unsignedFixed = (digits: number): NumberFormat => {
  const zero = (0).toFixed(digits);
  const negativeZero = `-${zero}`;
  return (value) => {
    const result = value.toFixed(digits);
    return result === negativeZero ? zero : result;
  };
};

/** `x,y` (or `x<separator>y`) with each coordinate written by `format`. */
export const formatPoint = (p: Vec, format: NumberFormat, separator = ','): string =>
  `${format(p.x)}${separator}${format(p.y)}`;

/**
 * Builds the `d` attribute of a path: commands separated by a space, each command letter
 * followed by its points, which are separated by a space too. For example
 * `M0.0,0.0 C1.0,2.0 3.0,4.0 5.0,6.0 Z`.
 */
export class PathBuilder {
  private readonly _format: NumberFormat;

  private readonly _commands: string[];

  constructor(format: NumberFormat) {
    this._format = format;
    this._commands = [];
  }

  moveTo(p: Vec): this {
    return this._push('M', p);
  }

  lineTo(p: Vec): this {
    return this._push('L', p);
  }

  curveTo(control1: Vec, control2: Vec, p: Vec): this {
    return this._push('C', control1, control2, p);
  }

  close(): this {
    this._commands.push('Z');
    return this;
  }

  toString(): string {
    return this._commands.join(' ');
  }

  private _push(command: string, ...points: Vec[]): this {
    this._commands.push(`${command}${points.map((p) => formatPoint(p, this._format)).join(' ')}`);
    return this;
  }
}
