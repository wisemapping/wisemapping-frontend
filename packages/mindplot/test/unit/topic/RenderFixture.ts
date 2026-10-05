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
import type Designer from '../../../src/components/Designer';
import type Topic from '../../../src/components/Topic';

/**
 * A medium map (about 80 topics, up to 5 levels deep) that exercises what a redraw
 * touches: every shape, custom fonts and colours, icons, notes and links, an emoji,
 * a gallery icon, a collapsed branch, relationships and a floating topic.
 */
export const buildMediumMap = (theme?: string): string => {
  const lines: string[] = [];
  let nextId = 1;
  const shapes = ['rectangle', 'rounded rectangle', 'elipse', 'line', 'none'];

  const attrsFor = (id: number, depth: number): string => {
    const attrs: string[] = [];
    if (id % 7 === 0) attrs.push(`shape="${shapes[id % shapes.length]}"`);
    if (id % 11 === 0) attrs.push('fontStyle="Verdana;14;#334455;bold;italic"');
    if (id % 13 === 0) attrs.push('bgColor="#aaccee"');
    if (id % 17 === 0) attrs.push('brColor="#992233"');
    if (id % 19 === 0) attrs.push('connColor="#228833"');
    if (id % 23 === 0) attrs.push('connStyle="2"');
    if (id === 9) attrs.push('imageEmoji="🚀"');
    if (id === 15) attrs.push('imageGallery="star"');
    if (id === 4 && depth === 2) attrs.push('shrink="true"');
    return attrs.join(' ');
  };

  const featuresFor = (id: number, indent: string): string[] => {
    const result: string[] = [];
    if (id % 5 === 0) result.push(`${indent}  <icon id="face_smile"/>`);
    if (id % 8 === 0) result.push(`${indent}  <icon id="conn_disconnect"/>`);
    if (id % 6 === 0) result.push(`${indent}  <note><![CDATA[Note of ${id}]]></note>`);
    if (id % 9 === 0) result.push(`${indent}  <link url="https://example.com/${id}"/>`);
    return result;
  };

  const addTopic = (depth: number, order: number, x: number, y: number, indent: string) => {
    const id = nextId;
    nextId += 1;
    // Some topics have multi-line text, some a long single line.
    let text = `Topic ${id}`;
    if (id % 4 === 0) text = `Topic ${id}&#10;second line`;
    if (id % 10 === 3) text = `A much longer topic text for ${id}`;
    const fanout = [3, 2, id % 3 === 0 ? 2 : 0, 0][depth - 1] ?? 0;
    const attrs = attrsFor(id, depth);
    const features = featuresFor(id, indent);
    const open = `${indent}<topic id="${id}" text="${text}" position="${x},${y}" order="${order}" ${attrs}`;
    if (fanout === 0 && features.length === 0) {
      lines.push(`${open}/>`);
      return;
    }
    lines.push(`${open}>`);
    lines.push(...features);
    const side = x >= 0 ? 1 : -1;
    for (let i = 0; i < fanout; i++) {
      addTopic(depth + 1, i, x + side * 160, y + (i - fanout / 2) * 40, `${indent}  `);
    }
    lines.push(`${indent}</topic>`);
  };

  const themeAttr = theme ? ` theme="${theme}"` : '';
  lines.push(`<map name="medium" version="tango"${themeAttr}>`);
  lines.push('  <topic id="0" central="true" text="Central topic">');
  for (let i = 0; i < 6; i++) {
    addTopic(1, i, i % 2 === 0 ? 220 : -220, (i - 3) * 90, '    ');
  }
  lines.push('  </topic>');
  lines.push('  <topic id="500" text="Floating" position="600,500"/>');
  lines.push(
    '  <relationship id="900" srcTopicId="3" destTopicId="20" lineType="3" endArrow="true" startArrow="false"/>',
  );
  lines.push(
    '  <relationship id="901" srcTopicId="12" destTopicId="500" lineType="3" endArrow="true" startArrow="true"/>',
  );
  lines.push('</map>');
  return lines.join('\n');
};

/**
 * jsdom has no layout engine. Measure SVG text from its content and font size, so
 * that topic sizes, and so the layout, depend on what the topic renders.
 */
export const stubTextMeasurement = (): void => {
  const proto = (window as unknown as { SVGElement: { prototype: Record<string, unknown> } })
    .SVGElement.prototype;
  proto.getBBox = function getBBox(this: SVGElement) {
    if (this.tagName.toLowerCase() === 'text') {
      const fontSize = Number.parseFloat(this.getAttribute('font-size') || '10');
      const lines = Array.from(this.querySelectorAll('tspan')).map((t) => t.textContent || '');
      const longest = lines.reduce((max, l) => Math.max(max, [...l].length), 0);
      return {
        x: 0,
        y: 0,
        width: Math.round(longest * fontSize * 0.55 * 100) / 100,
        height: Math.round(Math.max(lines.length, 1) * fontSize * 1.2 * 100) / 100,
      };
    }
    return { x: 0, y: 0, width: 60, height: 14 };
  };
  proto.getComputedTextLength = () => 60;
};

const hash = (value: string): string => createHash('sha1').update(value).digest('hex').slice(0, 12);

const lineMarkup = (topic: Topic): string => {
  const line = topic.getOutgoingLine() as unknown as {
    _line?: { peer: { _native: Element } };
  } | null;
  return line?._line?.peer._native.outerHTML ?? '';
};

/**
 * What a topic renders: its position, its size, and a digest of its SVG group and
 * connection line. Any change of colour, font, text or element order changes the digest.
 */
export const renderSnapshot = (designer: Designer): Record<string, string> => {
  const result: Record<string, string> = {};
  const topics = designer
    .getModel()
    .getTopics()
    .slice()
    .sort((a, b) => a.getId() - b.getId());
  topics.forEach((topic) => {
    const pos = topic.getPosition();
    const size = topic.getSize();
    const group = topic.get2DElement().peer._native as Element;
    result[`topic ${topic.getId()}`] = [
      `pos=${pos.x},${pos.y}`,
      `size=${size.width}x${size.height}`,
      `order=${topic.getOrder()}`,
      `group=${hash(group.outerHTML)}`,
      `line=${hash(lineMarkup(topic))}`,
    ].join(' ');
  });
  const svg = designer.getModel().getCentralTopic().get2DElement().peer._native.ownerSVGElement;
  result.canvas = hash(svg ? svg.outerHTML : '');
  return result;
};
