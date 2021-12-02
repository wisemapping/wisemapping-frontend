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
import ConnectionLine from '../ConnectionLine';

const RelationshipModel = new Class(
  /** @lends RelationshipModel */ {
    /**
         * @constructs
         * @param sourceTopicId
         * @param targetTopicId
         * @throws will throw an error if sourceTopicId is null or undefined
         * @throws will throw an error if targetTopicId is null or undefined
         */
    initialize(sourceTopicId, targetTopicId) {
      $assert($defined(sourceTopicId), 'from node type can not be null');
      $assert($defined(targetTopicId), 'to node type can not be null');

      this._id = RelationshipModel._nextUUID();
      this._sourceTargetId = sourceTopicId;
      this._targetTopicId = targetTopicId;
      this._lineType = ConnectionLine.SIMPLE_CURVED;
      this._srcCtrlPoint = null;
      this._destCtrlPoint = null;
      this._endArrow = true;
      this._startArrow = false;
    },

    /** */
    getFromNode() {
      return this._sourceTargetId;
    },

    /** */
    getToNode() {
      return this._targetTopicId;
    },

    /** */
    getId() {
      $assert(this._id, 'id is null');
      return this._id;
    },

    /** */
    getLineType() {
      return this._lineType;
    },

    /** */
    setLineType(lineType) {
      this._lineType = lineType;
    },

    /** */
    getSrcCtrlPoint() {
      return this._srcCtrlPoint;
    },

    /** */
    setSrcCtrlPoint(srcCtrlPoint) {
      this._srcCtrlPoint = srcCtrlPoint;
    },

    /** */
    getDestCtrlPoint() {
      return this._destCtrlPoint;
    },

    /** */
    setDestCtrlPoint(destCtrlPoint) {
      this._destCtrlPoint = destCtrlPoint;
    },

    /** */
    getEndArrow() {
      return this._endArrow;
    },

    /** */
    setEndArrow(endArrow) {
      this._endArrow = endArrow;
    },

    /** */
    getStartArrow() {
      return this._startArrow;
    },

    /** */
    setStartArrow(startArrow) {
      this._startArrow = startArrow;
    },

    /**
         * @return a clone of the relationship model
         */
    clone() {
      const result = new RelationshipModel(this._sourceTargetId, this._targetTopicId);
      result._id = this._id;
      result._lineType = this._lineType;
      result._srcCtrlPoint = this._srcCtrlPoint;
      result._destCtrlPoint = this._destCtrlPoint;
      result._endArrow = this._endArrow;
      result._startArrow = this._startArrow;
      return result;
    },

    /**
         * @return {String} textual information about the relationship's source and target node
         */
    inspect() {
      return (
        `(fromNode:${
          this.getFromNode().getId()
        } , toNode: ${
          this.getToNode().getId()
        })`
      );
    },
  },
);

RelationshipModel._nextUUID = function _nextUUID() {
  if (!$defined(RelationshipModel._uuid)) {
    RelationshipModel._uuid = 0;
  }
  RelationshipModel._uuid += 1;
  return RelationshipModel._uuid;
};

export default RelationshipModel;
