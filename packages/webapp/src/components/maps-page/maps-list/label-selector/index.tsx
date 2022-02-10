import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import { Label as LabelComponent } from '../label';
import Client, { Label, ErrorInfo, MapInfo } from '../../../../classes/client';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../../redux/clientSlice';
import { StyledButton, NewLabelContainer, NewLabelColor, CreateLabel } from './styled';
import { TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';

const labelColors = [
  '#00b327',
  '#0565ff',
  '#2d2dd6',
  '#6a00ba',
  '#ad1599',
  '#ff1e35',
  '#ff6600',
  '#ffff47',
];

export type LabelSelectorProps = {
  maps: MapInfo[];
  onChange: (label: Label, checked: boolean) => void;
};

export function LabelSelector({ onChange, maps }: LabelSelectorProps): React.ReactElement {
  const client: Client = useSelector(activeInstance);
  const intl = useIntl();

  const { data: labels = [] } = useQuery<unknown, ErrorInfo, Label[]>('labels', async () => client.fetchLabels());

  const checkedLabelIds = labels.map(l => l.id).filter(labelId => maps.every(m => m.labels.find(l => l.id === labelId)));

  const [createLabelColorIndex, setCreateLabelColorIndex] = React.useState(Math.floor(Math.random() * labelColors.length));
  const [newLabelTitle, setNewLabelTitle] = React.useState('');

  const newLabelColor = labelColors[createLabelColorIndex];

  const setNextLabelColorIndex = () => {
    const nextIndex = labelColors[createLabelColorIndex + 1] ?
      createLabelColorIndex + 1 :
      0;
    setCreateLabelColorIndex(nextIndex);
  };


  const handleSubmitNew = () => {
    onChange({
      title: newLabelTitle,
      color: newLabelColor,
      id: 0,
    }, true);
    setNewLabelTitle('');
    setNextLabelColorIndex();
  };

  return (
    <Container>
      <FormGroup>
        {labels.map(({ id, title, color}) => (
          <FormControlLabel
            key={id}
            control={
              <Checkbox
                id={`${id}`}
                checked={checkedLabelIds.includes(id)}
                onChange={(e) => {
                  onChange({ id, title, color }, e.target.checked);
                }}
                name={title}
                color="primary"
              />
            }
            label={<LabelComponent name={title} color={color} />}
          />
        ))}
        <Divider />
        <CreateLabel>
          <Typography variant="h4" component="h4" fontSize={14} >
            <FormattedMessage id="label.create-new" defaultMessage={
              intl.formatMessage({
                id: 'label.add-placeholder',
                defaultMessage: 'Label title',
              })
            } />
          </Typography>
          <NewLabelContainer>
            <NewLabelColor 
              color={newLabelColor} 
              onClick={(e) => {
                e.stopPropagation();
                setNextLabelColorIndex();
              }} 
            />
            <TextField variant='outlined' label="Label title" 
              onChange={(e) => setNewLabelTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitNew();
                }
              }}
              value={newLabelTitle} />
          </NewLabelContainer>
          <StyledButton
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleSubmitNew()}
            disabled={!newLabelTitle.length}
          >
            <FormattedMessage id="label.add-button" defaultMessage="Add label" />
          </StyledButton>

        </CreateLabel>
      </FormGroup>
    </Container>
  );
}
