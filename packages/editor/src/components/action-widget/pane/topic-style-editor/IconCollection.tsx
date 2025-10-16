import React, { ReactElement } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { StrokeStyle } from '@wisemapping/mindplot/src/components/model/RelationshipModel';

const StyledGrid = styled(Box)({
  display: 'flex',
  gap: '6px',
  marginTop: '8px',
  justifyContent: 'space-evenly',
  width: '216px',
  flexWrap: 'wrap',
});

const StyledButton = styled(IconButton)<{ selected?: boolean }>(({ selected, theme }) => ({
  width: '24px',
  height: '24px',
  padding: '0px',
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `2px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  backgroundColor: selected
    ? theme.palette.mode === 'dark'
      ? 'rgba(144, 202, 249, 0.08)'
      : 'rgba(25, 118, 210, 0.08)'
    : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

interface IconCollectionProps {
  styles: Array<{
    type: TopicShapeType | StrokeStyle | LineType | undefined;
    icon: ReactElement;
    label: string | ReactElement;
    tooltip?: string | ReactElement; // Optional custom tooltip (overrides label)
    ariaLabel?: string; // Optional custom aria-label
  }>;
  selectedValue: TopicShapeType | StrokeStyle | LineType | undefined;
  onSelect: (value: TopicShapeType | StrokeStyle | LineType | undefined) => void;
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
      {styles.map((style, index) => {
        const labelText = getLabelText(style.label);
        const tooltipContent = style.tooltip || style.label;
        // Use custom aria-label if provided, otherwise construct from label + suffix
        const ariaLabel =
          style.ariaLabel || (ariaLabelSuffix ? `${labelText}${ariaLabelSuffix}` : labelText);

        const isSelected = selectedValue === style.type;

        return (
          <Tooltip key={style.type ?? `default-${index}`} title={tooltipContent}>
            <StyledButton
              selected={isSelected}
              onClick={() => onSelect(style.type)}
              aria-label={ariaLabel}
            >
              {style.icon}
            </StyledButton>
          </Tooltip>
        );
      })}
    </StyledGrid>
  );
};

export default IconCollection;
