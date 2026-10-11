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
import { useMemo, useSyncExternalStore } from 'react';
import type Model from '../../classes/model/editor';

/**
 * What the chrome needs to know about the current selection.
 *
 * Counts rather than the topics themselves: every consumer so far only asks
 * "is anything selected?", and counts compare cheaply, so a selection that
 * changes from one topic to another does not force a re-render of controls that
 * cannot tell the difference.
 */
export type SelectionSnapshot = {
  topicCount: number;
  relationshipCount: number;
  isMapLoaded: boolean;
};

export const EMPTY_SELECTION: SelectionSnapshot = {
  topicCount: 0,
  relationshipCount: 0,
  isMapLoaded: false,
};

const read = (model: Model | undefined): SelectionSnapshot => {
  if (!model) {
    return EMPTY_SELECTION;
  }

  // Reading the selection means walking model -> designer -> designer model,
  // any link of which can be absent while the editor is still coming up.
  // Reporting "nothing selected" is always a safe answer; throwing from here
  // would take down whichever toolbar asked.
  try {
    const isMapLoaded = model.isMapLoadded();
    if (!isMapLoaded) {
      return EMPTY_SELECTION;
    }

    const designerModel = model.getDesignerModel();
    return {
      // Counted, not listed: the designer model keeps the selection, so counting needs no scan.
      topicCount: designerModel?.countSelectedTopics() ?? 0,
      relationshipCount: designerModel?.countSelectedRelationships() ?? 0,
      isMapLoaded,
    };
  } catch {
    return EMPTY_SELECTION;
  }
};

const isSame = (a: SelectionSnapshot, b: SelectionSnapshot): boolean =>
  a.topicCount === b.topicCount &&
  a.relationshipCount === b.relationshipCount &&
  a.isMapLoaded === b.isMapLoaded;

const SELECTION_EVENTS = ['onfocus', 'onblur', 'modelUpdate', 'loadSuccess'] as const;

type SelectionStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => SelectionSnapshot;
};

const createSelectionStore = (model: Model | undefined): SelectionStore => {
  // The last snapshot handed out: getSnapshot returns the same object while nothing observable
  // changed, so a burst of designer events does not become a burst of renders.
  let cached = read(model);
  return {
    subscribe: (onChange) => {
      const designer = (() => {
        try {
          return model?.getDesigner();
        } catch {
          return undefined;
        }
      })();
      if (!designer) {
        return () => undefined;
      }
      SELECTION_EVENTS.forEach((event) => designer.addEvent(event, onChange));
      return () => {
        SELECTION_EVENTS.forEach((event) => designer.removeEvent(event, onChange));
      };
    },
    getSnapshot: () => {
      const next = read(model);
      if (!isSame(cached, next)) {
        cached = next;
      }
      return cached;
    },
  };
};

/**
 * Subscribes once to the designer's selection events and returns the selection
 * as React state.
 *
 * Replaces the pattern where every selection-dependent control carried a
 * `disabled: () => model.getDesignerModel()!.filterSelectedTopics().length === 0`
 * thunk evaluated during render. Nothing in the toolbars subscribed to
 * selection, so those thunks were only correct when something unrelated
 * happened to re-render the tree -- in practice a canvas-event-driven
 * `setState` that fired on every mousemove of a drag. Controls can now derive
 * their state from a value that actually changes when the selection does.
 *
 * `loadSuccess` is included because `isMapLoadded()` is mutable designer state:
 * without it, a snapshot taken before the map loaded would never be refreshed.
 */
export const useSelection = (model: Model | undefined): SelectionSnapshot => {
  const store = useMemo(() => createSelectionStore(model), [model]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
};

export default useSelection;
