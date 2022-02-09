import React from 'react';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import { FormattedMessage, useIntl } from 'react-intl';
import { Label } from '../../../../classes/client';
import { LabelSelector } from '../label-selector';

type AddLabelButtonTypes = {
    onChange?: (label: Label) => void;
};

export function AddLabelButton({ onChange }: AddLabelButtonTypes): React.ReactElement {
    console.log(onChange);
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'add-label-popover' : undefined;

    return (
        <Tooltip
            arrow={true}
            title={intl.formatMessage({
                id: 'map.tooltip-add',
                defaultMessage: 'Add label to selected',
            })}
        >
            <>
                <Button
                    color="primary"
                    size="medium"
                    variant="outlined"
                    type="button"
                    style={{ marginLeft: '10px' }}
                    disableElevation={true}
                    startIcon={<LabelTwoTone />}
                    onClick={handleClick}
                >
                    <FormattedMessage id="action.label" defaultMessage="Add Label" />
                </Button>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <LabelSelector />
                </Popover>
            </>
        </Tooltip>
    );
}
