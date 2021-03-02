import React from 'react';
import Chip from '@material-ui/core/Chip';
import LabelIcon from '@material-ui/icons/Label';

import {Label} from '../../../../classes/client';
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
          icon={<LabelIcon />}
          label={label.title}
          clickable
          color="primary"
          style={{ backgroundColor: label.color }}
          onDelete={() => {return 1;}}
        />
      ))}
    </>
  );
}
