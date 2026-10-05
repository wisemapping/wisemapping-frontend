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
 * Builds medium-sized Tango maps, the same on every run, for the map-load tests: they compare
 * the layout of a whole map and count the work a load does.
 */
import Designer from '../../../src/components/Designer';

/* eslint-disable no-bitwise -- mulberry32 is integer bit mixing */
/** A small seeded generator (mulberry32), so the generated map never changes. */
const random = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
/* eslint-enable no-bitwise */

const WORDS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota'];

type GeneratedTopic = {
  id: number;
  text: string;
  children: GeneratedTopic[];
  shrink: boolean;
  // Some topics are saved without an order: the layout gives them the next one.
  withOrder: boolean;
};

export type MediumMapOptions = {
  topics?: number;
  floating?: number;
  relationships?: number;
  layout?: 'mindmap' | 'tree';
  seed?: number;
};

/**
 * A map with `topics` topics: a central topic with branches of mixed depth and width, a few
 * floating topics (with children of their own), collapsed branches, topics saved without an
 * order and texts of different lengths, so topic sizes differ.
 */
export const buildMediumMap = ({
  topics = 500,
  floating = 3,
  relationships = 12,
  layout = 'mindmap',
  seed = 7,
}: MediumMapOptions = {}): string => {
  const next = random(seed);
  const text = (id: number): string => {
    const words = 1 + Math.floor(next() * 4);
    const parts = [`T${id}`];
    for (let i = 0; i < words; i++) {
      parts.push(WORDS[Math.floor(next() * WORDS.length)]);
    }
    return parts.join(' ');
  };

  const all: GeneratedTopic[] = [];
  const create = (id: number): GeneratedTopic => {
    const topic = {
      id,
      text: text(id),
      children: [],
      shrink: false,
      withOrder: next() > 0.1,
    };
    all.push(topic);
    return topic;
  };

  const central = create(0);
  const roots: GeneratedTopic[] = [central];
  for (let i = 0; i < floating; i++) {
    roots.push(create(i + 1));
  }

  // Attach every other topic to an earlier one, favouring recent ones: deep and wide branches.
  for (let id = roots.length; id < topics; id++) {
    const topic = create(id);
    const candidates = all.length - 1;
    const pick =
      next() < 0.3
        ? Math.floor(next() * Math.min(candidates, 12))
        : candidates - 1 - Math.floor(next() * Math.min(candidates, 25));
    const parent = all[Math.max(0, pick)];
    // Floating topics get a few children only.
    if (parent !== central && roots.includes(parent) && parent.children.length >= 3) {
      central.children.push(topic);
    } else {
      parent.children.push(topic);
    }
  }

  all.forEach((topic) => {
    if (topic !== central && topic.children.length > 0 && next() < 0.08) {
      topic.shrink = true;
    }
  });

  const xml: string[] = [`<map name="medium" version="tango" layout="${layout}">`];
  const write = (topic: GeneratedTopic, depth: number, order: number, side: number): void => {
    const indent = '  '.repeat(depth + 1);
    const attributes = [`id="${topic.id}"`, `text="${topic.text}"`];
    if (topic === central) {
      attributes.push('central="true"');
    } else if (depth === 0) {
      // A floating topic.
      attributes.push(`position="${600 + topic.id * 150},${-400 + topic.id * 300}"`);
    } else {
      attributes.push(`position="${side * 150 * depth},${order * 30}"`);
      if (topic.withOrder) {
        attributes.push(`order="${order}"`);
      }
    }
    if (topic.shrink) {
      attributes.push('shrink="true"');
    }
    if (topic.children.length === 0) {
      xml.push(`${indent}<topic ${attributes.join(' ')}/>`);
      return;
    }
    xml.push(`${indent}<topic ${attributes.join(' ')}>`);
    topic.children.forEach((child, index) => {
      const alternatingSide = index % 2 === 0 ? 1 : -1;
      const childSide = topic === central ? alternatingSide : side;
      write(child, depth + 1, index, childSide);
    });
    xml.push(`${indent}</topic>`);
  };
  roots.forEach((root) => write(root, 0, 0, 1));

  for (let i = 0; i < relationships; i++) {
    const src = 1 + Math.floor(next() * (topics - 1));
    let dest = 1 + Math.floor(next() * (topics - 1));
    if (dest === src) {
      dest = (dest % (topics - 1)) + 1;
    }
    xml.push(
      `  <relationship id="${10000 + i}" srcTopicId="${src}" destTopicId="${dest}" lineType="3" endArrow="true" startArrow="false"/>`,
    );
  }
  xml.push('</map>');
  return xml.join('\n');
};

/**
 * jsdom does not lay out SVG text: give every element a box that grows with its text, so topics
 * get different sizes and the layout has real work to do. Returns a function restoring the
 * previous getBBox.
 */
export const useTextSizedBoxes = (): (() => void) => {
  type BBoxPrototype = { getBBox: () => { x: number; y: number; width: number; height: number } };
  const { prototype } = (window as unknown as { SVGElement: { prototype: BBoxPrototype } })
    .SVGElement;
  const previous = prototype.getBBox;
  prototype.getBBox = function getBBox(this: Element) {
    const { length } = this.textContent ?? '';
    return { x: 0, y: 0, width: 20 + length * 6, height: 14 + (length % 3) * 4 };
  };
  return () => {
    prototype.getBBox = previous;
  };
};

/** Every topic's id, position and order, sorted by id: what the layout decided. */
export const layoutOf = (designer: Designer): string[] =>
  designer
    .getModel()
    .getTopics()
    .slice()
    .sort((a, b) => a.getId() - b.getId())
    .map((topic) => {
      const { x, y } = topic.getPosition();
      return `${topic.getId()}: ${x},${y} order=${topic.getOrder()}`;
    });
