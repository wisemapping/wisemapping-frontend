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
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelection, SelectionSnapshot } from '../../../src/hooks/useSelection';
import type Model from '../../../src/classes/model/editor';

type Listeners = Record<string, (() => void)[]>;

/** A Model stand-in whose selection and load state the test drives directly. */
const createModel = () => {
  const listeners: Listeners = {};
  const state = { topics: 0, relationships: 0, loaded: true };

  const model = {
    isMapLoadded: () => state.loaded,
    getDesignerModel: () => ({
      countSelectedTopics: () => state.topics,
      countSelectedRelationships: () => state.relationships,
      // The hook runs on every selection event: listing the selection there reads every topic
      // or relationship of the map, only to count them.
      filterSelectedTopics: () => {
        throw new Error('useSelection must count the selected topics, not list them');
      },
      filterSelectedRelationships: () => {
        throw new Error('useSelection must count the selected relationships, not list them');
      },
    }),
    getDesigner: () => ({
      addEvent: (event: string, callback: () => void) => {
        listeners[event] = [...(listeners[event] ?? []), callback];
      },
      removeEvent: (event: string, callback: () => void) => {
        listeners[event] = (listeners[event] ?? []).filter((c) => c !== callback);
      },
    }),
  } as unknown as Model;

  return {
    model,
    state,
    listeners,
    fire: (event: string) =>
      act(() => {
        (listeners[event] ?? []).forEach((c) => c());
      }),
  };
};

let renderCount = 0;

const Probe = ({ model }: { model: Model | undefined }) => {
  const selection: SelectionSnapshot = useSelection(model);
  renderCount += 1;
  return (
    <span data-testid="snapshot">
      {selection.topicCount}/{selection.relationshipCount}/{String(selection.isMapLoaded)}
    </span>
  );
};

const snapshot = (): string => screen.getByTestId('snapshot').textContent ?? '';

describe('useSelection', () => {
  beforeEach(() => {
    renderCount = 0;
  });

  it('reports an empty selection with no model', () => {
    render(<Probe model={undefined} />);
    expect(snapshot()).toBe('0/0/false');
  });

  it('reads the selection on mount', () => {
    const { model, state } = createModel();
    state.topics = 2;
    state.relationships = 1;

    render(<Probe model={model} />);

    expect(snapshot()).toBe('2/1/true');
  });

  it.each(['onfocus', 'onblur', 'modelUpdate', 'loadSuccess'])(
    'refreshes when the designer fires %s',
    (event) => {
      const { model, state, fire } = createModel();
      render(<Probe model={model} />);

      state.topics = 3;
      fire(event);

      expect(snapshot()).toBe('3/0/true');
    },
  );

  it('reports a multi-topic selection, not just the first topic', () => {
    const { model, state, fire } = createModel();
    render(<Probe model={model} />);

    state.topics = 5;
    fire('onfocus');

    expect(snapshot()).toBe('5/0/true');
  });

  it('reports an empty selection while the map has not loaded', () => {
    const { model, state } = createModel();
    state.loaded = false;
    state.topics = 4;

    render(<Probe model={model} />);

    expect(snapshot()).toBe('0/0/false');
  });

  it('picks the selection up once the map finishes loading', () => {
    const { model, state, fire } = createModel();
    state.loaded = false;
    render(<Probe model={model} />);
    expect(snapshot()).toBe('0/0/false');

    state.loaded = true;
    state.topics = 1;
    fire('loadSuccess');

    expect(snapshot()).toBe('1/0/true');
  });

  it('does not re-render when an event leaves the selection unchanged', () => {
    const { model, fire } = createModel();
    render(<Probe model={model} />);
    const before = renderCount;

    fire('modelUpdate');
    fire('modelUpdate');
    fire('onfocus');

    // A burst of designer events must not become a burst of renders -- this is
    // the property that lets selection-dependent controls drop their polling.
    expect(renderCount).toBe(before);
  });

  it('re-renders exactly once per observable change', () => {
    const { model, state, fire } = createModel();
    render(<Probe model={model} />);
    const before = renderCount;

    state.topics = 1;
    fire('onfocus');
    state.topics = 2;
    fire('onfocus');

    expect(renderCount).toBe(before + 2);
  });

  it('unsubscribes from every event on unmount', () => {
    const { model, listeners } = createModel();
    const { unmount } = render(<Probe model={model} />);

    expect(listeners['onfocus']).toHaveLength(1);

    unmount();

    ['onfocus', 'onblur', 'modelUpdate', 'loadSuccess'].forEach((event) => {
      expect(listeners[event]).toHaveLength(0);
    });
  });

  it('survives a model whose getDesigner throws', () => {
    const model = {
      isMapLoadded: () => false,
      getDesignerModel: () => undefined,
      getDesigner: () => {
        throw new Error('designer not built yet');
      },
    } as unknown as Model;

    expect(() => render(<Probe model={model} />)).not.toThrow();
    expect(snapshot()).toBe('0/0/false');
  });
});
