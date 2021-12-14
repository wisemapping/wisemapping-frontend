import $ from 'jquery';
import { Designer, LocalStorageManager } from '../../src';

// FIXME: The tests Map could not be loaded.
describe.skip('Designer test suite', () => {
  let designer;

  beforeAll(() => {
    /*: DOC += <div id="mindplot"></div> */
    const mapId = 'welcome';
    const editorProperties = { zoom: 0.7, size: { width: '1366px', height: '768px' }, locale: 'en' };

    // Initialize message logger ...
    const container = $("<div id='mindplot'></div>");
    $('body').append(container);

    // Initialize Editor ...
    const screenWidth = window.width;
    let screenHeight = window.height;

    // Positionate node ...
    // header - footer
    screenHeight = screenHeight - 90 - 61;

    // body margin ...
    editorProperties.width = screenWidth;
    editorProperties.height = screenHeight;

    designer = new Designer(editorProperties, container);

    // Load map from XML file persisted on disk...
    const pathXML = 'test/resources/welcome.xml';
    const persistence = new LocalStorageManager(pathXML);
    const mindmap = persistence.load(mapId);
    designer.loadMap(mindmap);

    /* // Save map on load ....
     if (editorProperties.saveOnLoad)
     {
     var saveOnLoad = function() {
     designer.save(function() {
     }, false);
     }.delay(1000)
     } */
  });

  test('testWorkspaceBuild', () => {
    const mind = document.querySelector('#mindplot');
    expect(mind).not.toBeNull();
    expect(mind).not.toBeUndefined();
  });
  /*
   * it('testCentralTopicPresent', () => {
    const centralTopic = designer.getMindmap().getCentralTopic();
    expect($defined(centralTopic)).toBe(true);
    const position = centralTopic.getPosition();
    expect(position.x).toEqual(0);
    expect(position.y).toEqual(0);
  });
   * it("testCentralTopicPresent", function(){
        var centralTopic = designer.getMindmap().getCentralTopic();
        expect($defined(centralTopic)).toBe(true);
        var target = designer.getWorkSpace().getScreenManager().getContainer();
        var size = designer.getModel().getTopics().length;
        fireNativeEvent('dblclick',target,new web2d.Point(50,50));
        assertEquals(size+1, designer.getModel().getTopics().length);
    });
    */
});
