var $ = require('jquery-browserify')
  , EventfulLife = require('../eventfullife');

var eventfulLife;
function buildGrid(emitDelay, updateStatusDelay) {

  var lifeGridWidth = 100;
  var lifeGridHeight = 100;

  var lifeGridContainer = $('#lifeGridContainer');

  var table = $('<table></table>').addClass('lifeGrid');

  for(i = 0; i < lifeGridHeight; i++) {
    var row = $('<tr></tr>');
    for (j = 0; j < lifeGridWidth; j++) {
      var td = $('<td></td>').addClass('cellOff').attr('id', 'cell_' + j + '_' + i);
      row.append(td);
    }
    table.append(row);
  }

  lifeGridContainer.append(table);

  var cells = new Array(lifeGridWidth);
  for (var i = 0; i < lifeGridWidth; i++) {
    cells[i] = new Array(lifeGridHeight);
    for (var j = 0; j < lifeGridHeight; j++) {
      cells[i][j] = $('#cell_' + i + '_' + j);
    }
  }

  function setCellState(cell, turnOn) {
    if (turnOn) {
      if (!cell.hasClass('cellOn')) cell.addClass('cellOn');
    } else {
      if (cell.hasClass('cellOn')) cell.removeClass('cellOn');
    }
  }

  emitDelay = emitDelay || 1;
  updateStatusDelay = updateStatusDelay || 0;
  eventfulLife = new EventfulLife(lifeGridWidth, lifeGridHeight, cells, setCellState, emitDelay, updateStatusDelay);
  eventfulLife.start();
}

function resetGrid() {eventfulLife.shotgun()}

$(document).ready(function() {
  $('#resetButton').on('click', resetGrid);
  buildGrid(1, 0);
  });