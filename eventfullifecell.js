var util = require('util')
  , events = require('events');

var EventfulLifeCell = module.exports = function(x, y, gridWidth, gridHeight, uiGridObject, setUiGridObjectState, emitDelay, updateStatusDelay) {
  this.x = Number(x);
  this.y = Number(y);
  this.gridWidth = Number(gridWidth);
  this.gridHeight = Number(gridHeight);
  this.uiGridObject = uiGridObject;
  this.setUiGridObjectState = setUiGridObjectState;
  this.cellId = 'cell_' + x + '_' + y;
  this.neighborCount = 0;
  this.isOn = false;
  this.isPaused = true;
  this.emitDelay = emitDelay;
  this.updateStateDelay = updateStatusDelay;
  events.EventEmitter.call(this);
}

util.inherits(EventfulLifeCell, events.EventEmitter);

EventfulLifeCell.prototype.turnOn = function() {
  if (!this.isOn) {
    this.isOn = true;
    this.setUiGridObjectState(this.uiGridObject, true);

    var self = this;
    setTimeout(function(){self.emit('turnedOn');}, self.emitDelay);
  }
}

EventfulLifeCell.prototype.turnOff = function() {
  if (this.isOn) {
    this.isOn = false;
    this.setUiGridObjectState(this.uiGridObject, false);

    var self = this;
    setTimeout(function(){self.emit('turnedOff');}, self.emitDelay);
  }
}

EventfulLifeCell.prototype.subscribeTo = function(neighbor) {
  if (this.cellId == neighbor.cellId) return;
  
  var self = this;
  neighbor.on('turnedOn', function() {
    self.neighborCount++;
    });
  neighbor.on('turnedOff', function() {
    self.neighborCount--;
    });
}

EventfulLifeCell.prototype.updateState = function() {
  if (!this.isPaused) {
    if (this.isOn) {
      if (this.neighborCount < 2 || this.neighborCount > 3) this.turnOff();
    } else {
      if (this.neighborCount == 3) this.turnOn();
    }
  }
  var self = this;
  setTimeout(function(){self.updateState()}, self.updateStateDelay);
}
