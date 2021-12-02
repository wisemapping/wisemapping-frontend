let designer = null;
/*: DOC += <div id="mindplot"></div> */
const mapId = '1';
const mapXml = '<map name="1" version="pela"><topic central="true" text="test" id="1"><topic position="103,-52" order="" id="2"/><topic position="-134,-75" order="" id="3"/><topic position="-126,5" order="" id="4"/><topic position="-115,53" order="" id="5"/><topic position="-136,-35" order="" id="6"/></topic></map>';
const editorProperties = { zoom: 0.7, size: { width: '1366px', height: '768px' } };
const buildMindmapDesigner = function () {
  // Initialize message logger ...
  const container = $('<div id="mindplot"></div>');
  $('body').append(container);

  // Initialize Editor ...
  var window = $(window);
  const screenWidth = window.width();
  let screenHeight = window.height();

  // Positionate node ...
  // header - footer
  screenHeight = screenHeight - 90 - 61;

  // body margin ...
  editorProperties.width = screenWidth;
  editorProperties.height = screenHeight;

  designer = new mindplot.Designer(editorProperties, container);
  // Load map from XML file persisted on disk...
  const persistence = new mindplot.LocalStorageManager('src/test/resources/welcome.xml');
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
};
buildMindmapDesigner();

describe('Designer test suite', () => {
  it('testWorkspaceBuild', () => {
    const mindplot = $(document).find('#mindplot');
    expect(mindplot).not.toBeNull();
    expect(mindplot).not.toBeUndefined();
  });
  it('testCentralTopicPresent', () => {
    const centralTopic = designer.getMindmap().getCentralTopic();
    expect($defined(centralTopic)).toBe(true);
    const position = centralTopic.getPosition();
    expect(position.x).toEqual(0);
    expect(position.y).toEqual(0);
  });
  /* it("testCentralTopicPresent", function(){
        var centralTopic = designer.getMindmap().getCentralTopic();
        expect($defined(centralTopic)).toBe(true);
        var target = designer.getWorkSpace().getScreenManager().getContainer();
        var size = designer.getModel().getTopics().length;
        fireNativeEvent('dblclick',target,new web2d.Point(50,50));
        assertEquals(size+1, designer.getModel().getTopics().length);
    });
    */
});
