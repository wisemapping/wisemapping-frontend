/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
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

type UndoAndRedo = {
  configuration: ActionConfig;
  disabledCondition: (event) => boolean;
  model: Editor;
};

const UndoAndRedo = ({ configuration, disabledCondition, model }: UndoAndRedo): ReactElement => {
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (model?.isMapLoadded()) {
      const handleUpdate = (event) => {
        const isDisabled = disabledCondition(event);
        setDisabled(!isDisabled);

        return () => {
          model.getDesigner().removeEvent('modelUpdate', handleUpdate);
        };
      };

      if (model.getDesigner()) {
        model.getDesigner().addEvent('modelUpdate', handleUpdate);
      }
    }
  }, [model?.isMapLoadded()]);

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
