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

import { createHash } from 'crypto';
import { buildDesigner } from '../commands/designer-harness';
import { buildMediumMap, useTextSizedBoxes } from './medium-map';
import Canvas from '../../../src/components/Canvas';
import Designer from '../../../src/components/Designer';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/*
 * A map load queues what it builds and adds it to the canvas in batches once every topic is
 * built. These tests pin what the queue does on a 500-topic map (well over one batch), so a
 * change to how it waits between batches can not change what ends up on the canvas.
 */

type Queued = object;

const describeElement = (element: Queued): string => {
  const { name } = element.constructor;
  const id = (element as { getId?: () => number }).getId?.();
  return id === undefined ? name : `${name} ${id}`;
};

const hash = (value: string): string => createHash('sha1').update(value).digest('hex').slice(0, 12);

describe('Map load render queue', () => {
  let restoreBoxes: () => void;

  beforeAll(() => {
    restoreBoxes = useTextSizedBoxes();
  });

  afterAll(() => {
    restoreBoxes();
  });

  beforeEach(() => {
    // Topics saved without an order, and order repairs, are reported on the console.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const load = async () => {
    let queued = 0;
    const added: Queued[] = [];
    const canvas = Canvas.prototype as unknown as {
      append: (element: Queued) => void;
      appendInternal: (element: Queued) => void;
    };
    const { append } = canvas;
    jest.spyOn(canvas, 'append').mockImplementation(function record(this: Canvas, element) {
      if ((this as unknown as { _queueRenderEnabled: boolean })._queueRenderEnabled) {
        queued += 1;
      }
      append.call(this, element);
    });
    const { appendInternal } = canvas;
    jest.spyOn(canvas, 'appendInternal').mockImplementation(function record(this: Canvas, element) {
      added.push(element);
      appendInternal.call(this, element);
    });
    const { designer } = await buildDesigner(buildMediumMap());
    return { designer, queued, added };
  };

  const svgOf = (designer: Designer): string =>
    designer.getContainer().querySelector('svg')!.outerHTML;

  it('adds the queued elements, and what they add, to the canvas in the same order', async () => {
    const { queued, added } = await load();

    // Well over one batch of 300 is queued ...
    expect(queued).toBeGreaterThan(600);
    // ... and everything reaches the canvas, in this order.
    const order = added.map(describeElement);
    expect({ count: order.length, order: hash(order.join('\n')) }).toMatchSnapshot();
  });

  // BL5-95: it waited 100 ms, then 30 ms after each batch: 220 ms here, most of a load.
  it('waits a frame between batches, not fixed delays', async () => {
    jest.useFakeTimers();
    try {
      let loaded = false;
      const loading = buildDesigner(buildMediumMap()).then(() => {
        loaded = true;
      });

      // One frame (16 ms) before the first batch and between batches: 4 batches here.
      await jest.advanceTimersByTimeAsync(100);

      expect(loaded).toBe(true);
      await loading;
    } finally {
      jest.useRealTimers();
    }
  });

  it('leaves the same canvas', async () => {
    const { designer } = await load();

    expect(hash(svgOf(designer))).toMatchSnapshot();
  });
});
