import React from 'react';
import Chip from '@mui/material/Chip';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@mui/icons-material/LabelTwoTone';
type Props = {
  labels: Label[],
};

export function LabelsCell({ labels }: Props): React.ReactElement<Props> {
  return (
    <>
      {labels.map(label => (
        <Chip
          key={label.id}
          size="small"
          icon={<LabelTwoTone />}
          label={label.title}
          clickable
          color="primary"
          style={{ backgroundColor: label.color, opacity: '0.75' }}
          onDelete={() => { return 1; }}
        />
      ))}
    </>
  );
}
