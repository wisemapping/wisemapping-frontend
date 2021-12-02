import TestSuite from './TestSuite';
import BalancedTestSuite from './BalancedTestSuite';
import SymmetricTestSuite from './SymmetricTestSuite';
import FreeTestSuite from './FreeTestSuite';

window.addEventListener('DOMContentLoaded', () => {
  new TestSuite();
  new BalancedTestSuite();
  new SymmetricTestSuite();
  new FreeTestSuite();
});
