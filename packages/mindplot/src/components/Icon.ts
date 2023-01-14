import { Point, ElementClass, Group } from '@wisemapping/web2d';
import IconGroup from './IconGroup';
import FeatureModel from './model/FeatureModel';
import SizeType from './SizeType';

interface Icon {
  getElement(): ElementClass;

  setGroup(group: IconGroup): Group;

  getGroup(): IconGroup | null;

  getSize(): SizeType;

  getPosition(): Point;

  addEvent(type: string, fnc: () => void): void;

  remove(): void;

  getModel(): FeatureModel;
}

export default Icon;
