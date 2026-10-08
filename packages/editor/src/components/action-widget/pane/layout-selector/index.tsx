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
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import React, { ReactElement, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SvgIcon from '@mui/material/SvgIcon';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { LayoutType } from '@wisemapping/mindplot';
import NodeProperty from '../../../../classes/model/node-property';
import Model from '../../../../classes/model/editor';
import { trackEditorInteraction } from '../../../../utils/analytics';
import {
  OptionCard,
  OptionCardContent,
  OptionChooserContent,
  OptionChooserDescription,
  OptionChooserDialog,
  OptionDescription,
  OptionIcon,
  OptionList,
  OptionRow,
  OptionText,
  OptionTitle,
} from '../shared/StyledOptionChooser';

// Custom SVG icon for mindmap layout
const MindmapIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 48 48">
    {/* Central node */}
    <rect x="18" y="20" width="12" height="8" rx="2" fill="currentColor" />

    {/* Left branch */}
    <path d="M 18 24 L 8 24" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="2" y="20" width="6" height="8" rx="1.5" fill="currentColor" />
    <path d="M 18 24 L 8 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="2" y="10" width="6" height="8" rx="1.5" fill="currentColor" />
    <path d="M 18 24 L 8 34" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="2" y="30" width="6" height="8" rx="1.5" fill="currentColor" />

    {/* Right branch */}
    <path d="M 30 24 L 40 24" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="40" y="20" width="6" height="8" rx="1.5" fill="currentColor" />
    <path d="M 30 24 L 40 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="40" y="10" width="6" height="8" rx="1.5" fill="currentColor" />
    <path d="M 30 24 L 40 34" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <rect x="40" y="30" width="6" height="8" rx="1.5" fill="currentColor" />
  </SvgIcon>
);

type LayoutSelectorProps = {
  closeModal: () => void;
  layoutModel: NodeProperty<LayoutType>;
  model: Model;
};

const LayoutSelector = ({ closeModal, layoutModel, model }: LayoutSelectorProps): ReactElement => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>(
    layoutModel.getValue() || 'mindmap',
  );
  const intl = useIntl();

  const layouts = [
    {
      id: 'mindmap' as LayoutType,
      name: intl.formatMessage({ id: 'layout.mindmap.name', defaultMessage: 'Mindmap' }),
      description: intl.formatMessage({
        id: 'layout.mindmap.description',
        defaultMessage:
          'Horizontal layout with balanced branches on both sides. Best for traditional mind mapping and brainstorming.',
      }),
      icon: <MindmapIcon />,
    },
    {
      id: 'tree' as LayoutType,
      name: intl.formatMessage({ id: 'layout.tree.name', defaultMessage: 'Tree' }),
      description: intl.formatMessage({
        id: 'layout.tree.description',
        defaultMessage:
          'Vertical hierarchy flowing top-to-bottom. Great for organizational charts and hierarchical structures.',
      }),
      icon: <AccountTreeIcon />,
    },
  ];

  const handleLayoutSelect = (layout: LayoutType) => {
    setSelectedLayout(layout);
  };

  const handleAccept = async () => {
    const setValue = layoutModel.setValue;
    if (setValue) {
      const previousLayout = layoutModel.getValue();
      setValue(selectedLayout);

      // Trigger a full page refresh if the layout changed
      if (previousLayout !== selectedLayout) {
        // Track layout change
        trackEditorInteraction('layout_change', selectedLayout);

        // Force save with the new layout before refreshing
        // Use saveHistory=true to bypass saveRequired check and ensure save happens
        await model.save(true);
        window.location.reload();
      }
    }
    closeModal();
  };

  const handleCancel = () => {
    // Reset to original layout
    setSelectedLayout(layoutModel.getValue());
    closeModal();
  };

  return (
    <OptionChooserDialog open={true} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FormattedMessage id="layout-selector.title" defaultMessage="Choose Layout" />
      </DialogTitle>
      <OptionChooserContent dividers>
        <OptionChooserDescription variant="body2">
          <FormattedMessage id="layout-selector.description" defaultMessage="Choose layout style" />
        </OptionChooserDescription>
        <OptionList>
          {layouts.map((layoutOption) => (
            <OptionCard
              key={layoutOption.id}
              selected={selectedLayout === layoutOption.id}
              onClick={() => handleLayoutSelect(layoutOption.id)}
            >
              <OptionCardContent>
                <OptionRow>
                  <OptionIcon>{layoutOption.icon}</OptionIcon>
                  <OptionText>
                    <OptionTitle variant="subtitle2">{layoutOption.name}</OptionTitle>
                    <OptionDescription variant="body2">
                      {layoutOption.description}
                    </OptionDescription>
                  </OptionText>
                </OptionRow>
              </OptionCardContent>
            </OptionCard>
          ))}
        </OptionList>
      </OptionChooserContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          <FormattedMessage id="layout-selector.cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={handleAccept} variant="contained">
          <FormattedMessage id="layout-selector.accept" defaultMessage="Accept" />
        </Button>
      </DialogActions>
    </OptionChooserDialog>
  );
};

export default LayoutSelector;
