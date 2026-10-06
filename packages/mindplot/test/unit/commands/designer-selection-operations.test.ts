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

import { LineType } from '../../../src/components/ConnectionLine';
import Designer from '../../../src/components/Designer';
import { $msg } from '../../../src/components/Messages';
import ToolbarNotifier from '../../../src/components/model/ToolbarNotifier';
import { StrokeStyle } from '../../../src/components/model/RelationshipModel';
import { buildDesigner, Harness, SAMPLE_MAP } from './designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The Designer's toolbar operations act on the selected topics or relationships,
 * through an undoable command. Each must undo back to the saved map before it.
 */

// Loading a map selects the central topic: start every test with nothing selected.
const build = async (xml?: string): Promise<Harness> => {
  const harness = await buildDesigner(xml);
  harness.designer.deselectAll();
  return harness;
};

const select = (harness: Harness, ...ids: number[]) => {
  ids.forEach((id) => harness.topic(id).setOnFocus(true));
};

const selectRelationship = (designer: Designer) => {
  const relationship = designer.getModel().getRelationships()[0];
  relationship.setOnFocus(true);
  return () => designer.getModel().getRelationships()[0];
};

const undoSteps = (designer: Designer): number => {
  let steps = -1;
  const listener = (event?: unknown) => {
    steps = (event as { undoSteps: number }).undoSteps;
  };
  designer.addEvent('modelUpdate', listener);
  designer.getActionDispatcher().actionRunner.fireChangeEvent();
  designer.removeEvent('modelUpdate', listener);
  return steps;
};

/** Executes `apply`, then checks undo and redo against the saved maps. */
const expectUndoRoundTrip = (harness: Harness, apply: () => void) => {
  const before = harness.save();
  apply();
  const after = harness.save();
  expect(after).not.toEqual(before);

  harness.designer.undo();
  expect(harness.save()).toEqual(before);

  harness.designer.redo();
  expect(harness.save()).toEqual(after);
};

let notify: jest.SpyInstance;
beforeEach(() => {
  notify = jest.spyOn(ToolbarNotifier, 'show').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Designer topic style operations on a styled topic', () => {
  // A has its own font, shape and connection style: undo restores those values.
  const styled = SAMPLE_MAP.replace(
    'text="A" ',
    'text="A" fontStyle="Arial;12;;bold;italic;" shape="rectangle" connStyle="2" ',
  );

  type Case = [string, (designer: Designer) => void, (h: Harness) => unknown, unknown];
  const cases: Case[] = [
    [
      'font family',
      (d) => d.changeFontFamily('Courier'),
      (h) => h.topic(1).getFontFamily(),
      'Courier',
    ],
    ['font size', (d) => d.changeFontSize(20), (h) => h.topic(1).getFontSize(), 20],
    ['font style', (d) => d.changeFontStyle(), (h) => h.topic(1).getFontStyle(), 'normal'],
    ['font weight', (d) => d.changeFontWeight(), (h) => h.topic(1).getFontWeight(), 'normal'],
    [
      'font color',
      (d) => d.changeFontColor('#123456'),
      (h) => h.topic(1).getModel().getFontColor(),
      '#123456',
    ],
    [
      'background color',
      (d) => d.changeBackgroundColor('#abcdef'),
      (h) => h.topic(1).getModel().getBackgroundColor(),
      '#abcdef',
    ],
    [
      'border color',
      (d) => d.changeBorderColor('#fedcba'),
      (h) => h.topic(1).getModel().getBorderColor(),
      '#fedcba',
    ],
    ['shape', (d) => d.changeShapeType('elipse'), (h) => h.topic(1).getShapeType(), 'elipse'],
    [
      'connection style',
      (d) => d.changeConnectionStyle(LineType.POLYLINE_STRAIGHT),
      (h) => h.topic(1).getConnectionStyle(),
      LineType.POLYLINE_STRAIGHT,
    ],
    [
      'connection color',
      (d) => d.changeConnectionColor('#00aa00'),
      (h) => h.topic(1).getModel().getConnectionColor(),
      '#00aa00',
    ],
    [
      'image emoji',
      (d) => d.changeImageEmojiChar('😀'),
      (h) => h.topic(1).getImageEmojiChar(),
      '😀',
    ],
    [
      'gallery image',
      (d) => d.changeImageGalleryIconName('star'),
      (h) => h.topic(1).getImageGalleryIconName(),
      'star',
    ],
  ];

  it.each(cases)('changes the %s of the selection, undoably', async (_name, apply, read, value) => {
    const harness = await build(styled);
    select(harness, 1);
    const original = read(harness);

    expectUndoRoundTrip(harness, () => apply(harness.designer));
    harness.designer.undo();
    expect(read(harness)).toEqual(original);
    harness.designer.redo();
    expect(read(harness)).toEqual(value);
  });

  it.each(cases)('does nothing to %s when no topic is selected', async (_name, apply) => {
    const harness = await build(styled);
    const before = harness.save();
    apply(harness.designer);
    expect(harness.save()).toEqual(before);
    expect(undoSteps(harness.designer)).toBe(0);
  });

  it('applies a change to every selected topic as one undo step', async () => {
    const harness = await build(styled);
    select(harness, 1, 3, 5);
    expectUndoRoundTrip(harness, () => harness.designer.changeFontColor('#ff00ff'));
    expect(undoSteps(harness.designer)).toBe(1);
    [1, 3, 5].forEach((id) => expect(harness.topic(id).getModel().getFontColor()).toBe('#ff00ff'));
  });
});

describe('Designer topic style operations on a topic styled by the theme', () => {
  // Like the color commands, these must keep the model value (undefined) as the old value, or
  // undo pins the theme default into the map and the topic stops following theme changes.
  const cases: [string, (designer: Designer) => void][] = [
    ['font family', (d) => d.changeFontFamily('Courier')],
    ['font size', (d) => d.changeFontSize(20)],
    ['font style', (d) => d.changeFontStyle()],
    ['font weight', (d) => d.changeFontWeight()],
    ['shape', (d) => d.changeShapeType('elipse')],
    ['connection style', (d) => d.changeConnectionStyle(LineType.POLYLINE_STRAIGHT)],
  ];

  it.each(cases)('leaves the %s unset after undo, and redoes it', async (_name, apply) => {
    const harness = await build();
    select(harness, 1);
    expectUndoRoundTrip(harness, () => apply(harness.designer));
  });

  it('toggles bold and italic again after an undo', async () => {
    const harness = await build();
    select(harness, 1);
    harness.designer.changeFontWeight();
    harness.designer.changeFontStyle();
    const toggled = [harness.topic(1).getFontWeight(), harness.topic(1).getFontStyle()];
    harness.designer.undo();
    harness.designer.undo();
    harness.designer.changeFontWeight();
    harness.designer.changeFontStyle();
    expect([harness.topic(1).getFontWeight(), harness.topic(1).getFontStyle()]).toEqual(toggled);
  });

  it('leaves the image emoji unset after undo', async () => {
    const harness = await build();
    select(harness, 1);
    expectUndoRoundTrip(harness, () => harness.designer.changeImageEmojiChar('😀'));
  });

  // A is a line by default in the classic theme, and a line has no border.
  const boxed = SAMPLE_MAP.replace('text="A" ', 'text="A" shape="rectangle" ');

  it('changes the border style, and undo leaves it unset', async () => {
    const harness = await build(boxed);
    select(harness, 1);
    const model = harness.topic(1).getModel();

    harness.designer.changeBorderStyle('dashed');
    expect(model.getBorderStyle()).toBe('dashed');
    harness.designer.undo();
    expect(model.getBorderStyle()).toBeUndefined();
    harness.designer.redo();
    expect(model.getBorderStyle()).toBe('dashed');
  });

  // Bug: the border style can be set from the editor toolbar and is rendered (Topic.ts:1550),
  // but XMLSerializerTango neither writes nor reads it, so it is lost when the map is saved.
  it.failing('saves the border style with the map', async () => {
    const harness = await build(boxed);
    select(harness, 1);
    harness.designer.changeBorderStyle('dashed');

    const reloaded = await build(harness.save());
    expect(reloaded.topic(1).getModel().getBorderStyle()).toBe('dashed');
  });
});

describe('Designer operations rejected by validation', () => {
  const lineMap = SAMPLE_MAP.replace('text="A" ', 'text="A" shape="line" ');

  it.each([
    [
      'background color',
      (d: Designer) => d.changeBackgroundColor('#ff0000'),
      (h: Harness) => h.topic(1).getModel().getBackgroundColor(),
    ],
    [
      'border color',
      (d: Designer) => d.changeBorderColor('#ff0000'),
      (h: Harness) => h.topic(1).getModel().getBorderColor(),
    ],
    [
      'border style',
      (d: Designer) => d.changeBorderStyle('dotted'),
      (h: Harness) => h.topic(1).getModel().getBorderStyle(),
    ],
  ])('does not set the %s of a line topic, and says so', async (_name, apply, read) => {
    const harness = await build(lineMap);
    select(harness, 1);
    const before = harness.save();

    apply(harness.designer);
    expect(read(harness)).toBeUndefined();
    expect(harness.save()).toEqual(before);
    expect(undoSteps(harness.designer)).toBe(0);
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('line topics'), true);
  });

  it('applies to the valid topics of a mixed selection only', async () => {
    const harness = await build(lineMap);
    // The central topic is a rounded rectangle, A a line.
    select(harness, 0, 1);

    harness.designer.changeBorderColor('#00ff00');
    expect(harness.topic(1).getModel().getBorderColor()).toBeUndefined();
    expect(harness.topic(0).getModel().getBorderColor()).toBe('#00ff00');
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it.each(['line', 'none'] as const)(
    'does not turn the central topic into a %s shape',
    async (shape) => {
      const harness = await build();
      select(harness, 0);
      const before = harness.save();

      harness.designer.changeShapeType(shape);
      expect(harness.save()).toEqual(before);
      expect(notify).toHaveBeenCalledWith($msg('CENTRAL_TOPIC_STYLE_CAN_NOT_BE_CHANGED'), true);
    },
  );

  it('lets other topics take the line shape', async () => {
    const harness = await build(SAMPLE_MAP.replace('text="A" ', 'text="A" shape="rectangle" '));
    select(harness, 1);
    expectUndoRoundTrip(harness, () => harness.designer.changeShapeType('line'));
    expect(notify).not.toHaveBeenCalled();
  });
});

describe('Designer.deleteSelectedEntities', () => {
  it('says so and deletes nothing when nothing is selected', async () => {
    const harness = await build();
    const before = harness.save();
    harness.designer.deleteSelectedEntities();
    expect(harness.save()).toEqual(before);
    expect(notify).toHaveBeenCalledWith($msg('ENTITIES_COULD_NOT_BE_DELETED'), true);
  });

  it('refuses to delete the central topic alone', async () => {
    const harness = await build();
    select(harness, 0);
    const before = harness.save();
    harness.designer.deleteSelectedEntities();
    expect(harness.save()).toEqual(before);
    expect(notify).toHaveBeenCalledWith($msg('CENTRAL_TOPIC_CAN_NOT_BE_DELETED'), true);
  });

  it('deletes the other selected topics and keeps the central one', async () => {
    const harness = await build();
    select(harness, 0, 3);
    expectUndoRoundTrip(harness, () => harness.designer.deleteSelectedEntities());

    harness.designer.undo();
    harness.designer.redo();
    const ids = harness.designer
      .getModel()
      .getTopics()
      .map((topic) => topic.getId());
    expect(ids).toContain(0);
    expect(ids).not.toContain(3);
    expect(ids).not.toContain(4);
    // B was the relationship's source: it goes along.
    expect(harness.designer.getModel().getRelationships()).toHaveLength(0);
    expect(notify).not.toHaveBeenCalled();
  });

  it('deletes a selected relationship', async () => {
    const harness = await build();
    selectRelationship(harness.designer);
    expectUndoRoundTrip(harness, () => harness.designer.deleteSelectedEntities());

    harness.designer.undo();
    expect(harness.designer.getModel().getRelationships()).toHaveLength(1);
    harness.designer.redo();
    expect(harness.designer.getModel().getRelationships()).toHaveLength(0);
  });
});

describe('Designer relationship style operations', () => {
  it('changes the color of the selected relationship, and undo clears it', async () => {
    const harness = await build();
    const live = selectRelationship(harness.designer);
    expectUndoRoundTrip(harness, () => harness.designer.changeRelationshipColor('#ff0000'));
    expect(live().getModel().getStrokeColor()).toBe('#ff0000');
    harness.designer.undo();
    expect(live().getModel().getStrokeColor()).toBeUndefined();
  });

  it('changes the stroke style of the selected relationship', async () => {
    const harness = await build();
    const live = selectRelationship(harness.designer);
    expect(live().getModel().getStrokeStyle()).toBe(StrokeStyle.DASHED);

    expectUndoRoundTrip(harness, () =>
      harness.designer.changeRelationshipStrokeStyle(StrokeStyle.DOTTED),
    );
    expect(live().getModel().getStrokeStyle()).toBe(StrokeStyle.DOTTED);
    harness.designer.undo();
    expect(live().getModel().getStrokeStyle()).toBe(StrokeStyle.DASHED);
  });

  it('toggles the start and end arrows of the selected relationship', async () => {
    const harness = await build();
    const live = selectRelationship(harness.designer);

    expectUndoRoundTrip(harness, () => harness.designer.changeRelationshipStartArrow(true));
    expect(live().getModel().getStartArrow()).toBe(true);

    expectUndoRoundTrip(harness, () => harness.designer.changeRelationshipEndArrow(false));
    expect(live().getModel().getEndArrow()).toBe(false);
  });

  it.each([
    ['color', (d: Designer) => d.changeRelationshipColor('#ff0000')],
    ['stroke style', (d: Designer) => d.changeRelationshipStrokeStyle(StrokeStyle.SOLID)],
    ['start arrow', (d: Designer) => d.changeRelationshipStartArrow(true)],
    ['end arrow', (d: Designer) => d.changeRelationshipEndArrow(false)],
  ])('does not change the %s when no relationship is selected', async (_name, apply) => {
    const harness = await build();
    const before = harness.save();
    apply(harness.designer);
    expect(harness.save()).toEqual(before);
    expect(undoSteps(harness.designer)).toBe(0);
  });

  it('ignores a relationship command whose relationship was deleted', async () => {
    const harness = await build();
    const dispatcher = harness.designer.getActionDispatcher();
    const relationship = harness.designer.getModel().getRelationships()[0];
    dispatcher.deleteEntities([], [relationship.getId()]);
    const afterDelete = harness.save();

    dispatcher.changeRelationshipColor([relationship], '#ff0000');
    expect(harness.save()).toEqual(afterDelete);
    harness.designer.undo();
    expect(harness.save()).toEqual(afterDelete);
  });
});

describe('Designer icon, link and note operations', () => {
  it.each([
    ['emoji', 'eicon'],
    ['image', 'icon'],
  ] as const)('adds an %s icon to the selected topics, undoably', async (type, featureType) => {
    const harness = await build();
    select(harness, 1, 3);
    expectUndoRoundTrip(harness, () => harness.designer.addIconType(type, 'smile'));

    [1, 3].forEach((id) => {
      const features = harness.topic(id).getModel().getFeatures();
      expect(features.map((feature) => feature.getType())).toEqual([featureType]);
    });
    harness.designer.undo();
    expect(harness.topic(1).getModel().getFeatures()).toHaveLength(0);
  });

  it.each(['link', 'note'] as const)(
    'asks to open the %s editor of the selected topic',
    async (kind) => {
      const harness = await build();
      const events: unknown[] = [];
      harness.designer.addEvent('featureEdit', (event) => events.push(event));

      if (kind === 'link') harness.designer.addLink();
      else harness.designer.addNote();
      expect(events).toHaveLength(0);

      select(harness, 3);
      if (kind === 'link') harness.designer.addLink();
      else harness.designer.addNote();
      expect(events).toEqual([{ event: kind, topic: harness.topic(3) }]);
    },
  );
});
