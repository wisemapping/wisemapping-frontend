const Mindplot = require('../../lib/mindplot');
global.mindplot = Mindplot();

const TestSuite = require('./lib/TestSuite').default;
const BalancedTestSuite = require('./lib/BalancedTestSuite').default;
const SymmetricTestSuite = require('./lib/SymmetricTestSuite').default;
const FreeTestSuite = require('./lib/FreeTestSuite').default;

window.addEventListener('DOMContentLoaded', function () {
    var basicTest = new TestSuite();
    var balancedTest = new BalancedTestSuite();
    var symmetricTest = new SymmetricTestSuite();
    var freeTest = new FreeTestSuite();
});
