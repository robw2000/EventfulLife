var util = require('util')
  , events = require('events');

var EventfulLifeCell = module.exports = function(parentContainer, x, y, gridWidth, gridHeight, uiGridObject, setUiGridObjectState, debug) {
  this.parentContainer = parentContainer;
  this.x = Number(x);
  this.y = Number(y);
  this.gridWidth = Number(gridWidth);
  this.gridHeight = Number(gridHeight);
  this.uiGridObject = uiGridObject;
  this.setUiGridObjectState = setUiGridObjectState;
  this.debug = debug || false;
  this.cellId = 'cell_' + x + '_' + y;
  this.neighborCount = 0;
  this.isOn = false;
  this.isPaused = true;
  this.turnOnEventName = 'cellTurnedOn';
  this.turnedOffEventName = 'cellTurnedOff';
  this.updateStateEventName = 'updateCellState';
  events.EventEmitter.call(this);

  if (this.debug) console.log('cell_' + this.x + '_' + this.y + ' instantiated');
}

util.inherits(EventfulLifeCell, events.EventEmitter);

EventfulLifeCell.prototype.turnOn = function() {
  if (this.debug) console.log('cell_' + this.x + '_' + this.y + '.turnOn()');
  if (!this.isOn) {
    this.isOn = true;
    this.setUiGridObjectState(this.uiGridObject, true);

    var self = this;
    setTimeout(function(){self.emit(self.turnOnEventName);}, 1);
  }
}

EventfulLifeCell.prototype.turnOff = function() {
  if (this.debug) console.log('cell_' + this.x + '_' + this.y + '.turnOff()');
  if (this.isOn) {
    this.isOn = false;
    this.setUiGridObjectState(this.uiGridObject, false);

    var self = this;
    setTimeout(function(){self.emit(self.turnedOffEventName);}, 1);
  }
}

EventfulLifeCell.prototype.subscribeTo = function(neighbor) {
  if (this.debug) console.log('cell_' + this.x + '_' + this.y + '.subscribeTo(cell_' + neighbor.x + '_' + neighbor.y + ')');
  var self = this;
  if (this.cellId !== neighbor.cellId) {
    neighbor.on(this.turnOnEventName, function() {
        if (this.debug) console.log('cell_' + self.x + '_' + self.y + ' neighbor turnOnEvent triggered');
        self.neighborCount++;
      });
    neighbor.on(this.turnedOffEventName, function() {
        if (this.debug) console.log('cell_' + self.x + '_' + self.y + ' neighbor turnOffEvent triggered');
        self.neighborCount--;
      });
  }
}

EventfulLifeCell.prototype.updateState = function() {
  if (this.debug) console.log('cell_' + this.x + '_' + this.y + '.updateState()');
  if (this.isPaused) return;
  
  if (this.isOn) {
    if (this.neighborCount < 2 || this.neighborCount > 3) this.turnOff();
  } else {
    if (this.neighborCount == 3) this.turnOn();
  }
  
  var self = this;
  setTimeout(function(){self.updateState();}, 1);
}
