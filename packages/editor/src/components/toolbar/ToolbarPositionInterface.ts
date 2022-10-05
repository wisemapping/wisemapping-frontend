/**
 * Configure position of a toolbar
 */
export default interface ToolbarPosition {
  /**
   * if true, first level will be displayed in vertical orientation
   */
  vertical?: boolean;
  position?: {
    /**
     * css properties for appbar rigth
     */
    right: string;
    /**
     * css properties for appbar top
     */
    top: string;
  };
}

export const defaultPosition: ToolbarPosition = {
  vertical: true,
  position: {
    right: '50px',
    top: '100px',
  },
};

export const horizontalPosition = {
  position: {
    right: '50px',
    top: '90%',
  },
  vertical: false,
};
