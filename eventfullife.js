var events = require('events')
  , util = require('util')
  , EventfulLifeCell = require('./eventfullifecell');

var EventfulLife = module.exports = function(gridWidth, gridHeight, uiGridObjects, setUiGridObjectState) {
  this.gridWidth = Number(gridWidth);
  this.gridHeight = Number(gridHeight);
  this.uiGridObjects = uiGridObjects;
  this.setUiGridObjectState = setUiGridObjectState;
  this.pauseEventName = 'GridPause';
  this.unpauseEventName = 'GridUnpause';
  events.EventEmitter.call(this);
}

util.inherits(EventfulLifeCell, events.EventEmitter);

EventfulLife.prototype.init = function() {
  this.grid = new Array(this.gridWidth);
  for (var i = 0; i < this.gridWidth; i++) {
    this.grid[i] = new Array(this.gridHeight);
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j] = new EventfulLifeCell(this, i, j, this.gridWidth, this.gridHeight, this.uiGridObjects[i][j], this.setUiGridObjectState);
    }
  }

  this._createSubscriptions();
}

EventfulLife.prototype._createSubscriptions = function() {
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this._createSelfAndParentSubscriptions(i, j);
      this._createNeighborSubscriptions(i, j);
    }
  }
}

EventfulLife.prototype._createSelfAndParentSubscriptions = function(x, y) {
  var cell = this.grid[x][y];
  cell.subscribeToSelf();
  //this.parentContainer.on(this.parentContainer.pauseEventName, function(){self.isPaused = true;});
  //this.parentContainer.on(this.parentContainer.unpauseEventName, function(){self.isPaused = false; self.updateState();});
}

EventfulLife.prototype._createNeighborSubscriptions = function(x, y) {
  for (var i = x - 1; i < x + 2; i++) {
    var a = (i + this.gridWidth) % this.gridWidth;
    for (var j = y - 1; j < y + 2; j++) {
      var b = (j + this.gridHeight) % this.gridHeight;
      this.grid[x][y].subscribeTo(this.grid[a][b]);
    }
  }
}

EventfulLife.prototype.start = function() {
  this.shotgun();
}

EventfulLife.prototype.stop = function() {
  clearTimeout(this.shotgunTimeoutId);
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].isPaused = true;
    }
  }
}

EventfulLife.prototype.shotgun = function() {
  var self = this;
  this.emit(this.pauseEventName);

  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      setImmediate(function(){self.grid[i][j].turnOff()});
    }
  }

  var maxRadius = Math.sqrt(this.gridWidth * this.gridHeight) / 3;
  var pelletCount = Math.floor(Math.pow(Math.random(), 3) * this.gridWidth * this.gridHeight / 2);
  var centerX = Math.floor(Math.random() * this.gridWidth);
  var centerY = Math.floor(Math.random() * this.gridHeight);
  for (var i = 0; i < pelletCount; i++) {
    var direction = 2 * Math.PI * Math.random();
    var radius = Math.pow(Math.random(), 2) * maxRadius;
    var x = Math.floor((radius * Math.cos(direction) + centerX + this.gridWidth) % this.gridWidth);
    var y = Math.floor((radius * Math.sin(direction) + centerY + this.gridHeight) % this.gridHeight);
    setImmediate(function(){self.grid[x][y].turnOn()});
  }

  this.emit(this.unpauseEventName);
}
