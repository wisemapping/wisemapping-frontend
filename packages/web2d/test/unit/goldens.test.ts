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
import ArcLine from '../../src/components/ArcLine';
import Arrow from '../../src/components/Arrow';
import CurvedLine from '../../src/components/CurvedLine';
import Ellipse from '../../src/components/Ellipse';
import Group from '../../src/components/Group';
import HeartbeatLine from '../../src/components/HeartbeatLine';
import Image from '../../src/components/Image';
import NeuronLine from '../../src/components/NeuronLine';
import PolyLine from '../../src/components/PolyLine';
import Rect from '../../src/components/Rect';
import StraightLine from '../../src/components/StraightLine';
import Text from '../../src/components/Text';
import Workspace from '../../src/components/Workspace';
import {
  createScene,
  expectGolden,
  listGoldens,
  roundNumbers,
  serializeSvg,
} from '../helpers/svgGolden';

/*
 * SVG golden tests (WEB2D_REVIEW_PLAN.md section 7.3, layer 1). Each scenario renders into jsdom
 * and is compared with test/unit/__goldens__/<name>.svg. A golden that encodes a known bug says so
 * in its scenario comment; the W1 fix updates the golden in the same commit.
 *
 * Update: `yarn jest test/unit/goldens -u` or `UPDATE_GOLDENS=1 yarn test:unit`.
 */

type Orientation = 'horizontal' | 'vertical';
type Scenario = () => Element;

const QUADRANTS: [number, number][] = [
  [100, 100],
  [-100, -100],
  [100, -100],
  [-100, 100],
];

const polylineScene = (style: string, orientation: Orientation): Element => {
  const lines: PolyLine[] = [];
  const add = (x1: number, y1: number, x2: number, y2: number) => {
    const line = new PolyLine();
    line.setStyle(style);
    line.setOrientation(orientation);
    line.setFrom(x1, y1);
    line.setTo(x2, y2);
    line.setStroke(1, 'solid', 'blue', 1);
    lines.push(line);
  };
  QUADRANTS.forEach(([x, y]) => add(0, 0, x, y));
  // Degenerate cases (W-HCURVE, W-VCURVE, W-MIDCURVE): aligned ends and tiny offsets.
  add(-180, -180, -120, -180); // dy = 0
  add(-180, -170, -180, -130); // dx = 0
  add(120, -180, 180, -176); // |dy| = 4
  add(120, 140, 126, 180); // |dx| = 6
  return createScene(lines).svg;
};

const curvedScene = (
  ends: [number, number, number, number][],
  setup: (line: CurvedLine) => void,
): Element => {
  const lines = ends.map(([x1, y1, x2, y2]) => {
    const line = new CurvedLine();
    line.setFrom(x1, y1);
    line.setTo(x2, y2);
    setup(line);
    return line;
  });
  return createScene(lines).svg;
};

const arcScene = (orientation: Orientation): Element => {
  const lines = [...QUADRANTS, [-100, 0] as [number, number], [100, 0] as [number, number]].map(
    ([x, y]) => {
      const line = new ArcLine();
      line.setOrientation(orientation);
      line.setFrom(0, 0);
      line.setTo(x, y);
      line.setStroke(2, 'solid', 'blue', 1);
      return line;
    },
  );
  return createScene(lines).svg;
};

const arrowScene = (configure: (arrow: Arrow, i: number) => void, count = 8): Element => {
  const arrows: Arrow[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI) / 4;
    const arrow = new Arrow();
    arrow.setFrom(Math.round(Math.cos(angle) * 120), Math.round(Math.sin(angle) * 120));
    arrow.setControlPoint({
      x: Math.round(Math.cos(angle) * 30),
      y: Math.round(Math.sin(angle) * 30),
    });
    configure(arrow, i);
    arrows.push(arrow);
  }
  return createScene(arrows).svg;
};

type WaveLine = HeartbeatLine | NeuronLine;

const waveScene = (
  create: () => WaveLine,
  ends: [number, number, number, number][],
  configure: (line: WaveLine, i: number) => void = () => {},
): Element => {
  const lines = ends.map(([x1, y1, x2, y2], i) => {
    const line = create();
    line.setFrom(x1, y1);
    line.setTo(x2, y2);
    configure(line, i);
    return line;
  });
  return createScene(lines).svg;
};

const WAVE_DIRECTIONS: [number, number, number, number][] = [
  [-180, -150, 180, -150], // horizontal
  [-150, -120, -150, 180], // vertical
  [-100, -100, 150, 150], // diagonal
  [150, 100, -50, -50], // right to left, upwards
];

const WAVE_SHORT: [number, number, number, number][] = [
  [-150, -150, -149, -150], // length 1
  [-100, -100, -97, -96], // length 5
  [0, 0, 20, 0], // length 20
  [100, 100, 100, 100], // zero length: W-STALEPATH keeps the path drawn after setFrom
];

const WAVE_STROKES: [number, number, number, number][] = [
  [-180, -150, 180, -150],
  [-180, -75, 180, -75],
  [-180, 0, 180, 0],
  [-180, 75, 180, 75],
  [-180, 150, 180, 150],
];

const strokeVariants = (line: WaveLine, i: number) => {
  const variants: [number, string][] = [
    [1, 'solid'],
    [6, 'solid'],
    [3, 'dash'],
    [3, 'dot'],
    [3, 'dashdot'],
  ];
  const [width, style] = variants[i]!;
  line.setStroke(width, style, '#335577', 1);
};

const textScene = (texts: [string, (t: Text) => void][]): Element => {
  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(0, 0);
  texts.forEach(([value, configure], i) => {
    const text = new Text();
    workspace.append(text);
    text.setText(value);
    text.setFont('Arial', 10, 'normal', 'normal');
    text.setColor('#222222');
    text.setPosition(20, 20 + 80 * i);
    configure(text);
  });
  return workspace.getSVGElement();
};

const SCENARIOS: Record<string, Scenario> = {
  // PolyLine: every style × orientation (W-VCURVE, W-HCURVE, W-MIDCURVE).
  ...Object.fromEntries(
    ['Straight', 'MiddleStraight', 'MiddleCurved', 'Curved'].flatMap((style) =>
      (['horizontal', 'vertical'] as Orientation[]).map((o) => [
        `polyline-${style.toLowerCase()}-${o}`,
        () => polylineScene(style, o),
      ]),
    ),
  ),

  // CurvedLine: the story setup (custom control points), default control points, widths.
  'curvedline-control-points': () =>
    curvedScene(
      QUADRANTS.map(([x, y]) => [0, 0, x, y]),
      (line) => {
        const { x } = line.getTo();
        line.setSrcControlPoint({ x: x / 2, y: 0 });
        line.setDestControlPoint({ x: -x / 2, y: 0 });
        line.setStroke(1, 'solid', 'blue', 1);
        line.setWidth(0);
      },
    ),
  'curvedline-default-horizontal': () =>
    curvedScene(
      [
        [-150, -100, 150, -100],
        [150, -50, -150, -50],
        [-150, 0, 150, 100],
      ],
      (line) => line.setWidth(0),
    ),
  // W-DEFCP: vertical and near-vertical default control points overshoot both ends.
  'curvedline-default-vertical': () =>
    curvedScene(
      [
        [-100, -150, -100, 150],
        [0, 150, 0, -150],
        [100, -150, 100.05, 150],
      ],
      (line) => line.setWidth(0),
    ),
  'curvedline-width-horizontal': () =>
    curvedScene(
      [
        [-150, -120, 150, -60],
        [-150, 0, 150, 60],
        [-150, 120, 150, 180],
      ],
      (line) => {
        const { y } = line.getFrom();
        line.setSrcControlPoint({ x: 100, y: 0 });
        line.setDestControlPoint({ x: -100, y: 0 });
        line.setWidth(y < 0 ? 1 : y === 0 ? 10 : 20);
        line.setFill('#3366cc', 1);
        line.setStroke(1, 'solid', '#3366cc', 1);
      },
    ),
  // W-TAPER: the taper is offset only along y, so vertical connections lose their thickness.
  'curvedline-width-vertical': () =>
    curvedScene(
      [
        [-120, -150, -60, 150],
        [0, -150, 60, 150],
        [120, -150, 180, 150],
      ],
      (line) => {
        const { x } = line.getFrom();
        line.setSrcControlPoint({ x: 0, y: 100 });
        line.setDestControlPoint({ x: 0, y: -100 });
        line.setWidth(x < 0 ? 1 : x === 0 ? 10 : 20);
        line.setFill('#3366cc', 1);
        line.setStroke(1, 'solid', '#3366cc', 1);
      },
    ),
  'curvedline-dashed': () =>
    curvedScene(
      [
        [-150, -100, 150, 0],
        [-150, 50, 150, 150],
      ],
      (line) => {
        line.setWidth(0);
        line.setStroke(2, 'solid', 'red', 1);
        line.setDashed(6, 3);
      },
    ),

  // ArcLine: both orientations, every quadrant and the axis-aligned ends.
  'arcline-horizontal': () => arcScene('horizontal'),
  'arcline-vertical': () => arcScene('vertical'),

  // Arrow: 8 directions, the y = 0 case, stroke width, dashes (W-ARROWDASH).
  'arrow-directions': () => arrowScene(() => {}),
  'arrow-y0': () => {
    const arrows = [-1, 1].map((sign) => {
      const arrow = new Arrow();
      arrow.setFrom(sign * 100, 0);
      arrow.setControlPoint({ x: sign * 30, y: 0 });
      return arrow;
    });
    return createScene(arrows).svg;
  },
  'arrow-stroke': () =>
    arrowScene((arrow, i) => {
      arrow.setStrokeWidth(i % 2 === 0 ? 5 : 2);
      arrow.setStrokeColor(i % 2 === 0 ? '#cc3333' : '#3333cc');
      arrow.setDashed(i % 2 === 1, 5, 5);
    }),

  // HeartbeatLine and NeuronLine: directions, short and zero length, stroke widths and styles.
  'heartbeatline-directions': () => waveScene(() => new HeartbeatLine(), WAVE_DIRECTIONS),
  'heartbeatline-short': () => waveScene(() => new HeartbeatLine(), WAVE_SHORT),
  'heartbeatline-stroke': () => waveScene(() => new HeartbeatLine(), WAVE_STROKES, strokeVariants),
  'neuronline-directions': () => waveScene(() => new NeuronLine(), WAVE_DIRECTIONS),
  'neuronline-short': () => waveScene(() => new NeuronLine(), WAVE_SHORT),
  'neuronline-stroke': () => waveScene(() => new NeuronLine(), WAVE_STROKES, strokeVariants),

  // Image: size, href and position.
  image: () => {
    const images = (
      [
        [-150, -150, 32, 32],
        [0, -150, 64, 32],
        [-150, 0, 100, 100],
      ] as [number, number, number, number][]
    ).map(([x, y, w, h]) => {
      const image = new Image();
      image.setHref('../../../storybook/src/stories/assets/colors.svg');
      image.setPosition(x, y);
      image.setSize(w, h);
      return image;
    });
    return createScene(images).svg;
  },

  // Text: multiline, CRLF, empty and trailing lines, fonts and weights.
  'text-lines': () =>
    textScene([
      ['One line', () => {}],
      ['Line 1\nLine 2\nLine 3', () => {}],
      ['Before empty\n\nAfter empty', () => {}],
      ['Trailing newline\n', () => {}],
      ['CRLF 1\r\nCRLF 2', () => {}],
    ]),
  'text-empty': () => textScene([['', () => {}]]),
  'text-fonts': () =>
    textScene([
      ['Arial normal', (t) => t.setFont('Arial', 10, 'normal', 'normal')],
      ['Verdana bold', (t) => t.setFont('Verdana', 12, 'normal', 'bold')],
      ['Times italic', (t) => t.setFont('Times', 14, 'italic', 'normal')],
      ['Tahoma 20 bold italic', (t) => t.setFont('Tahoma', 20, 'italic', 'bold')],
      ['Coloured', (t) => t.setColor('#cc3333')],
    ]),
  // W-HTMLFONT context: the SVG after a container resize written directly, as mindplot did.
  'text-resized-workspace': () => {
    const workspace = new Workspace();
    workspace.setSize('800px', '800px');
    workspace.setCoordSize(800, 800);
    const text = new Text();
    workspace.append(text);
    text.setText('Resized\nworkspace');
    text.setFont('Arial', 10, 'normal', 'normal');
    text.setPosition(10, 10);
    const svg = workspace.getSVGElement();
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '400');
    workspace.setCoordSize(400, 400);
    return svg;
  },

  // Workspace: fractional zoom and origin, pan accumulation (W-VIEWBOX, BL-71).
  'workspace-fractional': () => {
    const rect = new Rect(0, { width: 50, height: 50, x: -25, y: -25 });
    return createScene([rect], { coordSize: [548.25, 548.25], coordOrigin: [-274.125, -274.125] })
      .svg;
  },
  'workspace-pan': () => {
    const rect = new Rect(0, { width: 50, height: 50, x: -25, y: -25 });
    const { workspace, svg } = createScene([rect], { coordSize: [120, 120] });
    for (let i = 0; i < 10; i++) {
      const { x, y } = workspace.getCoordOrigin();
      workspace.setCoordOrigin(x + 0.3, y + 0.3);
    }
    return svg;
  },

  // Basic shapes and containers.
  rect: () =>
    createScene([
      new Rect(0, { width: 100, height: 60, x: -150, y: -150, fillColor: '#88cc88' }),
      new Rect(0.5, { width: 100, height: 60, x: 0, y: -150, stroke: '2 dash red' }),
      new Rect(1, { width: 60, height: 60, x: -150, y: 0, fillColor: '#8888cc' }),
    ]).svg,
  ellipse: () =>
    createScene([
      new Ellipse({ width: 100, height: 50, x: -100, y: -100 }),
      new Ellipse({ width: 40, height: 80, x: 100, y: 100, stroke: '3 dot red' }),
    ]).svg,
  'straightline-styles': () =>
    createScene(
      ['solid', 'dash', 'dot', 'dashdot', 'longdash'].map((style, i) => {
        const line = new StraightLine();
        line.setFrom(-150, -150 + i * 60);
        line.setTo(150, -150 + i * 60);
        line.setStroke(3, style, 'black', 1);
        return line;
      }),
    ).svg,
  'group-nested': () => {
    const outer = new Group({ width: 200, height: 200, x: -100, y: -100 });
    outer.setCoordSize(100, 100);
    const inner = new Group({ width: 50, height: 50, x: 25, y: 25 });
    inner.setCoordSize(100, 100);
    inner.setCoordOrigin(-50, -50);
    inner.append(new Rect(0, { width: 100, height: 100, x: -50, y: -50 }));
    outer.append(new Rect(0, { width: 100, height: 100, x: 0, y: 0, fillColor: '#eeeeee' }));
    outer.append(inner);
    return createScene([outer]).svg;
  },
  // W-OPACITY: setVisibility's inline style.opacity overrides Group.setOpacity.
  'element-visibility': () => {
    const hidden = new Rect(0, { width: 60, height: 60, x: -150, y: -150 });
    hidden.setVisibility(false, 300);
    const visible = new Ellipse({ width: 60, height: 60, x: 0, y: 0 });
    visible.setVisibility(true);
    const group = new Group({ width: 100, height: 100, x: 50, y: 50 });
    group.setCoordSize(100, 100);
    group.append(new Rect(0, { width: 100, height: 100, x: 0, y: 0 }));
    group.setOpacity(0.5);
    group.setVisibility(true);
    return createScene([hidden, visible, group]).svg;
  },
  'element-opacity': () => {
    const rect = new Rect(0, { width: 100, height: 100, x: -50, y: -50 });
    rect.setStroke(2, 'solid', 'red', 0.5);
    rect.setFill('gray', 0.5);
    const ellipse = new Ellipse({ width: 70, height: 70, x: 0, y: 0 });
    ellipse.setOpacity(0.3);
    return createScene([rect, ellipse]).svg;
  },
};

describe('SVG goldens', () => {
  it.each(Object.keys(SCENARIOS))('%s', (name) => {
    expectGolden(name, SCENARIOS[name]!());
  });

  it('every golden file on disk has a scenario', () => {
    expect(listGoldens().filter((g) => !(g in SCENARIOS))).toEqual([]);
  });

  it('is deterministic', () => {
    Object.values(SCENARIOS).forEach((scenario) => {
      expect(serializeSvg(scenario())).toBe(serializeSvg(scenario()));
    });
  });
});

describe('golden serializer', () => {
  it('rounds numbers to 2 decimals and drops -0', () => {
    expect(roundNumbers('M0.004,-0.001 L1.23456,10.5 13.0')).toBe('M0,0 L1.23,10.5 13');
  });

  it('sorts attributes, strips ids and keeps the xlink prefix', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('y', '2');
    image.setAttribute('id', 'volatile');
    image.setAttribute('x', '1.005');
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'a.png');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = 'a < b';
    svg.append(image, text);
    expect(serializeSvg(svg)).toBe(
      [
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
        '  <image x="1" xlink:href="a.png" y="2"/>',
        '  <text>a &lt; b</text>',
        '</svg>',
        '',
      ].join('\n'),
    );
  });
});
