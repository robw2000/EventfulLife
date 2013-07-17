var EventfulLifeCell = require('./eventfullifecell');

var EventfulLife = module.exports = function(gridWidth, gridHeight, uiGridObjects, setUiGridObjectState, emitDelay, updateStatusDelay) {
  this.gridWidth = Number(gridWidth);
  this.gridHeight = Number(gridHeight);
  this.uiGridObjects = uiGridObjects;
  this.setUiGridObjectState = setUiGridObjectState;
  this.emitDelay = emitDelay;
  this.updateStateDelay = updateStatusDelay;

  this.previousGridState = '';
  this.gridState = '';

  this._createEventfulLifeGrid();
}

EventfulLife.prototype._createEventfulLifeGrid = function() {
  this.grid = new Array(this.gridWidth);
  for (var i = 0; i < this.gridWidth; i++) {
    this.grid[i] = new Array(this.gridHeight);
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j] = new EventfulLifeCell(i, j, this.gridWidth, this.gridHeight, this.uiGridObjects[i][j], this.setUiGridObjectState);
    }
  }

  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this._subscribeNeighbors(i, j);
    }
  }
}

EventfulLife.prototype._subscribeNeighbors = function(x, y) {
  for (var i = x - 1; i < x + 2; i++) {
    var a = (i + this.gridWidth) % this.gridWidth;
    for (var j = y - 1; j < y + 2; j++) {
      var b = (j + this.gridHeight) % this.gridHeight;
      this.grid[x][y].subscribeTo(this.grid[a][b]);
    }
  }
}

EventfulLife.prototype.start = function() {
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].updateState();
    }
  }

  this.shotgun();
}

EventfulLife.prototype.stop = function() {
  clearTimeout(this.shotgunTimeoutId);
}

EventfulLife.prototype.shotgunIfEmpty = function() {
  this.getGridState();

  if (this.gridState == this.previousGridState) this.shotgun();

  this.previousGridState = this.gridState;

  var self = this;
  this.shotgunTimeoutId =
    setTimeout(function(){self.shotgunIfEmpty()}, 1000);
}

EventfulLife.prototype.shotgun = function() {
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].isPaused = true;
    }
  }

  var maxRadius = Math.sqrt(this.gridWidth * this.gridHeight);
  var pelletCount = Math.floor(Math.random() * this.gridWidth * this.gridHeight);
  var centerX = Math.floor(Math.random() * this.gridWidth);
  var centerY = Math.floor(Math.random() * this.gridHeight);
  for (var i = 0; i < pelletCount; i++) {
    var direction = 2 * Math.PI * Math.random();
    var radius = Math.pow(Math.random(), 2) * maxRadius;
    var x = Math.floor((radius * Math.cos(direction) + centerX + this.gridWidth) % this.gridWidth);
    var y = Math.floor((radius * Math.sin(direction) + centerY + this.gridHeight) % this.gridHeight);
    this.grid[x][y].turnOn(true);
  }

  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.grid[i][j].isPaused = false;
    }
  }
}

EventfulLife.prototype.getGridState = function() {
  this.gridState = '';
  for (var i = 0; i < this.gridWidth; i++) {
    for (var j = 0; j < this.gridHeight; j++) {
      this.gridState += (this.grid[i][j].isOn) ? '1' : '0';
    }
  }
}
