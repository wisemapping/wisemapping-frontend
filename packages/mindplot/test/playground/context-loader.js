const TestSuite = require('./TestSuite').default;
const BalancedTestSuite = require('./BalancedTestSuite').default;
const SymmetricTestSuite = require('./SymmetricTestSuite').default;
const FreeTestSuite = require('./FreeTestSuite').default;

window.addEventListener('DOMContentLoaded', function () {
    var basicTest = new TestSuite();
    var balancedTest = new BalancedTestSuite();
    var symmetricTest = new SymmetricTestSuite();
    var freeTest = new FreeTestSuite();
});
