// Stub for ThemeStyle exports used by editor components
import { LineType } from '@wisemapping/mindplot/src/components/ConnectionLine';
import { FontStyleType } from '@wisemapping/mindplot/src/components/FontStyleType';
import { FontWeightType } from '@wisemapping/mindplot/src/components/FontWeightType';
import { TopicShapeType } from '@wisemapping/mindplot/src/components/model/INodeModel';

export type TopicStyleType = {
  borderColor: string | string[];
  borderStyle: string;
  backgroundColor: string | string[];
  connectionColor: string | string[];
  connectionStyle: LineType;
  fontFamily: string;
  fontSize: number;
  fontStyle: FontStyleType;
  fontWeight: FontWeightType;
  fontColor: string;
  msgKey: string;
  shapeType: TopicShapeType;
  outerBackgroundColor: string;
  outerBorderColor: string;
};

export type CanvasStyleType = {
  backgroundColor: string;
  gridColor: string | undefined;
  opacity: number;
  showGrid: boolean;
};

export class ThemeStyle {
  // Mock implementation
}


