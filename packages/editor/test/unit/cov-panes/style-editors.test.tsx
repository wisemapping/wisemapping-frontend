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

/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { LineType, StrokeStyle } from '@wisemapping/mindplot';
import type { TopicShapeType } from '@wisemapping/mindplot';
import RelationshipStyleEditor from '../../../src/components/action-widget/pane/relationship-style-editor';
import TopicStyleEditor from '../../../src/components/action-widget/pane/topic-style-editor';
import IconCollection from '../../../src/components/action-widget/pane/topic-style-editor/IconCollection';
import { property, readOnlyProperty, renderPane } from './helpers';

const relationshipModels = () => ({
  strokeStyleModel: property<StrokeStyle>(StrokeStyle.DASHED),
  startArrowModel: property<boolean>(false),
  endArrowModel: property<boolean>(true),
  colorModel: property<string | undefined>(undefined),
});

describe('RelationshipStyleEditor', () => {
  it.each([
    ['Solid Line', StrokeStyle.SOLID],
    ['Dashed Line', StrokeStyle.DASHED],
    ['Dotted Line', StrokeStyle.DOTTED],
  ])('sets the %s stroke', (label, style) => {
    const m = relationshipModels();
    renderPane(<RelationshipStyleEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(m.strokeStyleModel.setValue).toHaveBeenCalledWith(style);
  });

  it('flips each arrow from its current state', () => {
    const m = relationshipModels();
    renderPane(<RelationshipStyleEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Arrow' }));
    fireEvent.click(screen.getByRole('button', { name: 'End Arrow' }));

    expect(m.startArrowModel.setValue).toHaveBeenCalledWith(true);
    expect(m.endArrowModel.setValue).toHaveBeenCalledWith(false);
  });

  it('sets and clears the relationship colour', () => {
    const m = relationshipModels();
    renderPane(<RelationshipStyleEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: '#ff0000' }));
    fireEvent.click(screen.getByRole('button', { name: 'Default color' }));

    expect(m.colorModel.setValue.mock.calls).toEqual([['#ff0000'], [undefined]]);
  });

  it('closes from the close button', () => {
    const closeModal = jest.fn();
    renderPane(<RelationshipStyleEditor closeModal={closeModal} {...relationshipModels()} />);

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks on models that cannot be changed', () => {
    renderPane(
      <RelationshipStyleEditor
        closeModal={jest.fn()}
        strokeStyleModel={readOnlyProperty(StrokeStyle.SOLID)}
        startArrowModel={readOnlyProperty(true)}
        endArrowModel={readOnlyProperty(false)}
        colorModel={readOnlyProperty<string | undefined>('#000000')}
      />,
    );

    for (const name of ['Solid Line', 'Dashed Line', 'Dotted Line', 'Start Arrow', 'End Arrow']) {
      fireEvent.click(screen.getByRole('button', { name }));
    }
    expect(screen.getByRole('button', { name: 'Solid Line' })).toBeTruthy();
  });
});

type StyleModels = {
  shapeModel: ReturnType<typeof property<TopicShapeType | undefined>>;
  fillColorModel: ReturnType<typeof property<string | undefined>>;
  borderColorModel: ReturnType<typeof property<string | undefined>>;
  borderStyleModel: ReturnType<typeof property<StrokeStyle | undefined>>;
  connectionStyleModel: ReturnType<typeof property<LineType | undefined>>;
  connectionColorModel: ReturnType<typeof property<string | undefined>>;
};

const styleModels = (overrides: Partial<StyleModels> = {}): StyleModels => ({
  shapeModel: property<TopicShapeType | undefined>(undefined),
  fillColorModel: property<string | undefined>(undefined),
  borderColorModel: property<string | undefined>(undefined),
  borderStyleModel: property<StrokeStyle | undefined>(undefined),
  connectionStyleModel: property<LineType | undefined>(undefined),
  connectionColorModel: property<string | undefined>(undefined),
  ...overrides,
});

describe('TopicStyleEditor', () => {
  it.each([
    ['Default shape', undefined],
    ['Line shape', 'line'],
    ['Rectangle shape', 'rectangle'],
    ['Rounded shape', 'rounded rectangle'],
    ['Ellipse shape', 'elipse'],
    ['None shape', 'none'],
  ])('sets the shape from "%s"', (label, shape) => {
    const m = styleModels({ shapeModel: property<TopicShapeType | undefined>('rectangle') });
    renderPane(<TopicStyleEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(m.shapeModel.setValue).toHaveBeenCalledWith(shape);
  });

  it.each([
    [undefined, false],
    ['line', false],
    ['none', false],
    ['rectangle', true],
  ])('with shape %s, offers a background colour: %s', (shape, offered) => {
    const m = styleModels({
      shapeModel: property<TopicShapeType | undefined>(shape as TopicShapeType | undefined),
    });
    renderPane(<TopicStyleEditor closeModal={jest.fn()} {...m} />);

    expect(screen.queryByText('Background Color') !== null).toBe(offered);
    if (offered) {
      fireEvent.click(screen.getByRole('button', { name: '#ffff00' }));
      expect(m.fillColorModel.setValue).toHaveBeenCalledWith('#ffff00');
    }
  });

  it('sets the border style and, once one is set, its colour', () => {
    const m = styleModels({ borderStyleModel: property<StrokeStyle | undefined>(undefined) });
    const { unmount } = renderPane(<TopicStyleEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Border' }));
    expect(screen.queryByText('Border Color')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Default Line' }));
    fireEvent.click(screen.getByRole('button', { name: 'Solid Line' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dashed Line' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dotted Line' }));
    expect(m.borderStyleModel.setValue.mock.calls).toEqual([
      [undefined],
      [StrokeStyle.SOLID],
      [StrokeStyle.DASHED],
      [StrokeStyle.DOTTED],
    ]);
    unmount();

    const dashed = styleModels({
      borderStyleModel: property<StrokeStyle | undefined>(StrokeStyle.DASHED),
    });
    renderPane(<TopicStyleEditor closeModal={jest.fn()} {...dashed} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Border' }));
    expect(screen.getByText('Border Color')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '#0000ff' }));
    expect(dashed.borderColorModel.setValue).toHaveBeenCalledWith('#0000ff');
  });

  it('sets the connector style and, once one is set, its colour', () => {
    const m = styleModels();
    const { unmount } = renderPane(<TopicStyleEditor closeModal={jest.fn()} {...m} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Connector' }));
    expect(screen.queryByText('Connection Style')).toBeNull();

    const expected: [string, LineType | undefined][] = [
      ['Default', undefined],
      ['Arc', LineType.ARC],
      ['Heartbeat', LineType.HEARTBEAT],
      ['Neuron', LineType.NEURON],
      ['Curved Polyline', LineType.POLYLINE_CURVED],
      ['Thick Curved', LineType.THICK_CURVED],
      ['Thin Curved', LineType.THIN_CURVED],
      ['Simple Polyline', LineType.POLYLINE_STRAIGHT],
    ];
    for (const [label] of expected) {
      fireEvent.click(screen.getByRole('button', { name: label }));
    }
    expect(m.connectionStyleModel.setValue.mock.calls).toEqual(expected.map(([, v]) => [v]));
    unmount();

    // THIN_CURVED is 0: a falsy line type still counts as "set".
    const thin = styleModels({
      connectionStyleModel: property<LineType | undefined>(LineType.THIN_CURVED),
    });
    renderPane(<TopicStyleEditor closeModal={jest.fn()} {...thin} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Connector' }));
    expect(screen.getByText('Connection Style')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '#38761d' }));
    expect(thin.connectionColorModel.setValue).toHaveBeenCalledWith('#38761d');
  });

  it('shows only the active tab panel', () => {
    renderPane(<TopicStyleEditor closeModal={jest.fn()} {...styleModels()} />);

    expect(screen.getByText('Shape Type')).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: 'Connector' }));
    expect(screen.queryByText('Shape Type')).toBeNull();
    expect(screen.getByText('Connector Style')).toBeTruthy();
  });

  it('closes from the close button', () => {
    const closeModal = jest.fn();
    renderPane(<TopicStyleEditor closeModal={closeModal} {...styleModels()} />);

    fireEvent.click(screen.getByTestId('CloseIcon').closest('button') as HTMLElement);

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('ignores picks on models that cannot be changed', () => {
    renderPane(
      <TopicStyleEditor
        closeModal={jest.fn()}
        shapeModel={readOnlyProperty<TopicShapeType | undefined>('line')}
        fillColorModel={readOnlyProperty<string | undefined>(undefined)}
        borderColorModel={readOnlyProperty<string | undefined>(undefined)}
        borderStyleModel={readOnlyProperty<StrokeStyle | undefined>(undefined)}
        connectionStyleModel={readOnlyProperty<LineType | undefined>(undefined)}
        connectionColorModel={readOnlyProperty<string | undefined>(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rectangle shape' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Border' }));
    fireEvent.click(screen.getByRole('button', { name: 'Solid Line' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Connector' }));
    fireEvent.click(screen.getByRole('button', { name: 'Arc' }));

    expect(screen.getByRole('button', { name: 'Arc' })).toBeTruthy();
  });
});

describe('IconCollection', () => {
  it('labels buttons from strings, custom aria-labels and elements without a message', () => {
    const onSelect = jest.fn();
    renderPane(
      <IconCollection
        styles={[
          { type: StrokeStyle.SOLID, icon: <span>s</span>, label: 'Plain label' },
          {
            type: StrokeStyle.DASHED,
            icon: <span>d</span>,
            label: 'ignored',
            ariaLabel: 'Custom label',
          },
          { type: StrokeStyle.DOTTED, icon: <span>o</span>, label: <span>no message</span> },
        ]}
        selectedValue={StrokeStyle.DASHED}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Plain label' }));
    fireEvent.click(screen.getByRole('button', { name: 'Custom label' }));
    const unlabeled = screen.getByText('o').closest('button') as HTMLElement;
    expect(unlabeled.getAttribute('aria-label')).toBe('');
    fireEvent.click(unlabeled);

    expect(onSelect.mock.calls).toEqual([
      [StrokeStyle.SOLID],
      [StrokeStyle.DASHED],
      [StrokeStyle.DOTTED],
    ]);
  });

  it('renders the selected style in dark mode too', () => {
    renderPane(
      <IconCollection
        styles={[{ type: undefined, icon: <span>x</span>, label: 'Default' }]}
        selectedValue={undefined}
        onSelect={jest.fn()}
        ariaLabelSuffix=" style"
      />,
      'dark',
    );

    expect(screen.getByRole('button', { name: 'Default style' })).toBeTruthy();
  });
});
