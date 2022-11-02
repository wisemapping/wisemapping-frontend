import { Point, ElementClass } from '@wisemapping/web2d';
import IconGroup from './IconGroup';
import SizeType from './SizeType';

interface Icon {
  getElement(): ElementClass;

  setGroup(group: IconGroup);

  getGroup(): IconGroup;

  getSize(): SizeType;

  getPosition(): Point;

  addEvent(type: string, fnc): void;

  remove(): void;

  getModel();
}

export default Icon;
