import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';
import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import { Label as LabelComponent } from '../label';
import Client, { Label, ErrorInfo } from '../../../../classes/client';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { activeInstance } from '../../../../redux/clientSlice';
import { StyledButton } from './styled';

export function LabelSelector(): React.ReactElement {
  const client: Client = useSelector(activeInstance);

  const { data: labels = [] } = useQuery<unknown, ErrorInfo, Label[]>('labels', async () => client.fetchLabels());

  const [state, setState] = React.useState(labels.reduce((acc, label) => {
    acc[label.id] = false //label.checked;
    return acc;
  }, {}),);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.id]: event.target.checked });
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
                checked={state[id]}
                onChange={handleChange}
                name={title}
                color="primary"
              />
            }
            label={<LabelComponent name={title} color={color} />}
          />
        ))}
        <Divider />
        <StyledButton
          color="primary"
          startIcon={<AddIcon />}
        >
          {/* i18n */}
          Add new label
        </StyledButton>
      </FormGroup>
    </Container>
  );
}
