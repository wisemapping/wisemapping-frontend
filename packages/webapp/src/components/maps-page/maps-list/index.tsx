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

import React, { useEffect, useMemo, CSSProperties, useContext } from 'react';

import { useStyles } from './styled';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Client, { ErrorInfo, Label, MapInfo } from '../../../classes/client';
import ActionChooser, { ActionType } from '../action-chooser';
import ActionDispatcher from '../action-dispatcher';
import dayjs from 'dayjs';
import { Filter, LabelFilter } from '..';
import { FormattedMessage, useIntl } from 'react-intl';
import { trackToolbarAction } from '../../../utils/analytics';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Link from '@mui/material/Link';

import DeleteOutlined from '@mui/icons-material/DeleteOutlined';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import SearchIcon from '@mui/icons-material/Search';

import relativeTime from 'dayjs/plugin/relativeTime';
import { LabelsCell } from './labels-cell';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import AppI18n from '../../../classes/app-i18n';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import { CSSObject, Interpolation, Theme } from '@emotion/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { ClientContext } from '../../../classes/provider/client-context';
import { MapsListSkeleton, MapsCardsListSkeleton } from './MapsListSkeleton';

dayjs.extend(LocalizedFormat);
dayjs.extend(relativeTime);

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | boolean | Label[] | undefined },
  b: { [key in Key]: number | string | Label[] | boolean },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  id: keyof MapInfo;
  label?: string;
  numeric: boolean;
  style?: CSSProperties;
}

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof MapInfo) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const intl = useIntl();

  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;

  const createSortHandler = (property: keyof MapInfo) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const headCells: HeadCell[] = useMemo(
    () => [
      {
        id: 'title',
        numeric: false,
        label: intl.formatMessage({ id: 'map.name', defaultMessage: 'Name' }),
      },
      {
        id: 'labels',
        numeric: false,
      },
      {
        id: 'createdBy',
        numeric: false,
        label: intl.formatMessage({ id: 'map.creator', defaultMessage: 'Creator' }),
        style: { width: '150px', whiteSpace: 'nowrap' },
      },
      {
        id: 'lastModificationTime',
        numeric: true,
        label: intl.formatMessage({ id: 'map.last-update', defaultMessage: 'Last Update' }),
        style: { width: '70px', whiteSpace: 'nowrap' },
      },
    ],
    [intl],
  );

  return (
    <TableHead>
      <TableRow>
        <TableCell
          padding="checkbox"
          key="select"
          style={{ width: '20px' }}
          css={classes.headerCell}
        >
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            size="small"
            inputProps={{ 'aria-label': 'select all desserts' }}
            sx={(theme) => ({
              color:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
              '&.Mui-checked': {
                color:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(0, 0, 0, 0.54)',
              },
              '&.MuiCheckbox-indeterminate': {
                color:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(0, 0, 0, 0.54)',
              },
            })}
          />
        </TableCell>

        {headCells.map((headCell) => {
          return (
            <TableCell
              key={headCell.id}
              sortDirection={orderBy === headCell.id ? order : false}
              style={headCell.style}
              css={classes.headerCell}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}

                {orderBy === headCell.id && (
                  <span css={classes.visuallyHidden as Interpolation<Theme>}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                )}
              </TableSortLabel>
            </TableCell>
          );
        })}

        <TableCell padding="checkbox" key="starred" css={classes.headerCell}></TableCell>
        <TableCell padding="checkbox" key="action" css={classes.headerCell}></TableCell>
      </TableRow>
    </TableHead>
  );
}

type ActionPanelState = {
  el: HTMLElement | undefined;
  mapId: number;
};

interface MapsListProps {
  filter: Filter;
}

const isLabelFilter = (filter: Filter): filter is LabelFilter => filter.type === 'label';

const mapsFilter = (filter: Filter, search: string): ((mapInfo: MapInfo) => boolean) => {
  return (mapInfo: MapInfo) => {
    // Check for filter condition
    let result = false;
    switch (filter.type) {
      case 'all':
        result = true;
        break;
      case 'starred':
        result = mapInfo.starred;
        break;
      case 'owned':
        result = mapInfo.role == 'owner';
        break;
      case 'shared':
        result = mapInfo.role != 'owner';
        break;
      case 'label':
        result =
          !mapInfo.labels ||
          mapInfo.labels.some((label) => label.id === (filter as LabelFilter).label.id);
        break;
      case 'public':
        result = mapInfo.public;
        break;
      default:
        result = false;
    }

    // Does it match search filter criteria...
    if (search && result) {
      result = mapInfo.title.toLowerCase().indexOf(search.toLowerCase()) != -1;
    }

    return result;
  };
};

export type ChangeLabelMutationFunctionParam = { maps: MapInfo[]; label: Label; checked: boolean };

export const getChangeLabelMutationFunction =
  (client: Client) =>
  async ({ maps, label, checked }: ChangeLabelMutationFunctionParam): Promise<void> => {
    if (!label.id) {
      label.id = await client.createLabel(label.title, label.color);
    }
    if (checked) {
      const toAdd = maps.filter((m) => !m.labels.find((l) => l.id === label.id));
      await Promise.all(toAdd.map((m) => client.addLabelToMap(label.id, m.id)));
    } else {
      const toRemove = maps.filter((m) => m.labels.find((l) => l.id === label.id));
      await Promise.all(toRemove.map((m) => client.deleteLabelFromMap(label.id, m.id)));
    }
    return Promise.resolve();
  };

export const MapsList = (props: MapsListProps): React.ReactElement => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('desc');
  const [filter, setFilter] = React.useState<Filter>({ type: 'all' });

  const [orderBy, setOrderBy] = React.useState<keyof MapInfo>('lastModificationTime');
  const [selected, setSelected] = React.useState<number[]>([]);
  const [searchCondition, setSearchCondition] = React.useState<string>('');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const client = useContext(ClientContext);
  const intl = useIntl();
  const queryClient = useQueryClient();

  const userLocale = AppI18n.getUserLocale();
  useEffect(() => {
    dayjs.locale(userLocale.code);
  }, [userLocale.code]);

  const filterLabelId = isLabelFilter(props.filter) ? props.filter.label.id : undefined;

  useEffect(() => {
    setSelected([]);
    setPage(0);
    setFilter((prevFilter) => {
      const nextFilter = props.filter;

      if (prevFilter.type === nextFilter.type) {
        if (isLabelFilter(nextFilter) && isLabelFilter(prevFilter)) {
          if (prevFilter.label.id === nextFilter.label.id) {
            return prevFilter;
          }
        } else {
          return prevFilter;
        }
      }

      return nextFilter;
    });
  }, [props.filter.type, filterLabelId]);

  const { isLoading, data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', () => {
    return client.fetchAllMaps();
  });

  const filteredMaps: MapInfo[] = useMemo(() => {
    if (!data) {
      return [];
    }
    const predicate = mapsFilter(filter, searchCondition);
    return data.filter(predicate);
  }, [data, filter, searchCondition]);

  const sortedMaps = useMemo(() => {
    return stableSort(filteredMaps, getComparator(order, orderBy));
  }, [filteredMaps, order, orderBy]);

  const pagedMaps = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedMaps.slice(start, start + rowsPerPage);
  }, [sortedMaps, page, rowsPerPage]);

  const [activeRowAction, setActiveRowAction] = React.useState<ActionPanelState | undefined>(
    undefined,
  );

  type ActiveDialog = {
    actionType: ActionType;
    mapsId: number[];
  };

  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog | undefined>(undefined);
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof MapInfo) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      const newSelecteds = filteredMaps.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event: React.MouseEvent<unknown>, id: number): void => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (mapId: number): ((event) => void) => {
    return (event): void => {
      setActiveRowAction({
        mapId: mapId,
        el: event.currentTarget,
      });
      event.preventDefault();
    };
  };

  const starredMultation = useMutation<void, ErrorInfo, number>(
    (id: number) => {
      const map = filteredMaps.find((m) => m.id == id);
      const starred = !map?.starred;

      // Follow a optimistic update approach ...
      queryClient.setQueryData<MapInfo[]>('maps', (currentMaps) => {
        if (map) {
          map.starred = starred;
        }
        return currentMaps || [];
      });
      return client.updateStarred(id, starred);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('maps');
      },
      onError: (error) => {
        queryClient.invalidateQueries('maps');
        console.error(error);
      },
    },
  );

  const handleStarred = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
    event.stopPropagation();
    event.preventDefault();
    starredMultation.mutate(id);
  };

  const handleActionMenuClose = (action: ActionType): void => {
    if (action) {
      const mapId = activeRowAction?.mapId;

      setActiveDialog({
        actionType: action as ActionType,
        mapsId: [mapId] as number[],
      });
    }
    setActiveRowAction(undefined);
  };

  const handleOnSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCondition(e.target.value);
  };

  const handleDeleteClick = () => {
    trackToolbarAction('delete_selected', `count:${selected.length}`);
    setActiveDialog({
      actionType: 'delete',
      mapsId: selected,
    });
  };

  const handleAddLabelClick = () => {
    trackToolbarAction('add_label_selected', `count:${selected.length}`);
    setActiveDialog({
      actionType: 'label',
      mapsId: selected,
    });
  };

  const removeLabelMultation = useMutation<
    void,
    ErrorInfo,
    { mapId: number; labelId: number },
    number
  >(
    ({ mapId, labelId }) => {
      return client.deleteLabelFromMap(labelId, mapId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('maps');
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );

  const handleRemoveLabel = (mapId: number, labelId: number) => {
    removeLabelMultation.mutate({ mapId, labelId });
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;
  return (
    <div css={classes.root}>
      {activeRowAction?.mapId !== undefined && (
        <ActionChooser
          anchor={activeRowAction?.el}
          onClose={handleActionMenuClose}
          mapId={activeRowAction.mapId}
        />
      )}

      <Paper css={classes.paper} elevation={0}>
        <Toolbar css={classes.toolbar} variant="dense" sx={{ backgroundColor: 'transparent' }}>
          <div css={classes.toolbarActions}>
            {selected.length > 0 && (
              <Tooltip
                arrow={true}
                title={intl.formatMessage({
                  id: 'map.delete-selected',
                  defaultMessage: 'Delete selected',
                })}
              >
                <Button
                  color="primary"
                  size="medium"
                  variant="outlined"
                  type="button"
                  disableElevation={true}
                  onClick={handleDeleteClick}
                  startIcon={<DeleteOutlined />}
                >
                  <span className="button-text">
                    <FormattedMessage id="action.delete" defaultMessage="Delete" />
                  </span>
                </Button>
              </Tooltip>
            )}

            {selected.length > 0 && (
              <Tooltip
                arrow={true}
                title={intl.formatMessage({
                  id: 'map.tooltip-add',
                  defaultMessage: 'Add label to selected',
                })}
              >
                <Button
                  color="primary"
                  size="medium"
                  variant="outlined"
                  type="button"
                  style={{ marginLeft: '10px' }}
                  disableElevation={true}
                  startIcon={<LabelTwoTone />}
                  onClick={handleAddLabelClick}
                >
                  <span className="button-text">
                    <FormattedMessage id="action.label" defaultMessage="Add Label" />
                  </span>
                </Button>
              </Tooltip>
            )}
          </div>

          <div css={classes.searchContainer as Interpolation<Theme>}>
            <div css={classes.search as Interpolation<Theme>}>
              <div css={classes.searchIcon as Interpolation<Theme>}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder={intl.formatMessage({
                  id: 'maps.search-action',
                  defaultMessage: 'Search ...',
                })}
                css={[classes.searchInputRoot, classes.searchInputInput]}
                inputProps={{ 'aria-label': 'search' }}
                onChange={handleOnSearchChange}
                // startAdornment={<SearchIcon />}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
            {/* Pagination on desktop */}
            {filteredMaps.length > rowsPerPage && (
              <Box css={classes.paginationDesktop as Interpolation<Theme>}>
                <TablePagination
                  css={classes.tablePagination as Interpolation<Theme>}
                  count={filteredMaps.length}
                  rowsPerPageOptions={[]}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  component="div"
                />
              </Box>
            )}
          </div>
        </Toolbar>

        <TableContainer css={classes.tableContainer as Interpolation<Theme>}>
          <Box css={classes.cards}>
            {isLoading ? (
              <MapsCardsListSkeleton rowsPerPage={rowsPerPage} />
            ) : filteredMaps.length === 0 ? (
              <Card>
                <CardContent>
                  <FormattedMessage
                    id="maps.empty-result"
                    defaultMessage="No matching mindmap found with the current filter criteria."
                  />
                </CardContent>
              </Card>
            ) : (
              pagedMaps.map((row: MapInfo) => {
                return (
                  <Card key={row.id} css={{ maxWidth: '94vw', margin: '3vw' }}>
                    <Link
                      href={`/c/maps/${row.id}/edit`}
                      underline="none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CardHeader
                        css={classes.cardHeader}
                        avatar={
                          <Tooltip
                            arrow={true}
                            title={intl.formatMessage({
                              id: 'maps.tooltip-starred',
                              defaultMessage: 'Starred',
                            })}
                          >
                            <div className="hola" onClick={(e) => e.stopPropagation()}>
                              <IconButton size="small" onClick={(e) => handleStarred(e, row.id)}>
                                <StarRateRoundedIcon
                                  color="action"
                                  style={{
                                    color: row.starred ? 'yellow' : 'gray',
                                  }}
                                />
                              </IconButton>
                            </div>
                          </Tooltip>
                        }
                        action={
                          <Tooltip
                            arrow={true}
                            title={intl.formatMessage({
                              id: 'map.more-actions',
                              defaultMessage: 'More Actions',
                            })}
                          >
                            <IconButton
                              aria-label={intl.formatMessage({
                                id: 'common.settings',
                                defaultMessage: 'Settings',
                              })}
                              onClick={handleActionClick(row.id)}
                            >
                              <MoreVertIcon color="action" />
                            </IconButton>
                          </Tooltip>
                        }
                        title={
                          <Typography
                            css={classes.cardTitle}
                            noWrap
                            color="text.secondary"
                            sx={{
                              fontSize: '0.96rem',
                              fontFamily:
                                'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                            }}
                          >
                            {row.title}
                          </Typography>
                        }
                        subheader={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontSize: '0.75rem',
                              fontFamily:
                                'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                            }}
                          >
                            {intl.formatMessage({
                              id: 'map.last-update',
                              defaultMessage: 'Last Update',
                            })}
                            <span>: </span>
                            <Tooltip
                              arrow={true}
                              title={intl.formatMessage(
                                {
                                  id: 'maps.modified-by-desc',
                                  defaultMessage: 'Modified by {by} on {on}',
                                },
                                {
                                  by: row.lastModificationBy,
                                  on: dayjs(row.lastModificationTime).format('lll'),
                                },
                              )}
                              placement="bottom-start"
                            >
                              <span>{dayjs(row.lastModificationTime).fromNow()}</span>
                            </Tooltip>
                          </Typography>
                        }
                      />
                    </Link>
                  </Card>
                );
              })
            )}
          </Box>
          <Table css={classes.table} size="small" stickyHeader>
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={filteredMaps.length}
            />

            <TableBody>
              {isLoading ? (
                <MapsListSkeleton rowsPerPage={rowsPerPage} />
              ) : filteredMaps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                    <FormattedMessage
                      id="maps.empty-result"
                      defaultMessage="No matching mindmap found with the current filter criteria."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                pagedMaps.map((row: MapInfo) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = row.id;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleRowClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox" css={classes.bodyCell}>
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': String(labelId),
                          }}
                          size="small"
                          sx={(theme) => ({
                            color:
                              theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.3)'
                                : 'rgba(0, 0, 0, 0.26)',
                            '&.Mui-checked': {
                              color:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.7)'
                                  : 'rgba(0, 0, 0, 0.54)',
                            },
                          })}
                        />
                      </TableCell>

                      <TableCell css={classes.bodyCell}>
                        <Tooltip
                          arrow={true}
                          title={intl.formatMessage({
                            id: 'maps.tooltip-open',
                            defaultMessage: 'Open for edition',
                          })}
                          placement="bottom-start"
                        >
                          <Link
                            href={`/c/maps/${row.id}/edit`}
                            color="textPrimary"
                            underline="always"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              fontSize: '0.96rem',
                              fontFamily:
                                'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                            }}
                          >
                            {row.title}
                          </Link>
                        </Tooltip>
                      </TableCell>

                      <TableCell css={[classes.bodyCell, classes.labelsCell as CSSObject]}>
                        <LabelsCell
                          labels={row.labels}
                          onDelete={(lbl) => {
                            handleRemoveLabel(row.id, lbl.id);
                          }}
                        />
                      </TableCell>

                      <TableCell css={classes.bodyCell}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.96rem',
                            fontFamily:
                              'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                          }}
                        >
                          {row.createdBy}
                        </Typography>
                      </TableCell>

                      <TableCell css={classes.bodyCell}>
                        <Tooltip
                          arrow={true}
                          title={intl.formatMessage(
                            {
                              id: 'maps.modified-by-desc',
                              defaultMessage: 'Modified by {by} on {on}',
                            },
                            {
                              by: row.lastModificationBy,
                              on: dayjs(row.lastModificationTime).format('lll'),
                            },
                          )}
                          placement="bottom-start"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.96rem',
                              fontFamily:
                                'Figtree, "Noto Sans JP", Helvetica, "system-ui", Arial, sans-serif',
                            }}
                          >
                            {dayjs(row.lastModificationTime).fromNow()}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell padding="checkbox" css={classes.bodyCell}>
                        <Tooltip
                          arrow={true}
                          title={intl.formatMessage({
                            id: 'maps.tooltip-starred',
                            defaultMessage: 'Starred',
                          })}
                        >
                          <IconButton size="small" onClick={(e) => handleStarred(e, row.id)}>
                            <StarRateRoundedIcon
                              color="action"
                              style={{
                                color: row.starred ? 'yellow' : 'gray',
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell css={classes.bodyCell}>
                        <Tooltip
                          arrow={true}
                          title={intl.formatMessage({
                            id: 'map.more-actions',
                            defaultMessage: 'More Actions',
                          })}
                        >
                          <IconButton
                            aria-label={intl.formatMessage({
                              id: 'common.others',
                              defaultMessage: 'Others',
                            })}
                            size="small"
                            onClick={handleActionClick(row.id)}
                          >
                            <MoreHorizIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination on mobile only - below table */}
        {filteredMaps.length > rowsPerPage && (
          <Box css={classes.paginationMobile as Interpolation<Theme>}>
            <TablePagination
              css={classes.tablePagination as Interpolation<Theme>}
              count={filteredMaps.length}
              rowsPerPageOptions={[]}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              component="div"
            />
          </Box>
        )}
      </Paper>

      <ActionDispatcher
        action={activeDialog?.actionType}
        onClose={(success) => {
          setActiveDialog(undefined);

          // If it was a success action, reset the selection list ...
          if (success) {
            setSelected([]);
          }
        }}
        mapsId={activeDialog ? activeDialog.mapsId : []}
      />
    </div>
  );
};
