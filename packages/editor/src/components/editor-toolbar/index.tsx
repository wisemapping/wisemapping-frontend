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
import React, { ReactElement, useMemo } from 'react';
import { useIntl } from 'react-intl';
import Capability from '../../classes/action/capability';
import Model from '../../classes/model/editor';
import Toolbar from '../toolbar';
import { buildEditorPanelConfig } from './configBuilder';

type EditorToolbarProps = {
  model: Model | undefined;
  capability: Capability;
};

const EditorToolbar = ({ model, capability }: EditorToolbarProps): ReactElement => {
  const intl = useIntl();
  const isMapLoaded = model?.isMapLoadded() ?? false;

  const config = useMemo(() => {
    if (capability.isHidden('edition-toolbar') || !model || !isMapLoaded) {
      return undefined;
    }
    return buildEditorPanelConfig(model, intl);
  }, [capability, intl, isMapLoaded, model]);

  return <span>{config ? <Toolbar configurations={config} /> : <></>}</span>;
};
export default EditorToolbar;
