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

export const useDeepLinkFocus = (
  model: Model | undefined,
  searchParams: URLSearchParams | null | undefined,
): void => {
  const lastFocusedNodeId = useRef<number | null>(null);

  useEffect(() => {
    if (!model) return;
    const designer = model.getDesigner();
    if (!designer) return;

    // Extract node ID from searchParams, or window.location search / hash fallback
    let nodeStr = searchParams?.get('node');
    if (!nodeStr && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      nodeStr = urlParams.get('node');
      if (!nodeStr && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        nodeStr = hashParams.get('node');
      }
    }

    const nodeId = nodeStr ? Number.parseInt(nodeStr, 10) : NaN;
    if (!Number.isFinite(nodeId)) return;
    if (lastFocusedNodeId.current === nodeId) return;

    const focusNode = () => {
      if (lastFocusedNodeId.current === nodeId) return true;
      const topic = designer.getModel()?.findTopicById(nodeId);
      if (topic) {
        designer.revealNode(topic, true);
        designer?.goToNode?.(topic, true);
        lastFocusedNodeId.current = nodeId;
        // Settle layout in case animations / forceLayout shifted node position
        setTimeout(() => {
          const recheckTopic = designer.getModel()?.findTopicById(nodeId);
          if (recheckTopic) {
            designer?.goToNode?.(recheckTopic, true);
          }
        }, 150);
        return true;
      }
      return false;
    };

    const handler = (): void => {
      focusNode();
      // Try with retry if topics are still being populated
      setTimeout(() => {
        if (lastFocusedNodeId.current !== nodeId) {
          focusNode();
        }
      }, 100);
    };

    designer.addEvent('loadSuccess', handler);
    if (model.isMapLoadded?.()) {
      handler();
    }

    return () => {
      designer.removeEvent('loadSuccess', handler);
    };
  }, [model, searchParams]);
};
