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

import Checkbox from '@mui/material/Checkbox';
import InputBase from '@mui/material/InputBase';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import { alpha, styled } from '@mui/material/styles';
import { BodyCell, CompactCardHeader, MapCardRoot } from './shared.styled';

export { BodyCell, CompactCardHeader, MapCardRoot };

/*
 * The map list (table on wide screens, cards on narrow ones) and its loading placeholders.
 * "Narrow" is `theme.breakpoints.down('sm')` throughout: the list picks its view with the same
 * query (see `narrowScreen` in index.tsx).
 */

/** The border of the list's frame and of the pagination: a grey that reads on both modes. */
const FRAME_BORDER = 'rgba(128, 128, 128, 0.2)';
const PAGINATION_BORDER = 'rgba(128, 128, 128, 0.15)';

// ---------------------------------------------------------------- The list and its toolbar

export const ListRoot = styled('div')({
  width: '100%',
});

export const ListPaper = styled(Paper)(({ theme }) => ({
  marginTop: '30px',
  marginBottom: theme.spacing(2),
  backgroundColor: 'transparent',
  marginLeft: theme.spacing(12),
  marginRight: theme.spacing(12),
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
  },
}));

export const ListToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 0,
  paddingTop: '30px',
  paddingBottom: '30px',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

/** The bulk actions: on narrow screens the buttons show their icon only. */
export const ToolbarActions = styled('div')(({ theme }) => ({
  flex: '1 1 0',
  minWidth: 0,
  '& .MuiButton-root': {
    [theme.breakpoints.down('sm')]: {
      minWidth: 'auto',
      padding: theme.spacing(0.75, 1),
      '& .MuiButton-startIcon': {
        margin: 0,
      },
    },
  },
  '& .button-text': {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export const SearchContainer = styled('div')(({ theme }) => ({
  flex: '1 1 0',
  display: 'flex',
  justifyContent: 'center',
  minWidth: 0,
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const SearchBox = styled('div')(({ theme }) => ({
  borderRadius: 9,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  margin: '10px 0px',
  width: 'auto',
}));

export const SearchIconWrapper = styled('div')({
  padding: '6px 0 0 5px',
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  alignItems: 'center',
  justifyContent: 'center',
});

export const SearchInput = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '24ch',
      '&:focus': {
        width: '39ch',
      },
    },
  },
}));

export const ToolbarEnd = styled('div')({
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  justifyContent: 'flex-end',
});

export const PaginationDesktop = styled('div')({
  display: 'block',
  backgroundColor: 'transparent',
});

/** Below the cards, where the toolbar has no room for it. */
export const PaginationMobile = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  backgroundColor: 'transparent',
}));

/** Typed as TablePagination: styled() would drop its `component` prop (rendered as a div here). */
export const ListPagination = styled(TablePagination)(({ theme }) => ({
  width: 'auto',
  display: 'inline-flex',
  backgroundColor: 'transparent',
  border: `1px solid ${PAGINATION_BORDER}`,
  borderRadius: '8px',
  padding: 0,
  margin: 0,
  '& .MuiTablePagination-toolbar': {
    minHeight: '40px',
    paddingLeft: '22px',
    paddingRight: theme.spacing(1.5),
    minWidth: 'auto',
    backgroundColor: 'transparent',
  },
  '& .MuiTablePagination-spacer': {
    display: 'none',
  },
  '& .MuiTablePagination-selectLabel': {
    margin: 0,
  },
  '& .MuiTablePagination-displayedRows': {
    margin: 0,
  },
  [theme.breakpoints.down('sm')]: {
    width: '50%',
    overflow: 'hidden',
    marginRight: 0,
  },
})) as typeof TablePagination;

export const ListTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${FRAME_BORDER}`,
  borderRadius: '12px',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    border: 'none',
    borderRadius: 0,
  },
}));

// ---------------------------------------------------------------- The table (wide screens)

export const ListTable = styled(Table)(({ theme }) => ({
  minWidth: 750,
  backgroundColor: theme.palette.background.default,
  '& tbody tr': {
    background: 'transparent',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.04),
      ...theme.applyStyles('dark', {
        backgroundColor: alpha(theme.palette.action.hover, 0.08),
      }),
    },
  },
}));

export const HeaderCell = styled(TableCell)(({ theme }) => ({
  background: theme.palette.background.default,
  fontWeight: 'bold',
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderTop: 0,
  borderLeft: 0,
  borderRight: 0,
  fontSize: '0.96rem',
  fontFamily: theme.typography.fontFamily,
  padding: theme.spacing(1, 1.5),
}));

export const LabelsBodyCell = styled(BodyCell)({
  maxWidth: '300px',
  overflow: 'hidden',
  textAlign: 'right',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

/** Read by screen readers only. */
export const VisuallyHidden = styled('span')({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
});

/** The row and "select all" checkboxes: greyed, not in the brand colour. */
export const SelectCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.action.disabled,
  '&.Mui-checked, &.MuiCheckbox-indeterminate': {
    color: theme.palette.action.active,
    ...theme.applyStyles('dark', {
      color: alpha(theme.palette.common.white, 0.7),
    }),
  },
}));

export const TitleLink = styled(Link)(({ theme }) => ({
  fontSize: '0.96rem',
  fontFamily: theme.typography.fontFamily,
}));

export const CellText = styled(Typography)(({ theme }) => ({
  fontSize: '0.96rem',
  fontFamily: theme.typography.fontFamily,
}));

/**
 * The star of a map. `&&`: the theme's IconButton gives its icons `color: inherit` through a
 * descendant selector, which a single class would lose to.
 */
export const StarIcon = styled(StarRateRoundedIcon, {
  shouldForwardProp: (prop) => prop !== 'starred',
})<{ starred: boolean }>(({ starred }) => ({
  '&&': {
    color: starred ? 'yellow' : 'gray',
  },
}));

// ---------------------------------------------------------------- The cards (narrow screens)

export const CardTitle = styled(Typography)(({ theme }) => ({
  maxWidth: '70vw',
  fontSize: '0.875rem',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.secondary,
}));

// ---------------------------------------------------------------- Loading placeholders

/** A placeholder block, a shade over the background in either mode. */
