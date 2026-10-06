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

import type { Designer } from '@wisemapping/mindplot';
import NodePropertyBuilder from '../../../src/classes/model/node-property-builder';
import { SwitchValueDirection } from '../../../src/classes/model/value-stepper';

jest.mock('@wisemapping/mindplot', () => ({
  StrokeStyle: { SOLID: 'solid', DASHED: 'dashed', DOTTED: 'dotted' },
}));

type TopicProps = {
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  fontColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: string;
  connectionColor?: string;
  connectionStyle?: number;
  shapeType?: string;
  link?: string;
  note?: string;
  emoji?: string;
  galleryIcon?: string;
};

const fakeTopic = (props: TopicProps = {}) => {
  const topic = {
    getFontSize: () => props.fontSize,
    getFontWeight: () => props.fontWeight,
    getFontStyle: () => props.fontStyle,
    getFontFamily: () => props.fontFamily,
    getFontColor: jest.fn(() => props.fontColor),
    getBackgroundColor: jest.fn(() => props.backgroundColor),
    getBorderColor: jest.fn(() => props.borderColor),
    getBorderStyle: () => props.borderStyle,
    getConnectionColor: jest.fn(() => props.connectionColor),
    getLinkValue: () => props.link,
    setLinkValue: jest.fn(),
    getNoteValue: () => props.note,
    setNoteValue: jest.fn(),
    getImageEmojiChar: () => props.emoji,
    getImageGalleryIconName: () => props.galleryIcon,
    getModel: () => ({
      getConnectionStyle: () => props.connectionStyle,
      getShapeType: () => props.shapeType,
    }),
  };
  return topic;
};

type FakeTopic = ReturnType<typeof fakeTopic>;

type RelationshipProps = {
  strokeColor?: string;
  strokeStyle?: string;
  endArrow?: boolean;
  startArrow?: boolean;
};

const fakeRelationship = (props: RelationshipProps) => ({
  getModel: () => ({
    getStrokeColor: () => props.strokeColor,
    getStrokeStyle: () => props.strokeStyle,
    getEndArrow: () => props.endArrow,
    getStartArrow: () => props.startArrow,
  }),
});

const DESIGNER_METHODS = [
  'changeFontWeight',
  'changeFontSize',
  'changeBackgroundColor',
  'changeImageEmojiChar',
  'changeImageGalleryIconName',
  'changeTheme',
  'changeBorderColor',
  'changeBorderStyle',
  'changeFontColor',
  'addIconType',
  'changeFontFamily',
  'changeFontStyle',
  'changeConnectionStyle',
  'changeConnectionColor',
  'changeRelationshipColor',
  'changeRelationshipStrokeStyle',
  'changeRelationshipEndArrow',
  'changeRelationshipStartArrow',
  'changeShapeType',
  'changeLayout',
] as const;

type DesignerMethod = (typeof DESIGNER_METHODS)[number];

const setup = (
  options: {
    topics?: FakeTopic[];
    relationship?: ReturnType<typeof fakeRelationship>;
    variant?: string;
    theme?: string;
    layout?: string;
  } = {},
) => {
  const topics = options.topics ?? [];
  const spies = Object.fromEntries(DESIGNER_METHODS.map((m) => [m, jest.fn()])) as Record<
    DesignerMethod,
    jest.Mock
  >;
  const designer = {
    ...spies,
    getModel: () => ({
      selectedTopic: () => topics[0] ?? null,
      selectedRelationship: () => options.relationship ?? null,
      filterSelectedTopics: () => topics,
    }),
    getThemeVariant: () => options.variant ?? 'light',
    getMindmap: () => ({ getTheme: () => options.theme ?? 'prism' }),
    getLayout: () => options.layout ?? 'mindmap',
  } as unknown as Designer;
  return { builder: new NodePropertyBuilder(designer), spies, topics };
};

describe('NodePropertyBuilder font models', () => {
  it('reports the selected topic font weight as a string', () => {
    const { builder } = setup({ topics: [fakeTopic({ fontWeight: 'bold' })] });
    expect(builder.fontWeigthModel().getValue()).toBe('bold');
  });

  it('toggles the font weight through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.fontWeigthModel().switchValue!();
    expect(spies.changeFontWeight).toHaveBeenCalledTimes(1);
  });

  it('reports the selected topic font size', () => {
    const { builder } = setup({ topics: [fakeTopic({ fontSize: 15 })] });
    expect(builder.getFontSizeModel().getValue()).toBe(15);
  });

  it('falls back to the default size when the topic has none', () => {
    const { builder } = setup({ topics: [fakeTopic()] });
    expect(builder.getFontSizeModel().getValue()).toBe(10);
  });

  it('steps the font size up to the next size', () => {
    const { builder, spies } = setup({ topics: [fakeTopic({ fontSize: 8 })] });
    builder.getFontSizeModel().switchValue!(SwitchValueDirection.up);
    expect(spies.changeFontSize).toHaveBeenCalledWith(10);
  });

  it('steps the font size down to the previous size', () => {
    const { builder, spies } = setup({ topics: [fakeTopic({ fontSize: 10 })] });
    builder.getFontSizeModel().switchValue!(SwitchValueDirection.down);
    expect(spies.changeFontSize).toHaveBeenCalledWith(8);
  });

  it('keeps the largest size when stepping up past it', () => {
    const { builder, spies } = setup({ topics: [fakeTopic({ fontSize: 15 })] });
    builder.getFontSizeModel().switchValue!(SwitchValueDirection.up);
    expect(spies.changeFontSize).toHaveBeenCalledWith(15);
  });

  it('re-applies the current size when no direction is given', () => {
    const { builder, spies } = setup({ topics: [fakeTopic({ fontSize: 6 })] });
    builder.getFontSizeModel().switchValue!();
    expect(spies.changeFontSize).toHaveBeenCalledWith(6);
  });

  it('returns the same font size model on every call', () => {
    const { builder } = setup();
    expect(builder.getFontSizeModel()).toBe(builder.getFontSizeModel());
  });

  it('reports the font family shared by every selected topic', () => {
    const { builder } = setup({
      topics: [fakeTopic({ fontFamily: 'Arial' }), fakeTopic({ fontFamily: 'Arial' })],
    });
    expect(builder.getFontFamilyModel().getValue()).toBe('Arial');
  });

  it('reports no font family when the selected topics disagree', () => {
    const { builder } = setup({
      topics: [fakeTopic({ fontFamily: 'Arial' }), fakeTopic({ fontFamily: 'Verdana' })],
    });
    expect(builder.getFontFamilyModel().getValue()).toBeUndefined();
  });

  it('reports no font family with nothing selected', () => {
    const { builder } = setup();
    expect(builder.getFontFamilyModel().getValue()).toBeUndefined();
  });

  it('changes the font family, ignoring an empty choice', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getFontFamilyModel().setValue!('Verdana');
    builder.getFontFamilyModel().setValue!(undefined);
    builder.getFontFamilyModel().setValue!('');
    expect(spies.changeFontFamily).toHaveBeenCalledTimes(1);
    expect(spies.changeFontFamily).toHaveBeenCalledWith('Verdana');
    expect(builder.getFontFamilyModel()).toBe(builder.getFontFamilyModel());
  });

  it('reports the font style, normal when nothing is selected', () => {
    expect(
      setup({ topics: [fakeTopic({ fontStyle: 'italic' })] })
        .builder.getFontStyleModel()
        .getValue(),
    ).toBe('italic');
    expect(setup().builder.getFontStyleModel().getValue()).toBe('normal');
  });

  it('toggles the font style through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getFontStyleModel().switchValue!();
    expect(spies.changeFontStyle).toHaveBeenCalledTimes(1);
    expect(builder.getFontStyleModel()).toBe(builder.getFontStyleModel());
  });

  it('reads the font colour for the current theme variant', () => {
    const topic = fakeTopic({ fontColor: '#ffffff' });
    const { builder } = setup({ topics: [topic], variant: 'dark' });
    expect(builder.getFontColorModel().getValue()).toBe('#ffffff');
    expect(topic.getFontColor).toHaveBeenCalledWith('dark');
  });

  it('changes the font colour through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getFontColorModel().setValue!('#00ff00');
    expect(spies.changeFontColor).toHaveBeenCalledWith('#00ff00');
    expect(builder.getFontColorModel()).toBe(builder.getFontColorModel());
  });
});

describe('NodePropertyBuilder topic colour and border models', () => {
  it('reads the background colour of the selected topic for the variant', () => {
    const topic = fakeTopic({ backgroundColor: '#123456' });
    const { builder } = setup({ topics: [topic], variant: 'dark' });
    expect(builder.getSelectedTopicColorModel().getValue()).toBe('#123456');
    expect(topic.getBackgroundColor).toHaveBeenCalledWith('dark');
    expect(builder.getSelectedTopicColorModel()).toBe(builder.getSelectedTopicColorModel());
  });

  it('reads a border colour shared by the selection, for the variant', () => {
    const a = fakeTopic({ borderColor: '#aaaaaa' });
    const b = fakeTopic({ borderColor: '#aaaaaa' });
    const { builder } = setup({ topics: [a, b], variant: 'light' });
    expect(builder.getColorBorderModel().getValue()).toBe('#aaaaaa');
    expect(a.getBorderColor).toHaveBeenCalledWith('light');
  });

  it('reads no border colour for a mixed selection', () => {
    const { builder } = setup({
      topics: [fakeTopic({ borderColor: '#aaaaaa' }), fakeTopic({ borderColor: '#bbbbbb' })],
    });
    expect(builder.getColorBorderModel().getValue()).toBeUndefined();
  });

  it('changes the border colour through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getColorBorderModel().setValue!('#cccccc');
    builder.getColorBorderModel().setValue!(undefined);
    expect(spies.changeBorderColor).toHaveBeenNthCalledWith(1, '#cccccc');
    expect(spies.changeBorderColor).toHaveBeenNthCalledWith(2, undefined);
    expect(builder.getColorBorderModel()).toBe(builder.getColorBorderModel());
  });

  it.each([
    ['solid', 'solid'],
    ['dashed', 'dashed'],
    ['dotted', 'dotted'],
    ['wavy', undefined],
    [undefined, undefined],
  ])('maps a %p border style to %p', (style, expected) => {
    const { builder } = setup({ topics: [fakeTopic({ borderStyle: style })] });
    expect(builder.getBorderStyleModel().getValue()).toBe(expected);
  });

  it('changes the border style through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getBorderStyleModel().setValue!('dotted' as never);
    expect(spies.changeBorderStyle).toHaveBeenCalledWith('dotted');
    expect(builder.getBorderStyleModel()).toBe(builder.getBorderStyleModel());
  });

  it('reports the shared shape, mapping none to no shape', () => {
    expect(
      setup({ topics: [fakeTopic({ shapeType: 'rectangle' })] })
        .builder.getTopicShapeModel()
        .getValue(),
    ).toBe('rectangle');
    expect(
      setup({ topics: [fakeTopic({ shapeType: 'none' })] })
        .builder.getTopicShapeModel()
        .getValue(),
    ).toBeUndefined();
  });

  it('changes the shape through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getTopicShapeModel().setValue!('elipse' as never);
    expect(spies.changeShapeType).toHaveBeenCalledWith('elipse');
    expect(builder.getTopicShapeModel()).toBe(builder.getTopicShapeModel());
  });
});

describe('NodePropertyBuilder connection models', () => {
  it('reads the connection style set on the topic model', () => {
    const { builder } = setup({ topics: [fakeTopic({ connectionStyle: 3 })] });
    expect(builder.getConnectionStyleModel().getValue()).toBe(3);
    expect(setup().builder.getConnectionStyleModel().getValue()).toBeUndefined();
  });

  it('changes the connection style through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getConnectionStyleModel().setValue!(2 as never);
    expect(spies.changeConnectionStyle).toHaveBeenCalledWith(2);
    expect(builder.getConnectionStyleModel()).toBe(builder.getConnectionStyleModel());
  });

  it('reads the connection colour for the theme variant', () => {
    const topic = fakeTopic({ connectionColor: '#999999' });
    const { builder } = setup({ topics: [topic], variant: 'dark' });
    expect(builder.getConnectionColorModel().getValue()).toBe('#999999');
    expect(topic.getConnectionColor).toHaveBeenCalledWith('dark');
  });

  it('changes the connection colour through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getConnectionColorModel().setValue!('#111111');
    expect(spies.changeConnectionColor).toHaveBeenCalledWith('#111111');
    expect(builder.getConnectionColorModel()).toBe(builder.getConnectionColorModel());
  });
});

describe('NodePropertyBuilder link and note models', () => {
  it('reads the selected topic link', () => {
    const { builder } = setup({ topics: [fakeTopic({ link: 'https://example.com' })] });
    expect(builder.getLinkModel().getValue()).toBe('https://example.com');
  });

  it('stores a link on the selected topic', () => {
    const topic = fakeTopic();
    const { builder } = setup({ topics: [topic] });
    builder.getLinkModel().setValue!('https://example.com');
    expect(topic.setLinkValue).toHaveBeenCalledWith('https://example.com');
  });

  it.each(['', '   '])('removes the link when %p is entered', (value) => {
    const topic = fakeTopic({ link: 'https://example.com' });
    const { builder } = setup({ topics: [topic] });
    builder.getLinkModel().setValue!(value);
    expect(topic.setLinkValue).toHaveBeenCalledWith(undefined);
  });

  it('does nothing when a link is set with nothing selected', () => {
    const { builder } = setup();
    expect(() => builder.getLinkModel().setValue!('https://example.com')).not.toThrow();
    expect(() => builder.getLinkModel().setValue!('')).not.toThrow();
  });

  it('reads the selected topic note, no note for an empty one', () => {
    expect(
      setup({ topics: [fakeTopic({ note: 'A note' })] })
        .builder.getNoteModel()
        .getValue(),
    ).toBe('A note');
    expect(
      setup({ topics: [fakeTopic({ note: '' })] })
        .builder.getNoteModel()
        .getValue(),
    ).toBeUndefined();
  });

  it('stores a note, and clears it for blank text', () => {
    const topic = fakeTopic();
    const { builder } = setup({ topics: [topic] });
    builder.getNoteModel().setValue!('Remember this');
    builder.getNoteModel().setValue!('  ');
    builder.getNoteModel().setValue!(undefined);
    expect(topic.setNoteValue.mock.calls).toEqual([['Remember this'], [undefined], [undefined]]);
    expect(builder.getNoteModel()).toBe(builder.getNoteModel());
  });
});

describe('NodePropertyBuilder image and icon models', () => {
  it('reads the emoji shared by the selection', () => {
    const { builder } = setup({ topics: [fakeTopic({ emoji: '🙂' }), fakeTopic({ emoji: '🙂' })] });
    expect(builder.getImageEmojiCharModel().getValue()).toBe('🙂');
  });

  it('reads no emoji for a mixed selection', () => {
    const { builder } = setup({ topics: [fakeTopic({ emoji: '🙂' }), fakeTopic({ emoji: '🎉' })] });
    expect(builder.getImageEmojiCharModel().getValue()).toBeUndefined();
  });

  it('changes the emoji through the designer', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getImageEmojiCharModel().setValue!('🎉');
    expect(spies.changeImageEmojiChar).toHaveBeenCalledWith('🎉');
    expect(builder.getImageEmojiCharModel()).toBe(builder.getImageEmojiCharModel());
  });

  it('reads and changes the gallery icon', () => {
    const { builder, spies } = setup({ topics: [fakeTopic({ galleryIcon: 'star' })] });
    expect(builder.getImageGalleryIconNameModel().getValue()).toBe('star');
    builder.getImageGalleryIconNameModel().setValue!('heart');
    expect(spies.changeImageGalleryIconName).toHaveBeenCalledWith('heart');
    expect(builder.getImageGalleryIconNameModel()).toBe(builder.getImageGalleryIconNameModel());
  });

  it('never reports a current icon', () => {
    const { builder } = setup({ topics: [fakeTopic()] });
    expect(builder.getTopicIconModel().getValue()).toBeUndefined();
  });

  it('adds the picked icon, split into its type and name', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getTopicIconModel().setValue!('emoji:😀');
    builder.getTopicIconModel().setValue!('image:flag_blue');
    expect(spies.addIconType.mock.calls).toEqual([
      ['emoji', '😀'],
      ['image', 'flag_blue'],
    ]);
  });

  it('adds nothing for an empty icon choice', () => {
    const { builder, spies } = setup({ topics: [fakeTopic()] });
    builder.getTopicIconModel().setValue!(undefined);
    expect(spies.addIconType).not.toHaveBeenCalled();
    expect(builder.getTopicIconModel()).toBe(builder.getTopicIconModel());
  });
});

describe('NodePropertyBuilder relationship models', () => {
  it('reads the selected relationship colour and changes it', () => {
    const { builder, spies } = setup({
      relationship: fakeRelationship({ strokeColor: '#ff0000' }),
    });
    expect(builder.getRelationshipColorModel().getValue()).toBe('#ff0000');
    builder.getRelationshipColorModel().setValue!('#00ff00');
    expect(spies.changeRelationshipColor).toHaveBeenCalledWith('#00ff00');
    expect(builder.getRelationshipColorModel()).toBe(builder.getRelationshipColorModel());
  });

  it('reads no relationship colour with nothing selected', () => {
    expect(setup().builder.getRelationshipColorModel().getValue()).toBeUndefined();
  });

  it('reads the relationship stroke style, dashed by default', () => {
    expect(
      setup({ relationship: fakeRelationship({ strokeStyle: 'dotted' }) })
        .builder.getRelationshipStrokeStyleModel()
        .getValue(),
    ).toBe('dotted');
    expect(setup().builder.getRelationshipStrokeStyleModel().getValue()).toBe('dashed');
  });

  it('changes the relationship stroke style', () => {
    const { builder, spies } = setup({ relationship: fakeRelationship({}) });
    builder.getRelationshipStrokeStyleModel().setValue!('solid' as never);
    expect(spies.changeRelationshipStrokeStyle).toHaveBeenCalledWith('solid');
    expect(builder.getRelationshipStrokeStyleModel()).toBe(
      builder.getRelationshipStrokeStyleModel(),
    );
  });

  it('reads the arrows, false when unset or nothing is selected', () => {
    const withArrows = setup({
      relationship: fakeRelationship({ endArrow: true, startArrow: true }),
    }).builder;
    expect(withArrows.getRelationshipEndArrowModel().getValue()).toBe(true);
    expect(withArrows.getRelationshipStartArrowModel().getValue()).toBe(true);

    const withoutArrows = setup({ relationship: fakeRelationship({}) }).builder;
    expect(withoutArrows.getRelationshipEndArrowModel().getValue()).toBe(false);
    expect(withoutArrows.getRelationshipStartArrowModel().getValue()).toBe(false);

    const empty = setup().builder;
    expect(empty.getRelationshipEndArrowModel().getValue()).toBe(false);
    expect(empty.getRelationshipStartArrowModel().getValue()).toBe(false);
  });

  it('changes each arrow through the designer', () => {
    const { builder, spies } = setup({ relationship: fakeRelationship({}) });
    builder.getRelationshipEndArrowModel().setValue!(true);
    builder.getRelationshipStartArrowModel().setValue!(false);
    expect(spies.changeRelationshipEndArrow).toHaveBeenCalledWith(true);
    expect(spies.changeRelationshipStartArrow).toHaveBeenCalledWith(false);
    expect(builder.getRelationshipEndArrowModel()).toBe(builder.getRelationshipEndArrowModel());
    expect(builder.getRelationshipStartArrowModel()).toBe(builder.getRelationshipStartArrowModel());
  });
});

describe('NodePropertyBuilder map-scoped models', () => {
  it('reads the map theme and changes it', () => {
    const { builder, spies } = setup({ theme: 'classic' });
    expect(builder.getThemeModel().getValue()).toBe('classic');
    builder.getThemeModel().setValue!('prism' as never);
    expect(spies.changeTheme).toHaveBeenCalledWith('prism');
    expect(builder.getThemeModel()).toBe(builder.getThemeModel());
  });

  it('reads the layout and changes it', () => {
    const { builder, spies } = setup({ layout: 'tree' });
    expect(builder.getLayoutModel().getValue()).toBe('tree');
    builder.getLayoutModel().setValue!('mindmap');
    expect(spies.changeLayout).toHaveBeenCalledWith('mindmap');
  });
});
