import React from 'react';
import { LabelContainer, LabelText } from './styled';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import DeleteIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';


type LabelSize = 'small' | 'big';
type LabelComponentProps = { label: Label; onDelete?: (label: Label) => void; size?: LabelSize };

export default function LabelComponent({ label, onDelete, size = 'small' }: LabelComponentProps): React.ReactElement<LabelComponentProps> {
  const iconSize = size === 'small' ? {
    height: '0.6em', width: '0.6em'
  } : { height: '0.9em', width: '0.9em' };

    return (
        <LabelContainer color={label.color}>
            <LabelTwoTone htmlColor={label.color} style={iconSize} />
            <LabelText>{label.title}</LabelText>
            {onDelete && (
                <IconButton
                    color="default"
                    size="small"
                    aria-label="delete tag"
                    component="span"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(label);
                    }}
                >
                    <DeleteIcon style={iconSize} />
                </IconButton>
            )}
        </LabelContainer>
    );
}
