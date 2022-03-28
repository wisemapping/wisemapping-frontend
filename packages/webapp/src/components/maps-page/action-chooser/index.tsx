import React from 'react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';

import { FormattedMessage } from 'react-intl';
import { fetchMapById } from '../../../redux/clientSlice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
export type ActionType =
    | 'open'
    | 'share'
    | 'import'
    | 'delete'
    | 'info'
    | 'create'
    | 'duplicate'
    | 'export'
    | 'label'
    | 'rename'
    | 'print'
    | 'info'
    | 'publish'
    | 'history'
    | undefined;

interface ActionProps {
    onClose: (action: ActionType) => void;
    anchor?: HTMLElement;
    mapId?: number;
}

const ActionChooser = (props: ActionProps): React.ReactElement => {
    const { anchor, onClose, mapId } = props;

    const handleOnClose = (
        action: ActionType
    ): ((event: React.MouseEvent<HTMLLIElement>) => void) => {
        return (event): void => {
            event.stopPropagation();
            onClose(action);
        };
    };

    const role = mapId ? fetchMapById(mapId)?.map?.role : undefined;
    return (
        <Menu
            anchorEl={anchor}
            keepMounted
            open={Boolean(anchor)}
            onClose={handleOnClose(undefined)}
            elevation={1}
        >
            <MenuItem onClick={handleOnClose('open')} style={{ width: '220px' }}>
                <ListItemIcon>
                    <DescriptionOutlinedIcon />
                </ListItemIcon>
                <FormattedMessage id="action.open" defaultMessage="Open" />
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleOnClose('duplicate')}>
                <ListItemIcon>
                    <FileCopyOutlinedIcon />
                </ListItemIcon>
                <FormattedMessage id="action.duplicate" defaultMessage="Duplicate" />
            </MenuItem>

            {role == 'owner' && (
                <MenuItem onClick={handleOnClose('rename')}>
                    <ListItemIcon>
                        <EditOutlinedIcon />
                    </ListItemIcon>
                    <FormattedMessage id="action.rename" defaultMessage="Rename" />
                </MenuItem>
            )}

            <MenuItem onClick={handleOnClose('label')}>
                <ListItemIcon>
                    <LabelOutlined />
                </ListItemIcon>
                <FormattedMessage id="action.label" defaultMessage="Add Label" />
            </MenuItem>

            <MenuItem onClick={handleOnClose('delete')}>
                <ListItemIcon>
                    <DeleteOutlinedIcon />
                </ListItemIcon>
                <FormattedMessage id="action.delete" defaultMessage="Delete" />
            </MenuItem>
            <Divider />

            <MenuItem onClick={handleOnClose('export')}>
                <ListItemIcon>
                    <CloudDownloadOutlinedIcon />
                </ListItemIcon>
                <FormattedMessage id="action.export" defaultMessage="Export" />
            </MenuItem>

            <MenuItem onClick={handleOnClose('print')}>
                <ListItemIcon>
                    <PrintOutlinedIcon />
                </ListItemIcon>
                <FormattedMessage id="action.print" defaultMessage="Print" />
            </MenuItem>

            {role == 'owner' && (
                <MenuItem onClick={handleOnClose('publish')}>
                    <ListItemIcon>
                        <PublicOutlinedIcon />
                    </ListItemIcon>
                    <FormattedMessage id="action.publish" defaultMessage="Publish" />
                </MenuItem>
            )}

            {role == 'owner' && (
                <MenuItem onClick={handleOnClose('share')}>
                    <ListItemIcon>
                        <ShareOutlinedIcon />
                    </ListItemIcon>
                    <FormattedMessage id="action.share" defaultMessage="Share" />
                </MenuItem>
            )}
            <Divider />

            <MenuItem onClick={handleOnClose('info')}>
                <ListItemIcon>
                    <InfoOutlinedIcon />
                </ListItemIcon>
                <FormattedMessage id="action.info" defaultMessage="Info" />
            </MenuItem>

            {role != 'viewer' && (
                <MenuItem onClick={handleOnClose('history')}>
                    <ListItemIcon>
                        <HistoryOutlined/>
                    </ListItemIcon>
                    <FormattedMessage id="action.history" defaultMessage="History" />
                </MenuItem>
            )}
        </Menu>
    );
};

export default ActionChooser;
