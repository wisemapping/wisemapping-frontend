/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { Theme } from '@mui/material/styles';

// Admin Console Layout Styles
export const adminConsoleStyles = {
  drawer: {
    width: 240,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 240,
      boxSizing: 'border-box',
      position: 'relative',
      height: '100%',
      backgroundColor: (theme: Theme): string =>
        theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
      borderRight: (theme: Theme): string => `1px solid ${theme.palette.divider}`,
    },
  },

  appBar: {
    width: 'calc(100% - 240px)',
    marginLeft: '240px',
    zIndex: (theme: Theme): number => theme.zIndex.drawer + 1,
  },

  mainContent: {
    flexGrow: 1,
    width: { sm: 'calc(100% - 240px)' },
    overflow: 'auto',
    marginTop: '64px', // Account for AppBar height
  },

  // Navigation Menu Item Styles
  navigationButton: {
    marginX: 1,
    borderRadius: 1,
    '&.Mui-selected': {
      backgroundColor: (theme: Theme): string => theme.palette.primary.main,
      color: 'white',
      '&:hover': {
        backgroundColor: (theme: Theme): string => theme.palette.primary.dark,
      },
      '& .MuiListItemIcon-root': {
        color: 'white',
      },
    },
    '&:hover': {
      backgroundColor: (theme: Theme): string => theme.palette.action.hover,
    },
    '& .MuiListItemIcon-root': {
      color: (theme: Theme): string => theme.palette.text.primary,
    },
  },

  // Table Styles
  tableContainer: {
    marginTop: 2,
  },

  tableRow: {
    '&:hover': {
      backgroundColor: (theme: Theme): string => theme.palette.action.hover,
    },
  },

  // Action Button Styles
  actionButton: {
    marginX: 0.5,
  },

  editButton: {
    color: (theme: Theme): string => theme.palette.primary.main,
    '&:hover': {
      backgroundColor: (theme: Theme): string => theme.palette.primary.light + '20',
    },
  },

  deleteButton: {
    color: (theme: Theme): string => theme.palette.error.main,
    '&:hover': {
      backgroundColor: (theme: Theme): string => theme.palette.error.light + '20',
    },
  },

  // Pagination Styles
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 3,
  },

  // Dialog Styles
  dialogContent: {
    padding: 3,
  },

  dialogActions: {
    padding: 2,
    gap: 1,
  },

  // XML Viewer Styles
  xmlViewer: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    backgroundColor: (theme: Theme): string =>
      theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
    '& .MuiInputBase-input': {
      color: (theme: Theme): string => theme.palette.text.primary,
    },
  },

  // Form Styles
  formField: {
    marginBottom: 2,
  },

  formActions: {
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
    marginTop: 3,
  },

  // Status Chip Styles
  statusChip: {
    '&.active': {
      backgroundColor: (theme: Theme): string => theme.palette.success.light,
      color: (theme: Theme): string => theme.palette.success.contrastText,
    },
    '&.suspended': {
      backgroundColor: (theme: Theme): string => theme.palette.error.light,
      color: (theme: Theme): string => theme.palette.error.contrastText,
    },
    '&.inactive': {
      backgroundColor: (theme: Theme): string => theme.palette.grey[500],
      color: (theme: Theme): string => theme.palette.grey[50],
    },
  },

  // Filter Controls Styles
  filterControls: {
    display: 'flex',
    gap: 2,
    marginBottom: 2,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  filterField: {
    minWidth: 200,
  },

  // Search Field Styles
  searchField: {
    flexGrow: 1,
    maxWidth: 400,
  },

  // Loading States
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },

  // Empty State Styles
  emptyState: {
    textAlign: 'center',
    padding: 4,
    color: (theme: Theme): string => theme.palette.text.secondary,
  },

  // Header Styles
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },

  sectionTitle: {
    fontWeight: 'bold',
    color: (theme: Theme): string => theme.palette.text.primary,
  },

  // Tooltip Styles
  tooltip: {
    fontSize: '0.75rem',
  },

  // Icon Styles
  icon: {
    fontSize: '1.2rem',
  },

  smallIcon: {
    fontSize: '1rem',
  },

  // Card Styles
  card: {
    elevation: 2,
  },

  cardContent: {
    padding: 3,
  },

  // Alert Styles
  infoAlert: {
    marginBottom: 2,
  },

  errorAlert: {
    marginBottom: 2,
  },

  // Responsive Styles
  responsiveContainer: {
    padding: { xs: 2, sm: 3 },
  },

  // Animation Styles
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },

  // Spacing Utilities
  spacing: {
    small: 1,
    medium: 2,
    large: 3,
    xlarge: 4,
  },
};

// Export individual style groups for easier imports
export const {
  drawer: drawerStyles,
  appBar: appBarStyles,
  mainContent: mainContentStyles,
  navigationButton: navigationButtonStyles,
  tableContainer: tableContainerStyles,
  actionButton: actionButtonStyles,
  editButton: editButtonStyles,
  deleteButton: deleteButtonStyles,
  pagination: paginationStyles,
  dialogContent: dialogContentStyles,
  xmlViewer: xmlViewerStyles,
  formField: formFieldStyles,
  statusChip: statusChipStyles,
  filterControls: filterControlsStyles,
  searchField: searchFieldStyles,
  loadingContainer: loadingContainerStyles,
  emptyState: emptyStateStyles,
  sectionHeader: sectionHeaderStyles,
  sectionTitle: sectionTitleStyles,
} = adminConsoleStyles;
