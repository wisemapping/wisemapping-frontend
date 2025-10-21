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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SvgIcon from '@mui/material/SvgIcon';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { LayoutType } from '@wisemapping/mindplot';
import NodeProperty from '../../../../classes/model/node-property';

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
};

const LayoutSelector = ({ closeModal, layoutModel }: LayoutSelectorProps): ReactElement => {
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
      icon: <MindmapIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      id: 'tree' as LayoutType,
      name: intl.formatMessage({ id: 'layout.tree.name', defaultMessage: 'Tree' }),
      description: intl.formatMessage({
        id: 'layout.tree.description',
        defaultMessage:
          'Vertical hierarchy flowing top-to-bottom. Great for organizational charts and hierarchical structures.',
      }),
      icon: <AccountTreeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
  ];

  const handleLayoutSelect = (layout: LayoutType) => {
    setSelectedLayout(layout);
    console.log(`[LayoutSelector] User selected layout: ${layout}`);
  };

  const handleAccept = () => {
    const setValue = layoutModel.setValue;
    if (setValue) {
      const previousLayout = layoutModel.getValue();
      console.log(
        `[LayoutSelector] Applying layout change: ${previousLayout} -> ${selectedLayout}`,
      );

      // Track tree/org layout selection
      if (selectedLayout === 'tree') {
        console.log('[LayoutSelector] User confirmed TREE (org) layout selection');
      }

      setValue(selectedLayout);
    }
    closeModal();
  };

  const handleCancel = () => {
    // Reset to original layout
    setSelectedLayout(layoutModel.getValue());
    closeModal();
  };

  return (
    <Dialog
      open={true}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '300px',
          border: '2px solid #ffa800',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle>
        <FormattedMessage id="layout-selector.title" defaultMessage="Choose Layout" />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.4 }}>
          <FormattedMessage
            id="layout-selector.description"
            defaultMessage="A layout defines how topics are organized and connected in your mind map. Choose a layout that best fits your content structure."
          />
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {layouts.map((layoutOption) => (
            <Card
              key={layoutOption.id}
              sx={{
                cursor: 'pointer',
                border:
                  selectedLayout === layoutOption.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': {
                  border: '2px solid #1976d2',
                  boxShadow: 2,
                },
              }}
              onClick={() => handleLayoutSelect(layoutOption.id)}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {layoutOption.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      component="div"
                      sx={{ fontWeight: 'bold', mb: 0.25, fontSize: '0.875rem' }}
                    >
                      {layoutOption.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.2, fontSize: '0.75rem' }}
                    >
                      {layoutOption.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          <FormattedMessage id="layout-selector.cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={handleAccept} variant="contained">
          <FormattedMessage id="layout-selector.accept" defaultMessage="Accept" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayoutSelector;
