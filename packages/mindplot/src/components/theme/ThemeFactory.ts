import NodeModel from '../model/NodeModel';
import ThemeType from '../model/ThemeType';
import ClassicTheme from './ClassicTheme';
import DarkPrismTheme from './DarkPrismTheme';
import PrismTheme from './PrismTheme';
import EnhancedPrismTheme from './EnhancedPrismTheme';
import RobotTheme from './RobotTheme';
import Theme, { ThemeVariant } from './Theme';

class ThemeFactory {
  private static prismTheme = new PrismTheme();

  private static darkPrismTheme = new DarkPrismTheme();

  private static classicTheme = new ClassicTheme();

  private static robotTheme = new RobotTheme();

  private static enhancedPrismTheme = new EnhancedPrismTheme();

  static createById(id: ThemeType, _variant?: ThemeVariant): Theme {
    let result: Theme;
    switch (id) {
      case 'classic':
        result = ThemeFactory.classicTheme;
        break;
      case 'dark-prism':
        result = ThemeFactory.darkPrismTheme;
        break;
      case 'prism':
        result = ThemeFactory.prismTheme;
        break;
      case 'robot':
        result = ThemeFactory.robotTheme;
        break;
      case 'sunrise':
        result = ThemeFactory.enhancedPrismTheme;
        break;
      default: {
        const exhaustiveCheck: never = id;
        throw new Error(exhaustiveCheck);
      }
    }
    return result;
  }

  static create(model: NodeModel, variant?: ThemeVariant): Theme {
    const mindmap = model.getMindmap();
    const theme = mindmap.getTheme();
    return ThemeFactory.createById(theme, variant);
  }
}
export default ThemeFactory;
