import React from 'react';
import Chip from '@material-ui/core/Chip';

import { Label } from '../../../../classes/client';
import LabelTwoTone from '@material-ui/icons/LabelTwoTone';
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
