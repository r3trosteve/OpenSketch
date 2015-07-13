'use strict';
var PIXI = require('pixi');
var Line = require('../shapes/Line');
var setMoveShapeListeners = require('./shapeHelpers/setMoveShapeListeners');
var EVENT = require('../../../../model/model').socketEvents;

module.exports = function(el, AppState) {
  var isDown = false;
  var originalPoint;
  var drawBegan = false;

  var lineSettings = AppState.Tools.line
  var line;
  var stage = AppState.Canvas.stage;
  var socket = AppState.Socket;
  var shapes = AppState.Canvas.Shapes;

  el.addEventListener('click', function(data) {
    console.log('Selected Line Tool...');
    //if(settings.toolbar.toolSelected) return; // Return early if toolbar Select was picked
    AppState.Tools.selected = 'line';

    //Line.set(settings.stage, settings.renderer);
    activate();
  });

  function mousedown(data) {
    isDown = true;
    data.originalEvent.preventDefault();
    originalPoint = data.getLocalPosition(this);

    line = new Line(lineSettings);

  };

  function mousemove(data) {
    if(isDown) {
      var currentPoint = data.getLocalPosition(this);
      //console.log('line mouse move: ', line);
      line.draw({
        x: originalPoint.x,
        y: originalPoint.y,
        x2: currentPoint.x,
        y2: currentPoint.y
      });

      line.drawSelectablePoints(
        originalPoint.x, originalPoint.y,
        currentPoint.x, currentPoint.y
      );

      //SocketObject.emitDrawingObject(graphics);
      if(drawBegan) {
        // Emite socket draw event
        socket.emit(EVENT.shapeEvent, 'draw', line.getProperties());
      }
      else {
        // Add line to Shapes container
        line = shapes.addNew(line);

        // Emit socket add shape event
        socket.emit(EVENT.shapeEvent, 'add', line.getProperties());
      }
      drawBegan = true;
    }
  };

  function mouseup(data) {
    if(isDown) {
      if(drawBegan) {
        line.setEventListeners(AppState);

        line.unHighlight();

        // Emit socket event
        socket.emit(EVENT.shapeEvent, 'drawEnd', line.getProperties());

      }
      else {

        shapes.removeShape(line);
      }
    }
    drawBegan = isDown = false;
  };

  function activate() {
    stage.mousedown = mousedown;
    stage.mouseup = mouseup;
    stage.mousemove = mousemove;
    stage.mouseout = mouseup;
  }
};
