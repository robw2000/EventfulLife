var $ = require('jquery-browserify')
  , EventfulLife = require('../eventfullife');

var eventfulLife;
function buildGrid() {

  var lifeGridWidth = 100;
  var lifeGridHeight = 100;

  var lifeGridContainer = $('#lifeGridContainer');

  var table = $('<table></table>').addClass('lifeGrid');

  for(i = 0; i < lifeGridHeight; i++) {
    var row = $('<tr></tr>');
    for (j = 0; j < lifeGridWidth; j++) {
      var td = $('<td></td>').attr('id', 'cell_' + j + '_' + i);
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

  eventfulLife = new EventfulLife(lifeGridWidth, lifeGridHeight, cells, setCellState);
  eventfulLife.start();
}

function resetGrid() {eventfulLife.shotgun()}

$(document).ready(function() {
  $('#resetButton').on('click', resetGrid);
  buildGrid();
  });
