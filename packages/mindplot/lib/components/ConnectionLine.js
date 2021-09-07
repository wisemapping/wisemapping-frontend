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
const Core = require('@wismapping/core-js');
const core = Core();
const web2D = require('@wismapping/web2d');
const web2d = web2D();

const INodeModel = require('./model/INodeModel').default;
const { TopicShape } = require('./model/INodeModel').default;
const Topic = require('./Topic').default;

const ConnectionLine = new Class({
    initialize: function (sourceNode, targetNode, lineType) {
        $assert(targetNode, 'parentNode node can not be null');
        $assert(sourceNode, 'childNode node can not be null');
        $assert(sourceNode != targetNode, 'Circular connection');

        this._targetTopic = targetNode;
        this._sourceTopic = sourceNode;

        var line;
        var ctrlPoints = this._getCtrlPoints(sourceNode, targetNode);
        if (targetNode.getType() == INodeModel.CENTRAL_TOPIC_TYPE) {
            line = this._createLine(lineType, ConnectionLine.CURVED);
            line.setSrcControlPoint(ctrlPoints[0]);
            line.setDestControlPoint(ctrlPoints[1]);
        } else {
            line = this._createLine(lineType, ConnectionLine.SIMPLE_CURVED);
            line.setSrcControlPoint(ctrlPoints[0]);
            line.setDestControlPoint(ctrlPoints[1]);
        }
        // Set line styles ...
        var strokeColor = ConnectionLine.getStrokeColor();
        line.setStroke(1, 'solid', strokeColor, 1);
        line.setFill(strokeColor, 1);

        this._line2d = line;
    },

    _getCtrlPoints: function (sourceNode, targetNode) {
        var srcPos = sourceNode.workoutOutgoingConnectionPoint(targetNode.getPosition());
        var destPos = targetNode.workoutIncomingConnectionPoint(sourceNode.getPosition());
        var deltaX = (srcPos.x - destPos.x) / 3;
        return [new core.Point(deltaX, 0), new core.Point(-deltaX, 0)];
    },

    _createLine: function (lineType, defaultStyle) {
        if (!$defined(lineType)) {
            lineType = defaultStyle;
        }
        lineType = parseInt(lineType);
        this._lineType = lineType;
        var line = null;
        switch (lineType) {
            case ConnectionLine.POLYLINE:
                line = new web2d.PolyLine();
                break;
            case ConnectionLine.CURVED:
                line = new web2d.CurvedLine();
                break;
            case ConnectionLine.SIMPLE_CURVED:
                line = new web2d.CurvedLine();
                line.setStyle(web2d.CurvedLine.SIMPLE_LINE);
                break;
            default:
                line = new web2d.Line();
                break;
        }
        return line;
    },

    setVisibility: function (value) {
        this._line2d.setVisibility(value);
    },

    isVisible: function () {
        return this._line2d.isVisible();
    },

    setOpacity: function (opacity) {
        this._line2d.setOpacity(opacity);
    },

    redraw: function () {
        var line2d = this._line2d;
        var sourceTopic = this._sourceTopic;
        var sourcePosition = sourceTopic.getPosition();

        var targetTopic = this._targetTopic;
        var targetPosition = targetTopic.getPosition();

        var sPos, tPos;
        sPos = sourceTopic.workoutOutgoingConnectionPoint(targetPosition);
        tPos = targetTopic.workoutIncomingConnectionPoint(sourcePosition);

        line2d.setFrom(tPos.x, tPos.y);
        line2d.setTo(sPos.x, sPos.y);

        if (line2d.getType() == 'CurvedLine') {
            var ctrlPoints = this._getCtrlPoints(this._sourceTopic, this._targetTopic);
            line2d.setSrcControlPoint(ctrlPoints[0]);
            line2d.setDestControlPoint(ctrlPoints[1]);
        }

        // Add connector ...
        this._positionateConnector(targetTopic);
    },

    _positionateConnector: function (targetTopic) {
        var targetPosition = targetTopic.getPosition();
        var offset = Topic.CONNECTOR_WIDTH / 2;
        var targetTopicSize = targetTopic.getSize();
        var y, x;
        if (targetTopic.getShapeType() == TopicShape.LINE) {
            y = targetTopicSize.height;
        } else {
            y = targetTopicSize.height / 2;
        }
        y = y - offset;

        var connector = targetTopic.getShrinkConnector();
        if ($defined(connector)) {
            if (Math.sign(targetPosition.x) > 0) {
                x = targetTopicSize.width;
                connector.setPosition(x, y);
            } else {
                x = -Topic.CONNECTOR_WIDTH;
            }
            connector.setPosition(x, y);
        }
    },

    setStroke: function (color, style, opacity) {
        this._line2d.setStroke(null, null, color, opacity);
    },

    addToWorkspace: function (workspace) {
        workspace.append(this._line2d);
        this._line2d.moveToBack();
    },

    removeFromWorkspace: function (workspace) {
        workspace.removeChild(this._line2d);
    },

    getTargetTopic: function () {
        return this._targetTopic;
    },

    getSourceTopic: function () {
        return this._sourceTopic;
    },

    getLineType: function () {
        return this._lineType;
    },

    getLine: function () {
        return this._line2d;
    },

    getModel: function () {
        return this._model;
    },

    setModel: function (model) {
        this._model = model;
    },

    getType: function () {
        return 'ConnectionLine';
    },

    getId: function () {
        return this._model.getId();
    },

    moveToBack: function () {
        this._line2d.moveToBack();
    },

    moveToFront: function () {
        this._line2d.moveToFront();
    },
});

ConnectionLine.getStrokeColor = function () {
    return '#495879';
};

ConnectionLine.SIMPLE = 0;
ConnectionLine.POLYLINE = 1;
ConnectionLine.CURVED = 2;
ConnectionLine.SIMPLE_CURVED = 3;

export default ConnectionLine;
