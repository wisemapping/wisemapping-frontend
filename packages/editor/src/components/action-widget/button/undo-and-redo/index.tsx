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
import React, { ReactElement, useEffect, useState } from 'react';
import ActionConfig from '../../../../classes/action/action-config';
import Editor from '../../../../classes/model/editor';
import { ToolbarMenuItem } from '../../../toolbar';

// The designer's modelUpdate event (DesignerUndoManager.buildEvent).
type UndoRedoEvent = { undoSteps: number; redoSteps: number };

type UndoAndRedo = {
  configuration: ActionConfig;
  disabledCondition: (event: UndoRedoEvent) => boolean;
  model: Editor | undefined;
};

const UndoAndRedo = ({ configuration, disabledCondition, model }: UndoAndRedo): ReactElement => {
  const [disabled, setDisabled] = useState(true);
  const mapLoaded = model?.isMapLoadded() ?? false;

  // Subscribes again when the model changes, or once its map has loaded. The button starts
  // disabled for each subscription: the previous model's undo steps say nothing about this one ...
  useEffect(() => {
    if (!model || !mapLoaded) {
      return undefined;
    }
    const designer = model.getDesigner();
    if (!designer) {
      return undefined;
    }

    const handleUpdate = (event?: unknown) => {
      const isDisabled = disabledCondition(event as UndoRedoEvent);
      setDisabled(!isDisabled);
    };
    designer.addEvent('modelUpdate', handleUpdate);
    return () => {
      designer.removeEvent('modelUpdate', handleUpdate);
      setDisabled(true);
    };
  }, [model, mapLoaded]);

  return (
    <ToolbarMenuItem
      configuration={{
        ...configuration,
        disabled: () => disabled,
      }}
    />
  );
};
export default UndoAndRedo;
