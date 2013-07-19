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
  this.isPaused = true;
  this.turnOnEventName = 'cellTurnedOn';
  this.turnedOffEventName = 'cellTurnedOff';
  this.updateStateEventName = 'updateCellState';
  this.updateRequested = false;
  events.EventEmitter.call(this);

  //console.log('cell_' + this.x + '_' + this.y + ' instantiated');
}

util.inherits(EventfulLifeCell, events.EventEmitter);

EventfulLifeCell.prototype.turnOn = function() {
  //console.log('cell_' + this.x + '_' + this.y + '.turnOn()');
  if (!this.isOn) {
    this.isOn = true;
    this.setUiGridObjectState(this.uiGridObject, true);

    this.emit(this.turnOnEventName);
  }
}

EventfulLifeCell.prototype.turnOff = function() {
  //console.log('cell_' + this.x + '_' + this.y + '.turnOff()');
  if (this.isOn) {
    this.isOn = false;
    this.setUiGridObjectState(this.uiGridObject, false);

    this.emit(this.turnedOffEventName);
  }
}

EventfulLifeCell.prototype.requestUpdateState = function() {
  console.log(this.cellId + '.requestUpdateState()');
  this.emit(this.updateStateEventName);
}

EventfulLifeCell.prototype.subscribeTo = function(neighbor) {
  //console.log('cell_' + this.x + '_' + this.y + '.subscribeTo(cell_' + neighbor.x + '_' + neighbor.y + ')');
  var self = this;
  if (this.cellId == neighbor.cellId) {
    neighbor.once(this.updateStateEventName, function() {self.updateState()});
  } else {
    neighbor.on(this.turnOnEventName, function() {
        console.log('cell_' + self.x + '_' + self.y + ' neighbor turnOnEvent triggered');
        self.neighborCount++;
        self.requestUpdateState();
      });
    neighbor.on(this.turnedOffEventName, function() {
        console.log('cell_' + self.x + '_' + self.y + ' neighbor turnOffEvent triggered');
        self.neighborCount--;
        self.requestUpdateState();
      });
  }
}

EventfulLifeCell.prototype.updateState = function() {
  var self = this;
  this.once(this.updateStateEventName, function() {self.updateState()});
  //console.log('cell_' + this.x + '_' + this.y + '.updateState()');
  if (this.isPaused) {
    this.requestUpdateState();
  } else {
    if (this.isOn) {
      if (this.neighborCount < 2 || this.neighborCount > 3) this.turnOff();
    } else {
      if (this.neighborCount == 3) this.turnOn();
    }
  }
}
