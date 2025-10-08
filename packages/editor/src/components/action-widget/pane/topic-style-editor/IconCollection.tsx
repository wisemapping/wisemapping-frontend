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
    ariaLabel?: string; // Optional custom aria-label
  }>;
  selectedValue: TopicShapeType | StrokeStyle | LineType;
  onSelect: (value: TopicShapeType | StrokeStyle | LineType) => void;
  ariaLabelSuffix?: string; // Optional suffix to add to all aria-labels (e.g., " shape")
}

const IconCollection = ({
  styles,
  selectedValue,
  onSelect,
  ariaLabelSuffix,
}: IconCollectionProps): ReactElement => {
  // Helper function to extract label text from FormattedMessage or string
  const getLabelText = (label: string | ReactElement): string => {
    if (typeof label === 'string') {
      return label;
    }
    // If it's a FormattedMessage, extract the defaultMessage prop
    if (React.isValidElement(label)) {
      const props = label.props as { defaultMessage?: string };
      // eslint-disable-next-line react/prop-types
      return props.defaultMessage || '';
    }
    return '';
  };

  return (
    <StyledGrid>
      {styles.map((style) => {
        const labelText = getLabelText(style.label);
        // Use custom aria-label if provided, otherwise construct from label + suffix
        const ariaLabel =
          style.ariaLabel || (ariaLabelSuffix ? `${labelText}${ariaLabelSuffix}` : labelText);

        return (
          <StyledButton
            key={style.type}
            selected={selectedValue === style.type}
            onClick={() => onSelect(style.type)}
            aria-label={ariaLabel}
            title={labelText}
          >
            {style.icon}
          </StyledButton>
        );
      })}
    </StyledGrid>
  );
};

export default IconCollection;
