import React from 'react';
import { LabelContainer, LabelText } from './styled';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
import DeleteIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

type Props = {
  labels: Label[];
  onDelete: (label: Label) => void;
};

export function LabelsCell({ labels, onDelete }: Props): React.ReactElement<Props> {
  // Keep original label colors in both light and dark mode
  const getIconColor = (label: Label) => {
    return label.color;
  };

  return (
    <>
      {labels.map((label) => (
        <LabelContainer key={label.id} color={label.color}>
          <LabelTwoTone
            htmlColor={getIconColor(label)}
            style={{ height: '0.6em', width: '0.6em' }}
          />
          <LabelText>{label.title}</LabelText>
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
            <DeleteIcon style={{ height: '0.6em', width: '0.6em' }} />
          </IconButton>
        </LabelContainer>
      ))}
    </>
  );
}
