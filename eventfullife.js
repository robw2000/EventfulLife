var events = require('events')
  , util = require('util')
  , EventfulLifeCell = require('./eventfullifecell');

var EventfulLife = module.exports = function(gridWidth, gridHeight, uiGridObjects, setUiGridObjectState, debug) {
  this.gridWidth = Number(gridWidth);
  this.gridHeight = Number(gridHeight);
  this.uiGridObjects = uiGridObjects;
  this.setUiGridObjectState = setUiGridObjectState;
  this.debug = debug || false;
  this.pauseEventName = 'GridPause';
  this.unpauseEventName = 'GridUnpause';
  this.initGrid();
  events.EventEmitter.call(this);

  if (this.debug) console.log('eventfulLife instantiated');
}

util.inherits(EventfulLife, events.EventEmitter);

EventfulLife.prototype.initGrid = function() {
  this.setMaxListeners(0);

  if (this.debug) console.log('eventfulLife.initGrid');
  this.grid = new Array(this.gridWidth);
  for (var i = 0; i < this.gridWidth; i++) {
    this.grid[i] = new Array(this.gridHeight);
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j] = new EventfulLifeCell(this, i, j, this.gridWidth, this.gridHeight, this.uiGridObjects[i][j], this.setUiGridObjectState);
      this.grid[i][j].setMaxListeners(0);
      if (this.debug) console.log('cell_' + i + '_' + j, this.grid[i][j]);
    }
  }
}

EventfulLife.prototype._createSubscriptions = function() {
  if (this.debug) console.log('eventfulLife._createSubscriptions - this: ', this);
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this._createNeighborSubscriptions(i, j);
    }
  }
}

EventfulLife.prototype._createNeighborSubscriptions = function(x, y) {
  if (this.debug) console.log('eventfulLife._createNeighborSubscriptions - this: ', this);
  for (var i = x - 1; i < x + 2; i++) {
    var a = (i + this.gridWidth) % this.gridWidth;
    for (var j = y - 1; j < y + 2; j++) {
      var b = (j + this.gridHeight) % this.gridHeight;
      if (this.debug) console.log('subscribing cell_' + x + '_' + y + ' to cell_' + a + '_' + b);
      this.grid[x][y].subscribeTo(this.grid[a][b]);
    }
  }
}

EventfulLife.prototype.start = function() {
  if (this.debug) console.log('eventfulLife.start');
  this._createSubscriptions();
  this.shotgun();
}

EventfulLife.prototype.stop = function() {
  if (this.debug) console.log('eventfulLife.stop');
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].isPaused = true;
    }
  }
}

EventfulLife.prototype.shotgun = function() {
  if (this.debug) console.log('eventfulLife.shotgun');
  var self = this;

  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].isPaused = true;
    }
  }

  var maxRadius = Math.sqrt(this.gridWidth * this.gridHeight) / 3;
  var pelletCount = Math.floor(Math.pow(Math.random(), 2) * this.gridWidth * this.gridHeight / 2);
  if (pelletCount < this.gridWidth * this.gridHeight / 10) pelletCount = this.gridWidth * this.gridHeight / 10;
  var centerX = Math.floor(Math.random() * this.gridWidth);
  var centerY = Math.floor(Math.random() * this.gridHeight);
  for (var i = 0; i < pelletCount; i++) {
    var direction = 2 * Math.PI * Math.random();
    var radius = Math.pow(Math.random(), 2) * maxRadius;
    var x = Math.floor((radius * Math.cos(direction) + centerX + this.gridWidth) % this.gridWidth);
    var y = Math.floor((radius * Math.sin(direction) + centerY + this.gridHeight) % this.gridHeight);
    this.grid[x][y].turnOn();
  }

  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].isPaused = false;
      this.grid[i][j].updateState();
    }
  }
}
