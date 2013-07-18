var util = require('util')
  , events = require('events');

var EventfulLifeCell = module.exports = function(parentContainer, x, y, gridWidth, gridHeight, uiGridObject, setUiGridObjectState) {
  this.parentContainer = parentContainer;
  this.x = Number(x);
  this.y = Number(y);
  this.gridWidth = Number(gridWidth);
  this.gridHeight = Number(gridHeight);
  this.uiGridObject = uiGridObject;
  this.setUiGridObjectState = setUiGridObjectState;
  this.cellId = 'cell_' + x + '_' + y;
  this.neighborCount = 0;
  this.isOn = false;
  this.listenersSet = false;
  this.turnOnEventName = 'cellTurnedOn';
  this.turnedOffEventName = 'cellTurnedOff';
  this.updateStateEventName = 'updateCellState';
  this.updateRequested = false;
  events.EventEmitter.call(this);
}

util.inherits(EventfulLifeCell, events.EventEmitter);

EventfulLifeCell.prototype.turnOn = function() {
  if (!this.isOn) {
    this.isOn = true;
    this.setUiGridObjectState(this.uiGridObject, true);

    this.emit(this.turnOnEventName);
  }
}

EventfulLifeCell.prototype.turnOff = function() {
  if (this.isOn) {
    this.isOn = false;
    this.setUiGridObjectState(this.uiGridObject, false);

    this.emit(this.turnedOffEventName);
  }
}

EventfulLifeCell.prototype.subscribeToSelf = function() {
  var self = this;
  this.on(this.updateStateEventName, function() {self.updateState()});
}

EventfulLifeCell.prototype.subscribeTo = function(neighbor) {
  if (this.cellId == neighbor.cellId) return;

  var self = this;
  neighbor.on(this.turnOnEventName, function() {
      self.neighborCount++;
      if (!self.isPaused && !self.updateRequested) {
        self.updateRequested = true;
        self.emit(self.updateStateEventName);
      }
    });
  neighbor.on(this.turnedOffEventName, function() {
      self.neighborCount--;
      if (!self.isPaused && !self.updateRequested) {
        self.updateRequested = true;
        self.emit(self.updateStateEventName);
      }
    });
}

EventfulLifeCell.prototype.updateState = function() {
  if (!this.isPaused) {
    if (this.isOn) {
      if (this.neighborCount < 2 || this.neighborCount > 3) this.turnOff();
    } else {
      if (this.neighborCount == 3) this.turnOn();
    }
    this.updateRequested = false;
  }
}
