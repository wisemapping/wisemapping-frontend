import React from 'react'
import { useStyles } from './styled';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import StarRateRoundedIcon from '@material-ui/icons/StarRateRounded';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../reducers/serviceSlice';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ErrorInfo, MapInfo, Service } from '../../../services/Service';
import ActionChooser, { ActionType } from '../action-chooser';
import ActionDispatcher from '../action-dispatcher';
import { InputBase, Link } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';


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

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string | boolean | string[] | undefined }, b: { [key in Key]: number | string | string[] | boolean }) => number {
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
  disablePadding: boolean;
  id: keyof MapInfo;
  label?: string;
  numeric: boolean;
  style: CSSProperties;
}

const headCells: HeadCell[] = [
  { id: 'starred', numeric: false, disablePadding: false, label: '', style: { width: '20px', padding: '0px' } },
  { id: 'name', numeric: false, disablePadding: true, label: 'Name', style: {} },
  { id: 'labels', numeric: false, disablePadding: true, style: {} },
  { id: 'creator', numeric: false, disablePadding: false, label: 'Creator', style: {} },
  { id: 'modified', numeric: true, disablePadding: false, label: 'Modified', style: { width: '50px' } }
];

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
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;

  const createSortHandler = (property: keyof MapInfo) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding='checkbox' key='select' style={{ width: '20px' }} className={classes.headerCell}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            size='small'
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>

        {headCells.map((headCell) => {
          return headCell.label ? (<TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            style={headCell.style}
            className={classes.headerCell}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>) : (<TableCell className={classes.headerCell} key={headCell.id}> </TableCell>)
        }
        )}
        <TableCell style={{ width: '20px', padding: '0px' }} key='actions' className={classes.headerCell}></TableCell>
      </TableRow>
    </TableHead>
  );
}

type ActionPanelState = {
  el: HTMLElement | undefined,
  mapId: number
}

export const MapsList = () => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof MapInfo>('modified');
  const [selected, setSelected] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const service: Service = useSelector(activeInstance);

  const { isLoading, error, data } = useQuery<unknown, ErrorInfo, MapInfo[]>('maps', async () => {

    const result = await service.fetchAllMaps();
    return result;
  });
  const mapsInfo: MapInfo[] = data ? data : [];


  const [activeRowAction, setActiveRowAction] = React.useState<ActionPanelState | undefined>(undefined);
  type ActiveDialog = {
    actionType: ActionType;
    mapId: number
  };

  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog | undefined>(undefined);
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof MapInfo) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      const newSelecteds = mapsInfo.map((n) => n.id);
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

  const handleActionClick = (mapId: number): ((event: any) => void) => {
    return (event: any): void => {
      setActiveRowAction(
        {
          mapId: mapId,
          el: event.currentTarget
        }
      );
      event.stopPropagation();
    };
  };

  const queryClient = useQueryClient();

  const starredMultation = useMutation<void, ErrorInfo, number>((id: number) => {
    return service.changeStarred(id);
  },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('maps');
      },
      onError: (error) => {
        // setError(error);
      }
    }
  );

  const handleStarred = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
    event.stopPropagation();

    event.preventDefault();
    starredMultation.mutate(id);
  }

  const handleActionMenuClose = (action: ActionType): void => {
    if (action) {
      const mapId = activeRowAction?.mapId;

      setActiveDialog({
        actionType: action as ActionType,
        mapId: mapId as number
      });
    }
    setActiveRowAction(undefined);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, mapsInfo.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={0}>
        <Toolbar className={classes.toolbar} variant="dense">


          <div className={classes.toolbarActions}>
            {selected.length > 0 ? (

              <Tooltip title="Delete">
                <IconButton aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </div>

          <div className={classes.toolbarListActions}>
            <TablePagination
              style={{ float: 'right', border: "0", paddingBottom: "5px" }}
              rowsPerPageOptions={[50]}
              count={mapsInfo.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              component="div"
            />
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.searchInputRoot,
                  input: classes.searchInputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
          </div>

        </Toolbar>

        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            stickyHeader
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={mapsInfo.length}
            />

            <TableBody>
              {isLoading ? (<TableRow></TableRow>) : stableSort(mapsInfo, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: MapInfo) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = row.id;

                  return (
                    <TableRow
                      hover
                      onClick={(event: any) => handleRowClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      style={{ border: "0" }}
                    >
                      <TableCell padding="checkbox" style={{ border: "0" }}>
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': String(labelId) }}
                          size="small" />
                      </TableCell>

                      <TableCell>
                        <Tooltip title="Starred">
                          <IconButton aria-label="Starred" size="small" onClick={(e) => handleStarred(e, row.id)}>
                            <StarRateRoundedIcon color="action" style={{ color: row.starred ? 'yellow' : 'gray' }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Tooltip title="Open for edition" placement="bottom-start">

                          <Link href={`c/maps/${row.id}/edit`} color="textPrimary" underline="always">
                            {row.name}
                          </Link>
                        </Tooltip>
                      </TableCell>

                      <TableCell>{row.labels}</TableCell>
                      <TableCell>{row.creator}</TableCell>
                      <TableCell>{row.modified}</TableCell>

                      <TableCell>
                        <Tooltip title="Others">
                          <IconButton aria-label="Others" size="small" onClick={handleActionClick(row.id)}>
                            <MoreHorizIcon color="action" />
                          </IconButton>
                        </Tooltip>
                        <ActionChooser anchor={activeRowAction?.el} onClose={handleActionMenuClose} />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

      </Paper>

      {/* Action Dialog */}
      <ActionDispatcher action={activeDialog?.actionType} onClose={() => setActiveDialog(undefined)} mapId={activeDialog ? activeDialog.mapId : -1} />
    </div >
  );
}