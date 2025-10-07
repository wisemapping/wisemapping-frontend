import React, { ReactElement } from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';

const StyledGrid = styled(Box)({
  display: 'flex',
  gap: '6px',
  marginTop: '8px',
  justifyContent: 'space-between',
  width: '100%',
});

const StyledButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  width: '24px',
  height: '24px',
  padding: '0px',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
  borderRadius: '4px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

interface IconCollectionProps {
  styles: Array<{
    type: TopicShapeType | StrokeStyle | LineType;
    icon: ReactElement;
    label: string | ReactElement;
  }>;
  selectedValue: TopicShapeType | StrokeStyle | LineType;
  onSelect: (value: TopicShapeType | StrokeStyle | LineType) => void;
}

const IconCollection = ({ styles, selectedValue, onSelect }: IconCollectionProps): ReactElement => {
  return (
    <StyledGrid>
      {styles.map((style) => (
        <StyledButton
          key={style.type}
          selected={selectedValue === style.type}
          onClick={() => onSelect(style.type)}
        >
          {style.icon}
        </StyledButton>
      ))}
    </StyledGrid>
  );
};

export default IconCollection;
