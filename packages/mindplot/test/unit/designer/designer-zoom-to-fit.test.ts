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

import { buildDesigner } from '../commands/designer-harness';
import Designer from '../../../src/components/Designer';
import PositionType from '../../../src/components/PositionType';
import ScreenManager from '../../../src/components/ScreenManager';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * Zoom, everywhere in mindplot, is workspace units per screen pixel: the viewBox is the
 * container scaled by it. zoomToFit used to store the reciprocal (a magnification) in the
 * model, the canvas and the screen manager while sizing the viewBox the other way, so every
 * later mouse mapping, pan and zoom step was off for a map bigger than the screen.
 */

type Viewport = {
  origin: PositionType;
  size: { width: number; height: number };
  svgWidth: number;
  svgHeight: number;
};

const designers: Designer[] = [];

/** jsdom does no layout: the container takes the size given here. */
const sizeContainer = (designer: Designer, width: number, height: number): void => {
  const container = designer.getContainer();
  Object.defineProperty(container, 'offsetWidth', { value: width, configurable: true });
  Object.defineProperty(container, 'offsetHeight', { value: height, configurable: true });
};

const build = async (width: number, height: number): Promise<Designer> => {
  const { designer } = await buildDesigner();
  designers.push(designer);
  sizeContainer(designer, width, height);
  return designer;
};

/** The viewport as the browser draws it: the SVG's size and viewBox. */
const viewportOf = (designer: Designer): Viewport => {
  const svg = designer.getContainer().querySelector('svg')!;
  const [x, y, width, height] = svg
    .getAttribute('viewBox')!
    .split(' ')
    .map((value) => Number.parseFloat(value));
  return {
    origin: { x, y },
    size: { width, height },
    svgWidth: Number.parseFloat(svg.getAttribute('width')!),
    svgHeight: Number.parseFloat(svg.getAttribute('height')!),
  };
};

/** Where a workspace point is drawn, in pixels from the container's top-left corner. */
const toScreen = (designer: Designer, position: PositionType): PositionType => {
  const viewport = viewportOf(designer);
  return {
    x: ((position.x - viewport.origin.x) * viewport.svgWidth) / viewport.size.width,
    y: ((position.y - viewport.origin.y) * viewport.svgHeight) / viewport.size.height,
  };
};

const screenManagerOf = (designer: Designer): ScreenManager =>
  designer.getWorkSpace().getScreenManager();

const scaleOf = (designer: Designer): number =>
  (screenManagerOf(designer) as unknown as { _scale: number })._scale;

/** The bounding box of every topic. */
const boundsOf = (designer: Designer) => {
  const topics = designer.getModel().getTopics();
  const left = Math.min(...topics.map((t) => t.getPosition().x - t.getSize().width / 2));
  const right = Math.max(...topics.map((t) => t.getPosition().x + t.getSize().width / 2));
  const top = Math.min(...topics.map((t) => t.getPosition().y - t.getSize().height / 2));
  const bottom = Math.max(...topics.map((t) => t.getPosition().y + t.getSize().height / 2));
  return {
    width: right - left,
    height: bottom - top,
    center: { x: (left + right) / 2, y: (top + bottom) / 2 },
  };
};

const contentCenterOf = (designer: Designer): PositionType => boundsOf(designer).center;

afterEach(() => {
  designers.splice(0).forEach((designer) => designer.dispose());
  document.querySelectorAll('.MuiAppBar-root').forEach((element) => element.remove());
});

describe('Designer.zoomToFit on a map bigger than the container', () => {
  // The sample map is about 850x500 workspace units: it needs zooming out to fit 400x300.
  const WIDTH = 400;
  const HEIGHT = 300;

  it('keeps the model, the canvas, the screen manager and the viewBox on the same zoom', async () => {
    const designer = await build(WIDTH, HEIGHT);

    designer.zoomToFit();

    const k = viewportOf(designer).size.width / WIDTH;
    expect(k).toBeGreaterThan(1);
    expect(designer.getModel().getZoom()).toBeCloseTo(k, 6);
    expect(designer.getWorkSpace().getZoom()).toBeCloseTo(k, 6);
    expect(scaleOf(designer)).toBeCloseTo(k, 6);
  });

  it('fits the whole map, never zooming out further than needed', async () => {
    const designer = await build(WIDTH, HEIGHT);

    designer.zoomToFit();

    const viewport = viewportOf(designer);
    designer
      .getModel()
      .getTopics()
      .forEach((topic) => {
        const { x, y } = toScreen(designer, topic.getPosition());
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(WIDTH);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(HEIGHT);
      });
    // 10% of padding on each side: the tighter axis is filled by 1.2x the content.
    const bounds = boundsOf(designer);
    expect(viewport.size.width / WIDTH).toBeCloseTo(
      Math.max((bounds.width * 1.2) / WIDTH, (bounds.height * 1.2) / HEIGHT),
      6,
    );
  });

  it('maps the screen point of a topic back to that topic', async () => {
    const designer = await build(WIDTH, HEIGHT);
    designer.zoomToFit();

    designer
      .getModel()
      .getTopics()
      .forEach((topic) => {
        const screen = toScreen(designer, topic.getPosition());
        const event = new MouseEvent('mousedown', { clientX: screen.x, clientY: screen.y });

        const workspace = screenManagerOf(designer).getWorkspaceMousePosition(event);

        expect(Math.abs(workspace.x - topic.getPosition().x)).toBeLessThanOrEqual(1);
        expect(Math.abs(workspace.y - topic.getPosition().y)).toBeLessThanOrEqual(1);
      });
  });

  it('does not jump on the next zoom step: zoomIn then zoomOut comes back', async () => {
    const designer = await build(WIDTH, HEIGHT);
    designer.zoomToFit();
    const fitted = viewportOf(designer).size;

    designer.zoomIn();
    // One step in from the fit, not from its reciprocal.
    expect(viewportOf(designer).size.width).toBeCloseTo(fitted.width / 1.2, 6);
    designer.zoomOut();

    expect(viewportOf(designer).size.width).toBeCloseTo(fitted.width, 6);
    expect(viewportOf(designer).size.height).toBeCloseTo(fitted.height, 6);
  });

  it('pans by the delta times the zoom', async () => {
    const designer = await build(WIDTH, HEIGHT);
    designer.zoomToFit();
    const before = viewportOf(designer);
    const k = before.size.width / WIDTH;

    designer.panBy(30, -20);

    const after = viewportOf(designer);
    expect(after.origin.x - before.origin.x).toBeCloseTo(30 * k, 6);
    expect(after.origin.y - before.origin.y).toBeCloseTo(-20 * k, 6);
  });

  it('fires canvasZoomed with the zoom it applied', async () => {
    const designer = await build(WIDTH, HEIGHT);
    const fired = jest.spyOn(designer.getLayoutEventBus(), 'fireEvent');

    designer.zoomToFit();

    const k = viewportOf(designer).size.width / WIDTH;
    expect(fired).toHaveBeenCalledWith('canvasZoomed', { zoom: expect.closeTo(k, 6) });
    fired.mockRestore();
  });
});

describe('Designer.zoomToFit insets', () => {
  const WIDTH = 1000;
  const HEIGHT = 800;

  it('centres the map in the part of the canvas the insets leave uncovered', async () => {
    const designer = await build(WIDTH, HEIGHT);

    designer.zoomToFit({ insets: { top: 64 } });

    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.x).toBeCloseTo(WIDTH / 2, 6);
    expect(center.y).toBeCloseTo(64 + (HEIGHT - 64) / 2, 6);
  });

  it('keeps the viewBox with the aspect ratio of the SVG, so nothing is stretched', async () => {
    const designer = await build(WIDTH, HEIGHT);

    designer.zoomToFit({ insets: { top: 64, right: 47, bottom: 55 } });

    const viewport = viewportOf(designer);
    expect(viewport.svgWidth).toBe(WIDTH);
    expect(viewport.svgHeight).toBe(HEIGHT);
    expect(viewport.size.width / viewport.size.height).toBeCloseTo(WIDTH / HEIGHT, 6);
  });

  it('fits the map in the uncovered part, which can need zooming out', async () => {
    // 1000 wide is enough for the map, but not once 700 of it are covered.
    const designer = await build(WIDTH, HEIGHT);

    designer.zoomToFit({ insets: { left: 350, right: 350 } });

    const k = viewportOf(designer).size.width / WIDTH;
    expect(k).toBeGreaterThan(1);
    designer
      .getModel()
      .getTopics()
      .forEach((topic) => {
        const { x } = toScreen(designer, topic.getPosition());
        expect(x).toBeGreaterThan(350);
        expect(x).toBeLessThan(WIDTH - 350);
      });
  });

  it('uses the insets set on the designer when called without any (the keyboard shortcut)', async () => {
    const designer = await build(WIDTH, HEIGHT);
    designer.setViewportInsets({ top: 100 });

    designer.zoomToFit();

    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.y).toBeCloseTo(100 + (HEIGHT - 100) / 2, 6);
  });

  it('measures insets given as a function on every fit', async () => {
    const designer = await build(WIDTH, HEIGHT);
    let top = 0;
    designer.setViewportInsets(() => ({ top }));

    top = 200;
    designer.zoomToFit();

    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.y).toBeCloseTo(200 + (HEIGHT - 200) / 2, 6);
  });

  it('prefers the insets passed in over the ones set on the designer', async () => {
    const designer = await build(WIDTH, HEIGHT);
    designer.setViewportInsets({ top: 100 });

    designer.zoomToFit({ insets: {} });

    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.y).toBeCloseTo(HEIGHT / 2, 6);
  });

  it('does not look at the page: an app bar in the DOM changes nothing', async () => {
    const designer = await build(WIDTH, HEIGHT);
    designer.zoomToFit();
    const without = viewportOf(designer);

    const appBar = document.createElement('header');
    appBar.className = 'MuiAppBar-root';
    appBar.getBoundingClientRect = () =>
      ({ top: 0, left: 0, right: WIDTH, bottom: 64, width: WIDTH, height: 64 }) as DOMRect;
    document.body.appendChild(appBar);
    designer.zoomToFit();

    expect(viewportOf(designer)).toEqual(without);
  });
});

describe('Designer.zoomToFit edge cases', () => {
  it('only centres a map smaller than the container: it never zooms in beyond 1x', async () => {
    const designer = await build(4000, 3000);
    designer.zoomIn();
    designer.zoomIn();

    designer.zoomToFit();

    expect(designer.getModel().getZoom()).toBe(1);
    expect(viewportOf(designer).size).toEqual({ width: 4000, height: 3000 });
    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.x).toBeCloseTo(2000, 6);
    expect(center.y).toBeCloseTo(1500, 6);
  });

  it('stops at the zoomOut() limit for a map far bigger than the container, centring it', async () => {
    const designer = await build(40, 30);

    designer.zoomToFit();

    expect(designer.getModel().getZoom()).toBe(7);
    expect(viewportOf(designer).size).toEqual({ width: 280, height: 210 });
    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.x).toBeCloseTo(20, 6);
    expect(center.y).toBeCloseTo(15, 6);
    // zoomOut() refuses to go further, zoomIn() steps back in.
    designer.zoomOut();
    expect(designer.getModel().getZoom()).toBe(7);
    designer.zoomIn();
    expect(designer.getModel().getZoom()).toBeCloseTo(7 / 1.2, 6);
  });

  it('centres content with no size at 1x', async () => {
    const designer = await build(1000, 800);
    designer
      .getModel()
      .getTopics()
      .forEach((topic) => {
        jest.spyOn(topic, 'getPosition').mockReturnValue({ x: 120, y: -40 });
        jest.spyOn(topic, 'getSize').mockReturnValue({ width: 0, height: 0 });
      });

    designer.zoomToFit({ insets: { top: 64 } });

    expect(designer.getModel().getZoom()).toBe(1);
    const center = toScreen(designer, { x: 120, y: -40 });
    expect(center.x).toBeCloseTo(500, 6);
    expect(center.y).toBeCloseTo(64 + (800 - 64) / 2, 6);
  });

  // BL5-66: a collapsed branch hides its topics, which must not widen the fit.
  it('ignores the topics hidden under a collapsed branch', async () => {
    const designer = await build(2000, 1600);
    designer.getActionDispatcher().shrinkBranch([1], true);
    const hidden = designer.getModel().findTopicById(2)!;
    expect(hidden.isVisible()).toBe(false);
    // A big hidden subtree, far from the visible map.
    jest.spyOn(hidden, 'getPosition').mockReturnValue({ x: 6000, y: 4000 });

    designer.zoomToFit();

    expect(designer.getModel().getZoom()).toBe(1);
  });

  it('centres an empty map on the origin at 1x', async () => {
    const designer = await build(1000, 800);
    jest.spyOn(designer.getModel(), 'getTopics').mockReturnValue([]);

    designer.zoomToFit();

    expect(designer.getModel().getZoom()).toBe(1);
    expect(viewportOf(designer).origin).toEqual({ x: -500, y: -400 });
  });
});

/**
 * BL5-68: a container resize re-fits the map when the view is still the one zoomToFit left
 * (the user asked to see the whole map, with the insets clear). Once the user zoomed or panned,
 * the view is theirs: the resize keeps the zoom and the point at the centre of the view.
 */
describe('Designer container resize', () => {
  const resize = (designer: Designer, width: number, height: number): void => {
    sizeContainer(designer, width, height);
    window.dispatchEvent(new Event('resize'));
  };

  /** The viewport and zoom zoomToFit gives at a size, on a fresh designer. */
  const fittedAt = async (width: number, height: number, top: number) => {
    const designer = await build(width, height);
    designer.zoomToFit({ insets: { top } });
    return { viewport: viewportOf(designer), zoom: designer.getModel().getZoom() };
  };

  it('re-fits a fitted map, with its insets', async () => {
    const designer = await build(400, 300);
    designer.setViewportInsets({ top: 64 });
    designer.zoomToFit();

    resize(designer, 800, 500);

    const expected = await fittedAt(800, 500, 64);
    expect(viewportOf(designer).origin.x).toBeCloseTo(expected.viewport.origin.x, 6);
    expect(viewportOf(designer).origin.y).toBeCloseTo(expected.viewport.origin.y, 6);
    expect(viewportOf(designer).size.width).toBeCloseTo(expected.viewport.size.width, 6);
    expect(designer.getModel().getZoom()).toBeCloseTo(expected.zoom, 6);
    expect(designer.getWorkSpace().getZoom()).toBeCloseTo(expected.zoom, 6);
    expect(scaleOf(designer)).toBeCloseTo(expected.zoom, 6);
    const center = toScreen(designer, contentCenterOf(designer));
    expect(center.y).toBeCloseTo(64 + (500 - 64) / 2, 6);
  });

  it('keeps re-fitting through several resizes', async () => {
    const designer = await build(400, 300);
    designer.zoomToFit();

    resize(designer, 800, 500);
    resize(designer, 300, 200);

    const expected = await fittedAt(300, 200, 0);
    expect(designer.getModel().getZoom()).toBeCloseTo(expected.zoom, 6);
  });

  it.each([
    ['zoomed', (designer: Designer) => designer.zoomIn()],
    ['panned', (designer: Designer) => designer.panBy(30, -20)],
  ])('keeps the zoom and the centre of a fitted map the user %s since', async (_label, change) => {
    const designer = await build(400, 300);
    designer.zoomToFit();
    change(designer);
    const before = viewportOf(designer);
    const k = before.size.width / 400;
    const centre = {
      x: before.origin.x + before.size.width / 2,
      y: before.origin.y + before.size.height / 2,
    };

    resize(designer, 800, 500);

    const after = viewportOf(designer);
    expect(after.svgWidth).toBe(800);
    expect(after.size.width).toBeCloseTo(800 * k, 6);
    expect(after.size.height).toBeCloseTo(500 * k, 6);
    expect(designer.getWorkSpace().getZoom()).toBeCloseTo(k, 6);
    expect(scaleOf(designer)).toBeCloseTo(k, 6);
    expect(after.origin.x + after.size.width / 2).toBeCloseTo(centre.x, 6);
    expect(after.origin.y + after.size.height / 2).toBeCloseTo(centre.y, 6);
  });

  it('keeps the zoom of a map that was never fitted', async () => {
    const designer = await build(400, 300);

    resize(designer, 800, 500);

    expect(designer.getModel().getZoom()).toBe(1);
    expect(viewportOf(designer).size).toEqual({ width: 800, height: 500 });
  });
});

// BL5-67: setZoom accepted 0.3-1.9 while zoomIn/zoomOut go from 0.3 to 7, so a zoom reached
// by zooming out was rejected when set back.
describe('Designer.setZoom range', () => {
  it('accepts every zoom zoomIn and zoomOut can reach', async () => {
    const designer = await build(1000, 800);

    designer.setZoom(7);
    expect(designer.getModel().getZoom()).toBe(7);
    expect(designer.getWorkSpace().getZoom()).toBe(7);

    designer.setZoom(0.3);
    expect(designer.getModel().getZoom()).toBe(0.3);
  });

  it('rejects a zoom outside that range', async () => {
    const designer = await build(1000, 800);

    designer.setZoom(7.5);
    designer.setZoom(0.2);

    expect(designer.getModel().getZoom()).toBe(1);
  });
});
