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

const IMindmap = new Class(/** @lends IMindmap */{
  /**
     * @constructs
     * @abstract
     */
  initialize() {
    throw 'Unsupported operation';
  },

  /** */
  getCentralTopic() {
    return this.getBranches()[0];
  },

  /** @abstract */
  getDescription() {
    throw 'Unsupported operation';
  },

  /** @abstract */
  setDescription(value) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  getId() {
    throw 'Unsupported operation';
  },

  /** @abstract */
  setId(id) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  getVersion() {
    throw 'Unsupported operation';
  },

  /** @abstract */
  setVersion(version) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  addBranch(nodeModel) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  getBranches() {
    throw 'Unsupported operation';
  },

  /** @abstract */
  removeBranch(node) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  getRelationships() {
    throw 'Unsupported operation';
  },

  /**
     * @param parent
     * @param child
     * @throws will throw an error if child already has a connection to a parent node
     */
  connect(parent, child) {
    // Child already has a parent ?
    $assert(!child.getParent(), 'Child model seems to be already connected');

    //  Connect node...
    parent.append(child);

    // Remove from the branch ...
    this.removeBranch(child);
  },

  /**
     * @param child
     * @throws will throw an error if child is null or undefined
     * @throws will throw an error if child's parent cannot be found
     */
  disconnect(child) {
    const parent = child.getParent();
    $assert(child, 'Child can not be null.');
    $assert(parent, 'Child model seems to be already connected');

    parent.removeChild(child);
    this.addBranch(child);
  },

  /** @abstract */
  hasAlreadyAdded(node) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  createNode(type, id) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  createRelationship(fromNode, toNode) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  addRelationship(rel) {
    throw 'Unsupported operation';
  },

  /** @abstract */
  deleteRelationship(relationship) {
    throw 'Unsupported operation';
  },

  /** */
  inspect() {
    let result = '';
    result = '{ ';

    const branches = this.getBranches();
    result = `${result}version:${this.getVersion()}`;
    result = `${result} , [`;

    for (let i = 0; i < branches.length; i++) {
      const node = branches[i];
      if (i != 0) {
        result = `${result},\n `;
      }
      result = `${result}(${i}) =>${node.inspect()}`;
    }
    result = `${result}]`;

    result = `${result} } `;
    return result;
  },

  /**
     * @param target
     */
  copyTo(target) {
    const source = this;
    const version = source.getVersion();
    target.setVersion(version);

    const desc = this.getDescription();
    target.setDescription(desc);

    // Then the rest of the branches ...
    const sbranchs = source.getBranches();
    _.each(sbranchs, (snode) => {
      const tnode = target.createNode(snode.getType(), snode.getId());
      snode.copyTo(tnode);
      target.addBranch(tnode);
    });
  },
});

export default IMindmap;
