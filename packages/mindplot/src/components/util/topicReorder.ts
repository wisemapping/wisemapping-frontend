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
import type Topic from '../Topic';

/**
 * Structural moves available from the keyboard, in outline terms.
 *
 * 'up'/'down' reorder a topic among its siblings; 'outdent'/'indent' change
 * which topic it hangs off. Deliberately not spatial: the layout manager owns
 * position, so a pixel nudge would simply be laid out away.
 */
export type TopicMove = 'up' | 'down' | 'outdent' | 'indent';

/** Where a move wants the topic to end up, in terms the layout can act on. */
export type ReorderTarget =
  { kind: 'reorder'; parent: Topic; order: number } | { kind: 'reparent'; parent: Topic };

/**
 * Siblings of a topic in layout order, the topic itself included.
 *
 * `getChildren()` is not guaranteed to be ordered, and `getOrder()` is the
 * value the layout actually sorts by, so this sorts explicitly rather than
 * trusting the array. Children whose order is undefined sort last and keep
 * their relative sequence, which keeps the result stable for a branch that is
 * mid-construction.
 */
export const orderedSiblings = (topic: Topic): Topic[] => {
  const parent = topic.getParent();
  if (!parent) {
    return [topic];
  }
  return [...parent.getChildren()].sort((a, b) => {
    const left = a.getOrder();
    const right = b.getOrder();
    if (left === undefined && right === undefined) return 0;
    if (left === undefined) return 1;
    if (right === undefined) return -1;
    return left - right;
  });
};

/**
 * The central topic in the mindmap layout sorts its children with the balanced
 * sorter, whose order parity is the side: even orders on the right, odd on the
 * left. Elsewhere orders are contiguous and side-free.
 */
const isBalancedParent = (parent: Topic): boolean =>
  parent.isCentralTopic() && parent.getModel().getMindmap().getLayout() === 'mindmap';

/**
 * The siblings a topic moves among, in layout order and including the topic:
 * all of them, or only those on its own side when the parent is balanced, so
 * that moving up or down never flips a topic to the other side of the map.
 */
const moveSiblings = (topic: Topic, parent: Topic): Topic[] => {
  const siblings = orderedSiblings(topic);
  if (!isBalancedParent(parent)) {
    return siblings;
  }
  const side = (topic.getOrder() ?? 0) % 2;
  return siblings.filter((sibling) => (sibling.getOrder() ?? 0) % 2 === side);
};

/**
 * Resolves a requested move into a concrete target, or null when the move is
 * not available -- the topic is already first among its siblings, say, or is
 * the central topic, which has nowhere to go.
 *
 * Pure, and with only a type-only import of Topic, so the whole decision table
 * is unit-testable against stubs rather than needing a live Designer.
 */
export const resolveTopicMove = (topic: Topic, move: TopicMove): ReorderTarget | null => {
  // The central topic is the root: it has no siblings to reorder among and no
  // parent to detach from.
  if (topic.isCentralTopic()) {
    return null;
  }

  const parent = topic.getParent();
  if (!parent) {
    return null;
  }

  switch (move) {
    case 'up':
    case 'down': {
      const siblings = moveSiblings(topic, parent);
      const index = siblings.indexOf(topic);
      const targetIndex = move === 'up' ? index - 1 : index + 1;
      const neighbour = siblings[targetIndex];
      // Already at the end it is being asked to move towards.
      if (index < 0 || !neighbour) {
        return null;
      }
      // Take the neighbour's order: the topic is detached and re-inserted with it,
      // which lands it just past the neighbour. Orders are not always the index
      // (the balanced sorter steps by two per side).
      const order = neighbour.getOrder() ?? targetIndex;
      return { kind: 'reorder', parent, order };
    }

    case 'outdent': {
      // Re-attach to the grandparent, becoming a sibling of the current parent.
      const grandparent = parent.getParent();
      if (!grandparent) {
        // The parent is the central topic, so there is no level to rise to --
        // detaching here would orphan the topic rather than promote it.
        return null;
      }
      return { kind: 'reparent', parent: grandparent };
    }

    case 'indent': {
      // Become a child of the sibling immediately above, the outliner meaning
      // of indent. The first child has no preceding sibling to attach to.
      const siblings = moveSiblings(topic, parent);
      // Undefined for the first child, and for a topic not among the siblings (index -1).
      const above = siblings[siblings.indexOf(topic) - 1];
      if (!above) {
        return null;
      }
      return { kind: 'reparent', parent: above };
    }

    default:
      return null;
  }
};

export default resolveTopicMove;
