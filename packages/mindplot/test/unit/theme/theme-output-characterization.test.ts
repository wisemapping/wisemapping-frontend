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
 * Pins what every theme getter returns, for every theme, variant and kind of topic: the central
 * topic, main topics by order, sub topics, line and none shapes, floating topics and topics whose
 * colours were picked by the user (and their descendants). Refactoring the theme classes must
 * leave every value exactly as it was.
 */
import { describe, expect, it } from '@jest/globals';
import Theme, { ThemeVariant } from '../../../src/components/theme/Theme';
import ThemeFactory from '../../../src/components/theme/ThemeFactory';
import { THEME_TYPES } from '../../../src/components/model/ThemeType';
import Topic from '../../../src/components/Topic';
import { FakeModelProps } from './FakeTopic';

type Fixture = { name: string; topic: Topic };

/**
 * A Topic stand-in that, like Topic, asks the theme for its own shape and for the border and
 * connection colours its children inherit.
 */
const buildFixtures = (theme: Theme): Fixture[] => {
  const fake = (
    props: FakeModelProps,
    parent?: Topic,
    options: { central?: boolean; order?: number } = {},
  ): Topic => {
    const model = {
      getBorderColor: () => props.borderColor,
      getBackgroundColor: () => props.backgroundColor,
      getShapeType: () => props.shapeType,
      getConnectionStyle: () => props.connectionStyle,
      getConnectionColor: () => props.connectionColor,
      getFontFamily: () => props.fontFamily,
      getFontColor: () => props.fontColor,
      getFontWeight: () => props.fontWeight,
      getFontSize: () => props.fontSize,
      getFontStyle: () => props.fontStyle,
      getMindmap: () => ({
        getCanvasStyle: () =>
          props.canvasColor ? { backgroundColor: props.canvasColor } : undefined,
      }),
    };
    const topic = {
      getModel: () => model,
      getParent: () => parent,
      getOutgoingConnectedTopic: () => parent,
      isCentralTopic: () => Boolean(options.central),
      getOrder: () => options.order,
      getShapeType: () => theme.getShapeType(topic as unknown as Topic),
      getBorderColor: () => theme.getBorderColor(topic as unknown as Topic),
      getConnectionColor: () => theme.getConnectionColor(topic as unknown as Topic),
      getTextFontHeight: () => 12,
    };
    return topic as unknown as Topic;
  };

  const central = fake({}, undefined, { central: true });
  const result: Fixture[] = [{ name: 'central', topic: central }];

  // Main topics by order, past the length of every palette ...
  for (let order = 0; order <= 9; order++) {
    result.push({ name: `main#${order}`, topic: fake({}, central, { order }) });
  }
  result.push({ name: 'main#none', topic: fake({}, central) });

  // Sub topics, below two main topics ...
  const main1 = fake({}, central, { order: 1 });
  const main6 = fake({}, central, { order: 6 });
  for (let order = 0; order <= 3; order++) {
    result.push({ name: `sub#${order}<main#1`, topic: fake({}, main1, { order }) });
    result.push({ name: `sub#${order}<main#6`, topic: fake({}, main6, { order }) });
  }
  const sub = fake({}, main1, { order: 2 });
  result.push({ name: 'leaf<sub<main#1', topic: fake({}, sub, { order: 0 }) });

  // Line and none shapes, and the topics below them ...
  (['line', 'none'] as const).forEach((shapeType) => {
    const main = fake({ shapeType }, central, { order: 2 });
    result.push({ name: `main:${shapeType}`, topic: main });
    result.push({ name: `sub<main:${shapeType}`, topic: fake({}, main, { order: 1 }) });
    result.push({ name: `sub:${shapeType}`, topic: fake({ shapeType }, main1, { order: 3 }) });
  });

  // Floating topics ...
  result.push({ name: 'floating', topic: fake({}) });
  result.push({ name: 'floating#3', topic: fake({}, undefined, { order: 3 }) });
  result.push({ name: 'floating:line', topic: fake({ shapeType: 'line' }, undefined) });

  // Colours, fonts and shapes picked by the user, and what the descendants inherit ...
  const picked = fake(
    {
      borderColor: '#654321',
      backgroundColor: '#abcdef',
      fontColor: '#112233',
      connectionColor: '#445566',
      fontFamily: 'Georgia',
      fontSize: 17,
      fontStyle: 'italic',
      fontWeight: 'bold',
      shapeType: 'elipse',
    },
    central,
    { order: 3 },
  );
  result.push({ name: 'main:picked', topic: picked });
  const pickedChild = fake({}, picked, { order: 1 });
  result.push({ name: 'sub<main:picked', topic: pickedChild });
  result.push({ name: 'leaf<sub<main:picked', topic: fake({}, pickedChild, { order: 0 }) });
  result.push({
    name: 'main:border-only',
    topic: fake({ borderColor: '#336699' }, central, { order: 4 }),
  });
  result.push({
    name: 'main:connection-only',
    topic: fake({ connectionColor: '#993366' }, central, { order: 4 }),
  });
  const connectionPicked = fake({ connectionColor: '#993366' }, central, { order: 5 });
  result.push({ name: 'sub<main:connection-only', topic: fake({}, connectionPicked) });
  result.push({
    name: 'main:blank-background',
    topic: fake({ backgroundColor: '   ' }, central, { order: 2 }),
  });
  result.push({
    name: 'central:picked',
    topic: fake({ backgroundColor: '#fedcba', borderColor: '#010203' }, undefined, {
      central: true,
    }),
  });
  result.push({
    name: 'main:dark-canvas',
    topic: fake({ canvasColor: '#101010' }, central, { order: 1 }),
  });

  return result;
};

const describeTopic = (theme: Theme, topic: Topic): string => {
  const values: Array<[string, () => unknown]> = [
    ['text', () => theme.getText(topic)],
    ['shape', () => theme.getShapeType(topic)],
    ['line', () => theme.getConnectionType(topic)],
    ['font', () => theme.getFontFamily(topic)],
    ['size', () => theme.getFontSize(topic)],
    ['style', () => theme.getFontStyle(topic)],
    ['weight', () => theme.getFontWeight(topic)],
    ['fontColor', () => theme.getFontColor(topic)],
    ['bg', () => theme.getBackgroundColor(topic)],
    ['border', () => theme.getBorderColor(topic)],
    ['connection', () => theme.getConnectionColor(topic)],
    ['outerBg', () => theme.getOuterBackgroundColor(topic, false)],
    ['outerBgFocus', () => theme.getOuterBackgroundColor(topic, true)],
    ['outerBorder', () => theme.getOuterBorderColor(topic)],
    ['padding', () => theme.getInnerPadding(topic)],
    ['emoji', () => theme.getEmojiSpacing(topic)],
  ];
  return values
    .map(([key, read]) => {
      let value: unknown;
      try {
        value = read();
      } catch (error) {
        value = `throws ${(error as Error).message}`;
      }
      return `${key}=${JSON.stringify(value)}`;
    })
    .join(' ');
};

const variants: ThemeVariant[] = ['light', 'dark'];

describe.each(THEME_TYPES.map((id) => [id]))('%s theme output', (id) => {
  it.each(variants)('%s variant', (variant) => {
    const theme = ThemeFactory.createById(id, variant);
    const record: Record<string, string> = {
      canvas: [
        theme.getCanvasBackgroundColor(),
        theme.getCanvasGridColor(),
        theme.getCanvasOpacity(),
        theme.getCanvasShowGrid(),
        theme.getCanvasGridPattern(),
      ]
        .map((value) => JSON.stringify(value))
        .join(' '),
    };
    buildFixtures(theme).forEach(({ name, topic }) => {
      record[name] = describeTopic(theme, topic);
    });
    expect(record).toMatchSnapshot();
  });
});
