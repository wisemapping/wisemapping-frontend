/*
 *    Copyright [2015] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import $ from '@libraries/jquery-2.1.0';
import { $assert, $defined } from '@wisemapping/core-js';
import Events from '../Events';
import RootedTreeSet from './RootedTreeSet';
import OriginalLayout from './OriginalLayout';
import ChangeEvent from './ChangeEvent';

class LayoutManager extends Events {
  constructor(rootNodeId, rootSize) {
    super();
    $assert($defined(rootNodeId), 'rootNodeId can not be null');
    $assert(rootSize, 'rootSize can not be null');
    var position = position || { x: 0, y: 0 };

    this._treeSet = new RootedTreeSet();
    this._layout = new OriginalLayout(this._treeSet);

    const rootNode = this._layout.createNode(rootNodeId, rootSize, position, 'root');
    this._treeSet.setRoot(rootNode);
    this._events = [];
  }

  /**
       * @param id
       * @param size
       * @throws will throw an error if id is null or undefined
       */
  updateNodeSize(id, size) {
    $assert($defined(id), 'id can not be null');

    const node = this._treeSet.find(id);
    node.setSize(size);
  }

  /**
       * @param id
       * @param value
       * @throws will throw an error if id is null or undefined
       * @throws will throw an error if value is null or undefined
       * @return this
       */
  updateShrinkState(id, value) {
    $assert($defined(id), 'id can not be null');
    $assert($defined(value), 'value can not be null');

    const node = this._treeSet.find(id);
    node.setShrunken(value);

    return this;
  }

  /**
       * @param id
       * @return {@link RootedTreeSet}.find(id)
       */
  find(id) {
    return this._treeSet.find(id);
  }

  /**
       * @param id
       * @param position
       * @throws will throw an error if id is null or undefined
       * @throws will throw an error if position is null or undefined
       * @throws will throw an error if the position's x property is null or undefined
       * @throws will throw an error if the position's y property is null or undefined
       */
  moveNode(id, position) {
    $assert($defined(id), 'id cannot be null');
    $assert($defined(position), 'position cannot be null');
    $assert($defined(position.x), 'x can not be null');
    $assert($defined(position.y), 'y can not be null');

    const node = this._treeSet.find(id);
    // @Todo: this should not be here. This is broking the isolated node support...
    //        node.setFree(true);
    //        node.setFreeDisplacement({x:position.x - node.getPosition().x, y:position.y - node.getPosition().y});
    node.setPosition(position);
  }

  /**
       * @param parentId
       * @param childId
       * @param order
       * @throws will throw an error if parentId is null or undefined
       * @throws will throw an error if childId is null or undefined
       * @throws will throw an error if order is null or undefined
       * @return this
       */
  connectNode(parentId, childId, order) {
    $assert($defined(parentId), 'parentId cannot be null');
    $assert($defined(childId), 'childId cannot be null');
    $assert($defined(order), 'order cannot be null');

    this._layout.connectNode(parentId, childId, order);

    return this;
  }

  /**
       * @param id
       * @throws will throw an error if id is null or undefined
       * @return this
       */
  disconnectNode(id) {
    $assert($defined(id), 'id can not be null');
    this._layout.disconnectNode(id);

    return this;
  }

  /**
       * @param id
       * @param size
       * @param position
       * @throws will throw an error if id is null or undefined
       * @return this
       */
  addNode(id, size, position) {
    $assert($defined(id), 'id can not be null');
    const result = this._layout.createNode(id, size, position, 'topic');
    this._treeSet.add(result);

    return this;
  }

  /**
       * removes a node and its connection to parent if existing
       * @param id
       * @throws will throw an error if id is null or undefined
       * @return this
       */
  removeNode(id) {
    $assert($defined(id), 'id can not be null');
    const node = this._treeSet.find(id);

    // Is It connected ?
    if (this._treeSet.getParent(node)) {
      this.disconnectNode(id);
    }

    // Remove the all the branch ...
    this._treeSet.remove(id);

    return this;
  }

  /**
       * @param {Number} parentId
       * @param {Number=} nodeId
       * @param {String=} position the position to use as mindplot.layout.Node.properties position
       * property as '(x,y)'
       * @param {Boolean=} free true specifies free node positioning
       * @throws will throw an error if parentId is null or undefined
       */
  predict(parentId, nodeId, position, free) {
    $assert($defined(parentId), 'parentId can not be null');

    const parent = this._treeSet.find(parentId);
    const node = nodeId ? this._treeSet.find(nodeId) : null;
    const sorter = parent.getSorter();

    const result = sorter.predict(this._treeSet, parent, node, position, free);
    return { order: result[0], position: result[1] };
  }

  /**
       * logs dump to console
       */
  dump() {
    console.log(this._treeSet.dump());
  }

  /**
       * @param containerId
       * @param {width:Number, height:Number} size
       * @throws will throw an error if containerId is null or undefined
       * @return canvas
       */
  plot(containerId, size) {
    // this method is only used from tests that include Raphael
    if (!global.Raphael) {
      console.warn('Raphael.js not found, exiting plot()');
      return null;
    }
    $assert(containerId, 'containerId cannot be null');
    size = size || { width: 200, height: 200 };
    const squaresize = 10;
    const canvas = global.Raphael(containerId, size.width, size.height);
    canvas.drawGrid(
      0,
      0,
      size.width,
      size.height,
      size.width / squaresize,
      size.height / squaresize,
    );
    this._treeSet.plot(canvas);

    return canvas;
  }

  /**
       * initializes the layout to be updated
       * @param fireEvents
       * @return this
       */
  layout(fireEvents) {
    // File repositioning ...
    this._layout.layout();

    // Collect changes ...
    this._collectChanges();

    if ($(fireEvents).length > 0 || fireEvents) {
      this._flushEvents();
    }

    return this;
  }

  _flushEvents() {
    this._events.forEach(((event) => {
      this.fireEvent('change', event);
    }));
    this._events = [];
  }

  _collectChanges(nodes) {
    if (!nodes) {
      nodes = this._treeSet.getTreeRoots();
    }

    nodes.forEach(((node) => {
      if (node.hasOrderChanged() || node.hasPositionChanged()) {
        // Find or create a event ...
        const id = node.getId();
        let event = this._events.some((e) => e.id === id);
        if (!event) {
          event = new ChangeEvent(id);
        }

        // Update nodes ...
        event.setOrder(node.getOrder());
        event.setPosition(node.getPosition());

        node.resetPositionState();
        node.resetOrderState();
        node.resetFreeState();
        this._events.push(event);
      }
      this._collectChanges(this._treeSet.getChildren(node));
    }));
  }
}

export default LayoutManager;
