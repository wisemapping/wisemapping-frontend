import Designer from '../../src/components/Designer';
import ActionDispatcher from '../../src/components/ActionDispatcher';
import DesignerModel from '../../src/components/DesignerModel';

// Mock dependencies
jest.mock('../../src/components/ActionDispatcher');
jest.mock('../../src/components/DesignerModel');

// Mock jQuery
global.$ = jest.fn(() => ({
  css: jest.fn().mockReturnValue('1000'),
  width: jest.fn().mockReturnValue(1000),
  height: jest.fn().mockReturnValue(800),
  position: jest.fn().mockReturnValue({ left: 0, top: 0 }),
  find: jest.fn().mockReturnValue({
    attr: jest.fn(),
  }),
}));

// Mock ActionDispatcher
const MockedActionDispatcher = ActionDispatcher as jest.MockedClass<typeof ActionDispatcher>;

// Mock DesignerModel
const MockedDesignerModel = DesignerModel as jest.MockedClass<typeof DesignerModel>;

describe('Collapse/Expand All Nodes Tests', () => {
  let designer: Designer;
  let mockActionDispatcher: jest.Mocked<ActionDispatcher>;
  let mockModel: jest.Mocked<DesignerModel>;

  beforeEach(() => {
    // Mock ActionDispatcher instance
    mockActionDispatcher = {
      shrinkBranch: jest.fn(),
    } as any;

    MockedActionDispatcher.getInstance = jest.fn().mockReturnValue(mockActionDispatcher);

    // Mock DesignerModel
    mockModel = {
      getTopics: jest.fn().mockReturnValue([
        { getId: () => 1, getType: () => 'CentralTopic' },
        { getId: () => 2, getType: () => 'MainTopic' },
        { getId: () => 3, getType: () => 'MainTopic' },
        { getId: () => 4, getType: () => 'MainTopic' },
      ]),
      filterSelectedTopics: jest.fn().mockReturnValue([]),
      getZoom: jest.fn().mockReturnValue(1),
    } as any;

    MockedDesignerModel.mockImplementation(() => mockModel);

    // Create Designer instance
    designer = new Designer({
      divContainer: document.createElement('div'),
      mode: 'edition-owner',
      widgetManager: {} as any,
      persistenceManager: {} as any,
      zoom: 1,
      locale: 'en',
    });
  });

  test('should collapse all non-central topics', () => {
    designer.collapseAllNodes();

    expect(mockModel.getTopics).toHaveBeenCalled();
    expect(mockActionDispatcher.shrinkBranch).toHaveBeenCalledWith([2, 3, 4], true);
  });

  test('should expand all non-central topics', () => {
    designer.expandAllNodes();

    expect(mockModel.getTopics).toHaveBeenCalled();
    expect(mockActionDispatcher.shrinkBranch).toHaveBeenCalledWith([2, 3, 4], false);
  });

  test('should handle empty topics list gracefully', () => {
    mockModel.getTopics.mockReturnValue([]);

    designer.collapseAllNodes();
    designer.expandAllNodes();

    expect(mockActionDispatcher.shrinkBranch).not.toHaveBeenCalled();
  });

  test('should handle only central topic gracefully', () => {
    mockModel.getTopics.mockReturnValue([{ getId: () => 1, getType: () => 'CentralTopic' }]);

    designer.collapseAllNodes();
    designer.expandAllNodes();

    expect(mockActionDispatcher.shrinkBranch).not.toHaveBeenCalled();
  });

  test('should filter out central topic correctly', () => {
    mockModel.getTopics.mockReturnValue([
      { getId: () => 1, getType: () => 'CentralTopic' },
      { getId: () => 2, getType: () => 'MainTopic' },
      { getId: () => 3, getType: () => 'CentralTopic' }, // Another central topic
      { getId: () => 4, getType: () => 'MainTopic' },
      { getId: () => 5, getType: () => 'SubTopic' },
    ]);

    designer.collapseAllNodes();

    expect(mockActionDispatcher.shrinkBranch).toHaveBeenCalledWith([2, 4, 5], true);
  });

  test('should handle mixed topic types correctly', () => {
    mockModel.getTopics.mockReturnValue([
      { getId: () => 1, getType: () => 'CentralTopic' },
      { getId: () => 2, getType: () => 'MainTopic' },
      { getId: () => 3, getType: () => 'SubTopic' },
      { getId: () => 4, getType: () => 'FreeTopic' },
      { getId: () => 5, getType: () => 'CentralTopic' },
    ]);

    designer.expandAllNodes();

    expect(mockActionDispatcher.shrinkBranch).toHaveBeenCalledWith([2, 3, 4], false);
  });
});
