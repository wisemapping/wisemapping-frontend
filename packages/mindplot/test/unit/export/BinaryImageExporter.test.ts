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
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const SVG_URL = 'blob:svg-under-test';
const imgSize = { width: 2500, height: 1250 };

jest.mock('../../../src/components/export/SVGExporter', () => ({
  __esModule: true,
  default: class {
    exportAndEncode() {
      return Promise.resolve(SVG_URL);
    }

    getImgSize() {
      return imgSize;
    }
  },
}));

// eslint-disable-next-line import/first
import BinaryImageExporter from '../../../src/components/export/BinaryImageExporter';

// jsdom never loads images, so the test decides whether the SVG load succeeds.
let imageOutcome: 'load' | 'error' = 'load';
class FakeImage {
  onload: (() => void) | null = null;

  onerror: ((e: unknown) => void) | null = null;

  set src(_value: string) {
    setTimeout(() => {
      if (imageOutcome === 'load') {
        this.onload?.();
      } else {
        this.onerror?.(new Event('error'));
      }
    }, 0);
  }
}

const PENDING = 'still pending';
const settle = <T>(promise: Promise<T>): Promise<T | string> =>
  Promise.race([
    promise,
    new Promise<string>((r) => {
      setTimeout(() => r(PENDING), 50);
    }),
  ]);

describe('BinaryImageExporter', () => {
  const originalImage = globalThis.Image;
  const originalDpr = window.devicePixelRatio;
  let revoke: jest.Mock;
  let canvasSize: { width: number; height: number };
  let scale: jest.Mock;

  beforeEach(() => {
    imageOutcome = 'load';
    (globalThis as unknown as { Image: unknown }).Image = FakeImage;
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

    revoke = jest.fn();
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: revoke, configurable: true });

    scale = jest.fn();
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        ({
          fillRect: jest.fn(),
          scale,
          drawImage: jest.fn(),
        }) as unknown as CanvasRenderingContext2D,
    );
    jest.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function toDataURL(
      this: HTMLCanvasElement,
    ) {
      canvasSize = { width: this.width, height: this.height };
      return 'data:image/png;base64,AAAA';
    });
  });

  afterEach(() => {
    (globalThis as unknown as { Image: unknown }).Image = originalImage;
    Object.defineProperty(window, 'devicePixelRatio', {
      value: originalDpr,
      configurable: true,
    });
    jest.restoreAllMocks();
  });

  const create = () =>
    new BinaryImageExporter(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      800,
      600,
      'image/png',
    );

  it('rejects and releases the object URL when the SVG can not be loaded', async () => {
    imageOutcome = 'error';

    const outcome = settle(create().exportAndEncode());

    await expect(outcome).rejects.toBeDefined();
    expect(revoke).toHaveBeenCalledWith(SVG_URL);
  });

  it('keeps the canvas under the browser pixel limit and the aspect ratio', async () => {
    // 2500x1250 at devicePixelRatio 2 (x2) would be 10000x5000 = 50 MP.
    await create().exportAndEncode();

    expect(canvasSize.width * canvasSize.height).toBeLessThanOrEqual(16e6);
    expect(canvasSize.width / canvasSize.height).toBeCloseTo(2, 2);
    const [scaleX, scaleY] = scale.mock.calls[0] as number[];
    expect(scaleX).toBeCloseTo(canvasSize.width / 2500, 2);
    expect(scaleY).toBe(scaleX);
    expect(revoke).toHaveBeenCalledWith(SVG_URL);
  });

  it('does not reduce a canvas that already fits', async () => {
    imgSize.width = 400;
    imgSize.height = 300;
    try {
      await create().exportAndEncode();
    } finally {
      imgSize.width = 2500;
      imgSize.height = 1250;
    }

    expect(canvasSize).toEqual({ width: 1600, height: 1200 });
    expect(scale).toHaveBeenCalledWith(4, 4);
  });
});
