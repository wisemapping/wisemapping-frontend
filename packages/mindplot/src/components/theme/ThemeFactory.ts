import NodeModel from '../model/NodeModel';
import ThemeType from '../model/ThemeType';
import ClassicTheme from './ClassicTheme';
import DarkPrismTheme from './DarkPrismTheme';
import PrismTheme from './PrismTheme';
import EnhancedPrismTheme from './EnhancedPrismTheme';
import RobotTheme from './RobotTheme';
import Theme, { ThemeVariant } from './Theme';

class ThemeFactory {
  static createById(id: ThemeType, variant: ThemeVariant): Theme {
    let result: Theme;
    switch (id) {
      case 'classic':
        result = new ClassicTheme(variant);
        break;
      case 'dark-prism':
        result = new DarkPrismTheme(variant);
        break;
      case 'prism':
        result = new PrismTheme(variant);
        break;
      case 'robot':
        result = new RobotTheme(variant);
        break;
      case 'sunrise':
        result = new EnhancedPrismTheme(variant);
        break;
      default: {
        const exhaustiveCheck: never = id;
        throw new Error(exhaustiveCheck);
      }
    }
    return result;
  }

  static create(model: NodeModel, variant: ThemeVariant): Theme {
    const mindmap = model.getMindmap();
    const theme = mindmap.getTheme();
    return ThemeFactory.createById(theme, variant);
  }
}
export default ThemeFactory;
