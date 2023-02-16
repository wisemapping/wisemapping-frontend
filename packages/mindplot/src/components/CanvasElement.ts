import Canvas from './Canvas';

interface CanvasElement {
  addToWorkspace(workspace: Canvas): void;

  removeFromWorkspace(workspace: Canvas): void;
}

export default CanvasElement;
