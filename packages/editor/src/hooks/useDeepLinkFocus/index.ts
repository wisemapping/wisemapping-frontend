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
import { useEffect, useRef } from 'react';
import type Model from '../../classes/model/editor';

/**
 * Reads the node id the caller deep-linked to and resolves it from, in order:
 * the `searchParams` prop, `window.location.search`, then
 * `window.location.hash` (so `#node=12` works for hash-routed embeds).
 */
const resolveNodeId = (searchParams: URLSearchParams | null | undefined): number | undefined => {
  let nodeStr = searchParams?.get('node');

  if (!nodeStr && typeof window !== 'undefined') {
    nodeStr = new URLSearchParams(window.location.search).get('node');
    if (!nodeStr && window.location.hash) {
      nodeStr = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('node');
    }
  }

  if (!nodeStr) {
    return undefined;
  }

  const nodeId = Number.parseInt(nodeStr, 10);
  return Number.isFinite(nodeId) ? nodeId : undefined;
};

/**
 * Reveals and centres the node named by `?node=<id>` once the map is on screen.
 *
 * Getting this right means waiting for two separate things: the topic has to
 * exist in the designer's model, and its position has to be the one the layout
 * finally settled on -- centring on a stale position parks the viewport in the
 * wrong place. Both have real events behind them, so no timers are involved:
 *
 *  - `loadSuccess` (on the designer) is fired at the very end of
 *    `Designer.loadMap()`, by which point every topic has been built, made
 *    visible and connected -- so `findTopicById` can resolve the id.
 *  - `forceLayout` (on the designer's `LayoutEventBus`) is the only event that
 *    re-runs `LayoutManager.layout()`, i.e. the only thing that can move a
 *    topic. `EventBusDispatcher` subscribes to it when the designer is
 *    constructed and applies the recomputed positions synchronously, and
 *    listeners run in registration order, so by the time our listener is
 *    called the positions for that pass are already on the topics.
 *    `Designer.loadMap()` fires it as its last act before `loadSuccess`.
 *
 * Listening to both means a signal is always available no matter which arrives
 * first, and that a map still mid-build simply gets retried on the next layout
 * pass instead of on a guessed delay. The `lastFocusedNodeId` guard makes the
 * reveal happen exactly once, so later edits -- which also fire `forceLayout`
 * -- never yank the viewport back.
 */
export const useDeepLinkFocus = (
  model: Model | undefined,
  searchParams: URLSearchParams | null | undefined,
): void => {
  const lastFocusedNodeId = useRef<number | null>(null);

  useEffect(() => {
    if (!model) return undefined;

    const designer = model.getDesigner();
    if (!designer) return undefined;

    const nodeId = resolveNodeId(searchParams);
    if (nodeId === undefined) return undefined;
    if (lastFocusedNodeId.current === nodeId) return undefined;

    const revealIfReady = (): void => {
      if (lastFocusedNodeId.current === nodeId) return;

      const topic = designer.getModel().findTopicById(nodeId);
      if (!topic) {
        // Not built yet: the next layout pass will call us again.
        return;
      }

      lastFocusedNodeId.current = nodeId;
      designer.revealNode(topic, true);
    };

    designer.addEvent('loadSuccess', revealIfReady);
    const layoutEventBus = designer.getLayoutEventBus();
    layoutEventBus.addEvent('forceLayout', revealIfReady);

    // The map may already be loaded by the time this effect runs (both signals
    // would then be in the past).
    if (model.isMapLoadded()) {
      revealIfReady();
    }

    return () => {
      designer.removeEvent('loadSuccess', revealIfReady);
      layoutEventBus.removeEvent('forceLayout', revealIfReady);
    };
  }, [model, searchParams]);
};

export default useDeepLinkFocus;
