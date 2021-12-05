import TestSuite from './TestSuite';
import BalancedTestSuite from './BalancedTestSuite';
import SymmetricTestSuite from './SymmetricTestSuite';
import FreeTestSuite from './FreeTestSuite';
import Raphael from './lib/raphael-min';
import { drawGrid } from './lib/raphael-plugins';

global.Raphael = Raphael;
global.Raphael.fn.drawGrid = drawGrid;

window.addEventListener('DOMContentLoaded', () => {
    new TestSuite();
    new BalancedTestSuite();
    new SymmetricTestSuite();
    new FreeTestSuite();
});
