/* eslint-disable no-console */
/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
// jQuery removed - using native DOM APIs
import { $assert } from '@wisemapping/web2d';
import LayoutManager from '../../../../src/components/layout/LayoutManager';
import ChildrenSorterStrategy from '../../../../src/components/layout/ChildrenSorterStrategy';

class TestSuite extends ChildrenSorterStrategy {
  constructor() {
    super();
    document.getElementById('basicTest').style.display = 'block';
    //        this.testAligned();
    this.testBaselineAligned1();
    this.testBaselineAligned2();
    this.testEvents();
    this.testEventsComplex();
    this.testDisconnect();
    this.testReconnect();
    this.testRemoveNode();
    this.testSize();
    this.testReconnectSingleNode();
  }

  testAligned() {
    console.log('testAligned:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, TestSuite.NODE_SIZE, position).connectNode(1, 2, 0);
    manager.addNode(3, TestSuite.NODE_SIZE, position).connectNode(2, 3, 0);
    manager.addNode(4, TestSuite.NODE_SIZE, position).connectNode(3, 4, 0);
    manager.addNode(5, TestSuite.NODE_SIZE, position).connectNode(0, 5, 2);
    manager.addNode(6, TestSuite.NODE_SIZE, position).connectNode(0, 6, 4);
    manager.addNode(7, TestSuite.NODE_SIZE, position).connectNode(0, 7, 6);

    manager.layout();
    manager.plot('testAligned', { width: 1200, height: 200 });

    // Child nodes should be vertically aligned
    $assert(
      manager.find(1).getPosition().y == manager.find(2).getPosition().y,
      'Child nodes are not vertically aligned',
    );
    $assert(
      manager.find(1).getPosition().y == manager.find(3).getPosition().y,
      'Child nodes are not vertically aligned',
    );
    $assert(
      manager.find(1).getPosition().y == manager.find(4).getPosition().y,
      'Child nodes are not vertically aligned',
    );

    // Siblings should be horizontally aligned
    $assert(
      manager.find(1).getPosition().x == manager.find(5).getPosition().x,
      'Sibling nodes are not horizontally aligned',
    );
    $assert(
      manager.find(1).getPosition().x == manager.find(6).getPosition().x,
      'Sibling nodes are not horizontally aligned',
    );
    $assert(
      manager.find(1).getPosition().x == manager.find(7).getPosition().x,
      'Sibling nodes are not horizontally aligned',
    );

    console.log('OK!\n\n');
  }

  testBaselineAligned1() {
    console.log('testBaselineAligned1:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(3, TestSuite.NODE_SIZE, position).connectNode(1, 3, 0);
    manager.addNode(5, TestSuite.NODE_SIZE, position).connectNode(3, 5, 0);
    manager.addNode(6, { width: 140, height: 130 }, position).connectNode(3, 6, 1);
    manager.addNode(7, TestSuite.NODE_SIZE, position).connectNode(6, 7, 0);
    manager.addNode(8, TestSuite.NODE_SIZE, position).connectNode(7, 8, 0);
    manager.addNode(9, TestSuite.NODE_SIZE, position).connectNode(7, 9, 1);
    manager.addNode(10, TestSuite.NODE_SIZE, position).connectNode(7, 10, 2);
    manager.addNode(11, TestSuite.NODE_SIZE, position).connectNode(7, 11, 3);
    manager.addNode(12, TestSuite.NODE_SIZE, position).connectNode(7, 12, 4);
    manager.addNode(13, TestSuite.NODE_SIZE, position).connectNode(7, 13, 5);
    manager.addNode(14, TestSuite.NODE_SIZE, position).connectNode(7, 14, 6);
    manager.addNode(15, TestSuite.NODE_SIZE, position).connectNode(7, 15, 7);
    manager.addNode(16, TestSuite.NODE_SIZE, position).connectNode(7, 16, 8);
    manager.addNode(17, TestSuite.NODE_SIZE, position).connectNode(7, 17, 9);
    manager.addNode(29, TestSuite.NODE_SIZE, position).connectNode(6, 29, 1);
    manager.addNode(30, TestSuite.NODE_SIZE, position).connectNode(6, 30, 2);
    manager.addNode(31, { width: 100, height: 50 }, position).connectNode(6, 31, 3);

    manager.addNode(4, TestSuite.NODE_SIZE, position).connectNode(1, 4, 1);
    manager.addNode(18, { width: 80, height: 70 }, position).connectNode(4, 18, 0);
    manager.addNode(19, TestSuite.NODE_SIZE, position).connectNode(18, 19, 0);
    manager.addNode(20, TestSuite.NODE_SIZE, position).connectNode(19, 20, 0);
    manager.addNode(21, TestSuite.NODE_SIZE, position).connectNode(20, 21, 0);

    manager.addNode(2, TestSuite.NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(22, TestSuite.NODE_SIZE, position).connectNode(2, 22, 0);
    manager.addNode(24, TestSuite.NODE_SIZE, position).connectNode(22, 24, 0);

    manager.addNode(23, { width: 80, height: 50 }, position).connectNode(2, 23, 1);
    manager.addNode(25, { width: 80, height: 40 }, position).connectNode(23, 25, 0);
    manager.addNode(26, { width: 80, height: 80 }, position).connectNode(25, 26, 0);
    manager.addNode(27, TestSuite.NODE_SIZE, position).connectNode(26, 27, 0);
    manager.addNode(28, { width: 80, height: 80 }, position).connectNode(27, 28, 0);

    //        manager.layout();
    //        manager.plot("testBaselineAligned1", {width:1600,height:800});

    console.log('OK!\n\n');
  }

  testBaselineAligned2() {
    console.log('testBaselineAligned2:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, { width: 130, height: 200 }, position).connectNode(1, 2, 0);
    manager.addNode(3, TestSuite.NODE_SIZE, position).connectNode(2, 3, 0);
    manager.addNode(4, TestSuite.NODE_SIZE, position).connectNode(2, 4, 1);
    manager.addNode(5, TestSuite.NODE_SIZE, position).connectNode(2, 5, 2);
    manager.addNode(6, TestSuite.NODE_SIZE, position).connectNode(2, 6, 3);

    manager.layout();
    manager.plot('testBaselineAligned2', { width: 1600, height: 800 });

    console.log('OK!\n\n');
  }

  testEvents() {
    console.log('testEvents:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, { x: 0, y: 60 });
    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(1, 3, 0);

    let events = [];
    manager.addEvent('change', (event) => {
      console.log(
        `\tUpdated nodes: {id:${event.getId()} order: ${event.getOrder()}position: {${
          event.getPosition().x
        }${event.getPosition().y}}`,
      );
      events.push(event);
    });
    manager.layout(true);
    manager.plot('testEvents1', { width: 800, height: 200 });

    console.log('\t--- Layout without changes should not affect the tree  ---');
    events = [];
    manager.layout(true);
    manager.plot('testEvents2', { width: 800, height: 200 });

    // Check no events where fired
    $assert(events.length === 0, 'Unnecessary tree updated.');

    console.log('OK!\n\n');
  }

  testEventsComplex() {
    console.log('testEventsComplex:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, { x: 0, y: 60 });
    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(0, 3, 2);
    manager.connectNode(3, 4, 0);
    manager.connectNode(3, 5, 1);

    let events = [];
    manager.addEvent('change', (event) => {
      console.log(
        `\tUpdated nodes: {id:${event.getId()} order: ${event.getOrder()}position: {${
          event.getPosition().x
        }${event.getPosition().y}}`,
      );
      events.push(event);
    });

    manager.layout(true);
    manager.plot('testEventsComplex1', { width: 800, height: 200 });

    console.log('\t--- Connect a new node  ---');

    events = [];
    manager.connectNode(3, 6, 2);
    manager.layout(true);
    manager.plot('testEventsComplex2', { width: 800, height: 200 });

    // Check only 4 nodes were repositioned

    console.log(events.length);

    $assert(events.length == 4, 'Only 4 nodes should be repositioned.');

    console.log('OK!\n\n');
  }

  testDisconnect() {
    console.log('testDisconnect:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 1, 0);
    manager.connectNode(1, 2, 0);
    manager.connectNode(1, 3, 1);
    manager.connectNode(1, 4, 2);
    manager.connectNode(4, 5, 0);
    manager.connectNode(5, 6, 0);
    manager.connectNode(5, 7, 1);

    let events = [];
    manager.addEvent('change', (event) => {
      const pos = event.getPosition();
      const posStr = pos ? `,position: {${pos.x}${pos.y}` : '';
      const node = manager.find(event.getId());
      console.log(`\tUpdated nodes: {id:${event.getId()} order: ${event.getOrder()}${posStr}}`);
      events.push(event);
    });
    manager.layout(true);
    manager.plot('testDisconnect1', { width: 1200, height: 400 });

    console.log('--- Disconnect node 2 ---');
    events = [];
    manager.disconnectNode(2);
    manager.layout(true);
    manager.plot('testDisconnect2', { width: 1200, height: 400 });

    // Check that orders have been shifted accordingly
    $assert(manager.find(2).getOrder() == 0, 'Node 2 should have order 0');
    $assert(manager.find(3).getOrder() == 0, 'Node 3 should now have order 0');
    $assert(manager.find(4).getOrder() == 1, 'Node 4 should have order 1');

    console.log('--- Disconnect node 4 ---');
    manager.disconnectNode(4);
    manager.layout(true);
    manager.plot('testDisconnect3', { width: 1200, height: 400 });

    // Check that nodes 1 and 3 are now vertically aligned
    $assert(
      manager.find(1).getPosition().y == manager.find(3).getPosition().y,
      'Nodes 1 and 3 should now be vertically aligned',
    );

    console.log('OK!\n\n');
  }

  testReconnect() {
    console.log('testReconnect:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);
    manager.addNode(12, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(0, 3, 2);
    manager.connectNode(0, 4, 3);
    manager.connectNode(0, 5, 4);
    manager.connectNode(1, 6, 0);
    manager.connectNode(1, 7, 1);
    manager.connectNode(7, 8, 0);
    manager.connectNode(8, 9, 0);
    manager.connectNode(5, 10, 0);
    manager.connectNode(6, 11, 0);
    manager.connectNode(6, 12, 1);

    manager.layout();
    manager.plot('testReconnect1', { width: 1200, height: 400 });

    // Reconnect node 6 to node 4
    console.log('\tReconnect node 6 to node 4');
    manager.disconnectNode(6);
    manager.connectNode(4, 6, 0);
    manager.layout();
    manager.plot('testReconnect2', { width: 1200, height: 400 });

    // Check nodes are left aligned correctly
    $assert(
      manager.find(1).getPosition().y == manager.find(7).getPosition().y,
      'Nodes 1 and 7 should be vertically aligned',
    );
    $assert(
      manager.find(4).getPosition().y == manager.find(6).getPosition().y,
      'Nodes 4 and 6 should be vertically aligned',
    );
    $assert(
      manager.find(4).getPosition().x > manager.find(6).getPosition().x,
      'Node 6 and their children should be to the left of node 4',
    );
    $assert(
      manager.find(6).getPosition().x > manager.find(11).getPosition().x &&
        manager.find(11).getPosition().x == manager.find(12).getPosition().x,
      'Nodes 11 and 12 should be to the left of node 6 and horizontally aligned',
    );

    console.log('OK!\n\n');
  }

  testRemoveNode() {
    console.log('testRemoveNode:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    // Prepare a sample graph ...
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 5, 1);
    manager.connectNode(0, 6, 2);
    manager.connectNode(0, 7, 3);
    manager.connectNode(0, 8, 4);
    manager.connectNode(0, 9, 5);
    manager.connectNode(1, 2, 0);
    manager.connectNode(1, 3, 1);
    manager.connectNode(3, 4, 0);

    const events = [];
    manager.addEvent('change', (event) => {
      const pos = event.getPosition();
      const posStr = pos ? `,position: {${pos.x}${event.getPosition().y}` : '';
      events.push(event);
    });
    manager.layout(true);
    manager.plot('testRemoveNode1', { width: 1000, height: 200 });

    console.log('\t--- Remove node 3  ---');
    manager.removeNode(3);
    manager.layout(true);
    manager.plot('testRemoveNode2', { width: 1000, height: 200 });

    // Check nodes are correctly aligned and node 6 is aligned with the root node
    $assert(
      manager.find(1).getPosition().y == manager.find(2).getPosition().y,
      'Nodes 1 and 2 should be vertically algined',
    );
    $assert(
      manager.find(6).getPosition().y == manager.find(0).getPosition().y,
      'Node 6 should be aligned to the root node',
    );

    console.log('\t--- Remove node 6  ---');
    manager.removeNode(6);
    manager.layout(true);
    manager.plot('testRemoveNode3', { width: 1000, height: 200 });

    // Check orders were shifted accordingly
    $assert(manager.find(8).getOrder() == 2, 'Node 8 should have order 2');

    console.log('\t--- Remove node 5  ---');
    manager.removeNode(5);
    manager.layout(true);
    manager.plot('testRemoveNode4', { width: 1000, height: 200 });

    // Check orders were shifted accordingly
    $assert(manager.find(7).getOrder() == 1, 'Node 7 should have order 1');
    $assert(manager.find(9).getOrder() == 3, 'Node 9 should have order 3');

    console.log('OK!\n\n');
  }

  testSize() {
    console.log('testSize:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, { width: 60, height: 60 }, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, { width: 260, height: 30 }, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(7, { width: 80, height: 80 }, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, { width: 30, height: 30 }, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);
    manager.addNode(12, { width: 100, height: 70 }, position);
    manager.addNode(13, TestSuite.NODE_SIZE, position);
    manager.addNode(14, TestSuite.NODE_SIZE, position);
    manager.addNode(15, TestSuite.NODE_SIZE, position);
    manager.addNode(16, TestSuite.NODE_SIZE, position);
    manager.addNode(17, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0);
    manager.connectNode(1, 16, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(0, 3, 2);
    manager.connectNode(0, 4, 3);
    manager.connectNode(0, 5, 4);
    manager.connectNode(4, 7, 0);
    manager.connectNode(7, 15, 0);
    manager.connectNode(7, 17, 1);
    manager.connectNode(4, 8, 1);
    manager.connectNode(8, 9, 0);
    manager.connectNode(3, 10, 0);
    manager.connectNode(3, 11, 1);
    manager.connectNode(9, 12, 0);
    manager.connectNode(9, 13, 1);
    manager.connectNode(13, 14, 0);

    manager.layout();
    manager.plot('testSize1', { width: 1400, height: 400 });

    // Check that all enlarged nodes shift children accordingly
    $assert(
      manager.find(10).getPosition().x > manager.find(3).getPosition().x &&
        manager.find(10).getPosition().x == manager.find(11).getPosition().x,
      'Nodes 10 and 11 should be horizontally algined and to the right of enlarged node 3',
    );
    const xPosNode7 = manager.find(7).getPosition().x;
    const xPosNode8 = manager.find(8).getPosition().x;

    manager.updateNodeSize(4, { width: 100, height: 30 });
    manager.layout();
    manager.plot('testSize2', { width: 1400, height: 400 });

    // Check that all enlarged nodes shift children accordingly
    $assert(
      manager.find(2).getPosition().x - manager.find(4).getPosition().x == 10,
      'Node 4 should have been shifted by 10',
    );
    $assert(
      xPosNode7 - manager.find(7).getPosition().x == 20,
      'Node 7 should have been shifted by 20',
    );
    $assert(
      xPosNode8 - manager.find(8).getPosition().x == 20,
      'Node 8 should have been shifted by 20',
    );

    const graph2 = manager.plot('testSize3', { width: 1400, height: 400 });
    this._plotPrediction(graph2, manager.predict(0, null, { x: -145, y: 400 }));
    this._plotPrediction(graph2, manager.predict(9, null, { x: -330, y: 70 }));
    this._plotPrediction(graph2, manager.predict(9, null, { x: -330, y: 120 }));
    this._plotPrediction(graph2, manager.predict(0, null, { x: 15, y: 20 }));
    // TODO(gb): make asserts

    const graph3 = manager.plot('testSize4', { width: 1400, height: 400 });
    this._plotPrediction(graph3, manager.predict(0, null, null));
    this._plotPrediction(graph3, manager.predict(9, null, null));
    this._plotPrediction(graph3, manager.predict(3, null, null));
    this._plotPrediction(graph3, manager.predict(1, null, null));
    // TODO(gb): make asserts

    const yPosNode2 = manager.find(2).getPosition().y;
    manager.updateNodeSize(7, { width: 80, height: 120 });
    manager.layout();
    manager.plot('testSize5', { width: 1400, height: 400 });

    // Check that all enlarged nodes shift children accordingly
    $assert(
      yPosNode2 - manager.find(2).getPosition().y == 20,
      'Node 2 should have been shifted by 20',
    );

    console.log('OK!\n\n');
  }

  testReconnectSingleNode() {
    console.log('testReconnectSingleNode:');
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    // Prepare a sample graph ...
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 1, 0);
    manager.layout();
    const graph = manager.plot('testReconnectSingleNode1', { width: 1000, height: 400 });
    const prediction = manager.predict(0, null, { x: -50, y: 0 });
    this._plotPrediction(graph, prediction);

    // Check prediction is to the left of the root node
    $assert(
      prediction.position.x < manager.find(0).getPosition().x,
      'Prediction should be to the left of the root node',
    );
    $assert(prediction.order == 1, 'Prediction should have order 1');

    manager.disconnectNode(1);
    manager.connectNode(0, 1, 1);
    manager.layout();
    manager.plot('testReconnectSingleNode2', { width: 1000, height: 400 });

    // Check reconnected node is to the left of the root node
    $assert(
      manager.find(1).getPosition().x < manager.find(0).getPosition().x,
      'Node 1 should now be to the left of the root node',
    );
    $assert(manager.find(1).getOrder() == 1, 'Node 1 should now have order 0');
  }

  _plotPrediction(canvas, prediction) {
    if (!canvas) {
      console.warn('no canvas in _plotPrediction. Remove this method if plot() not in use');
      return;
    }
    const { position } = prediction;
    const { order } = prediction;
    console.log(`\t\tprediction {order:${order} position: (${position.x}${position.y})}`);
    const cx = position.x + canvas.width / 2 - TestSuite.NODE_SIZE.width / 2;
    const cy = position.y + canvas.height / 2 - TestSuite.NODE_SIZE.height / 2;
    canvas.rect(cx, cy, TestSuite.NODE_SIZE.width, TestSuite.NODE_SIZE.height);
  }
}

TestSuite.NODE_SIZE = { width: 80, height: 30 };
TestSuite.ROOT_NODE_SIZE = { width: 120, height: 40 };

export default TestSuite;
