import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';

const getStyle = (value) => {
  return css(value);
};

function useClasses<T>(stylesElement: T): T {
  const theme = useTheme();
  const rawClasses = typeof stylesElement === 'function' ? stylesElement(theme) : stylesElement;
  const prepared = {};

  Object.entries(rawClasses).forEach(([key, value]) => {
    prepared[key] = getStyle(value);
  });

  return prepared as T;
}

export default useClasses;
