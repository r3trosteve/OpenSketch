var fs = require('fs');
var io = require('io');
var f1 = require('f1');
var find = require('dom-select');
var $ = require('jquery');
var framework = require('../../framework/index');
var Model = require('../../model/model');
var states = require('./states');
var createTabs = require('./util/tabs');
var socketSetup = require('./util/sockets');
var ChatboxManager = require('./util/chatbox');
var Toolbar = require('./util/toolbar');

module.exports = Section;

function Section() {}

Section.prototype = {

  init: function(req, done) {
    var socket = socketSetup(io,framework,done);

    var content = find('#content');
    this.section = document.createElement('div');
    this.section.innerHTML = fs.readFileSync(__dirname + '/index.hbs', 'utf8');
    content.appendChild(this.section);
    // states.init.whiteboard.position[0] = document.body.offsetWidth * 1.5;
    createTabs();

    this.toolbar = new Toolbar({
      whiteboard: '#whiteboard-container',
      tools: {
        pencil: '#tool-pencil',
        eraser: '#tool-eraser',
        fill: '#tool-fill',
        shapes: {
          'el': '#tool-shapes',
          'circle': '',
          'rectangle': '',
        },
        text: '#tool-text',
        table: '#tool-table',
        templates: {
          el: '#tool-template',
          flowchart: '',
          uml: ''
        },
        import: '#tool-import',
        color: '#tool-color'
      }
    });

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
