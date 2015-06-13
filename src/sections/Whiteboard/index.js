var fs = require('fs');
var io = require('io');
var f1 = require('f1');
var find = require('dom-select');
var $ = require('jquery');
var PIXI = require('pixi');
var framework = require('../../framework/index');
var Model = require('../../model/model');
var states = require('./states');

var createTabs = require('./ui/tabs');
var socketSetup = require('./js/wbSockets.js');
var ChatboxManager = require('./js/ChatboxManager');
module.exports = Section;

function Section() {}

Section.prototype = {

  init: function(req, done) {
    var socket = socketSetup(io,framework);

    var content = find('#content');
    this.section = document.createElement('div');
    this.section.innerHTML = fs.readFileSync(__dirname + '/index.hbs', 'utf8');
    content.appendChild(this.section);

    createTabs();

    states.init.whiteboard.position[0] = document.body.offsetWidth * 1.5;

    // Strap html to application
    var canvas = find('#whiteboard-container');
    var renderer = new PIXI.autoDetectRenderer(document.body.offsetWidth * 0.75, document.body.offsetHeight - 60);
    renderer.backgroundColor = 0x123feb;
    canvas.appendChild(renderer.view);

    var stage = new PIXI.Container();

    // This creates a texture from a 'bunny.png' image.
    var bunnyTexture = PIXI.Texture.fromImage('images/pencil-icon.png');
    var bunny = new PIXI.Sprite(bunnyTexture);

    // Setup the position and scale of the bunny
    bunny.position.x = 400;
    bunny.position.y = 300;

    bunny.scale.x = 2;
    bunny.scale.y = 2;

    // Add the bunny to the scene we are building.
    stage.addChild(bunny);

    // kick off the animation loop (defined below)
    animate();

    function animate() {
        // start the timer for the next animation loop
        requestAnimationFrame(animate);

        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;

        // this is the main render call that makes pixi draw your container and its children.
        renderer.render(stage);
    }

    this.animate = new f1().states(states)
                           .transitions(require('./transitions'))
                           .targets({ whiteboard: find('#whiteboard')})
                           .parsers(require('f1-dom'))
                           .init('init');

    ChatboxManager.init(req, socket, done);

    done();
  },

  resize: function(w, h) {
  },

  animateIn: function(req, done) {
    this.animate.go('idle', function() {
      done();
    }.bind(this));
  },

  animateOut: function(req, done) {
    this.animate.go('out', function() {
      done();
    }.bind(this));
  },

  destroy: function(req, done) {
    console.log("Destroy!");
    this.section.parentNode.removeChild(this.section);
    done();
  }
};
