'use strict';

function makeGridTable(board) {

  var size = board.size;

  var domTarget = document.getElementById('grid_table');
  var table = document.createElement('table');

  for (var i = 0; i < size; i++) {
    var row = document.createElement('tr');

    for (var j = 0; j < size; j++) {
      var square = document.createElement('td');
      square.textContent = '—';

      row.appendChild(square);
      board.addRef(i,j,square);

    }
    table.appendChild(row);
  }
  domTarget.appendChild(table);
}

Coord.prototype.checkSub = function () {
  if (this.sub){
    this.status = 'hit';
    this.squareRef.textContent = 'X';
    return true;
  }
  this.status = 'miss';
  this.squareRef.textContent = 'O';
  return false;
};

function GameBoard(size) {
  if (localStorage.getItem('board') === null){
    this.size = size;
    this.grid = [];
    this.setupBoard(size);
    this.save();
    console.log('being created');       
  }else {
    console.log('being restored');   
    this.restore();
    this.setupBoard(size);
    this.updateBoard();
  }
}

GameBoard.prototype.save = function() {
  localStorage.setItem('board', JSON.stringify(this));
};

GameBoard.prototype.restore = function(){
  var boardProps = JSON.parse(localStorage.getItem('board'));
  for (var key in boardProps) {
    if (boardProps.hasOwnProperty(key)) {
      this[key] = boardProps[key];     
    }
  }
};

GameBoard.prototype.updateBoard = function () {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      // var status = this.grid[i][j].status ;
      // var squareRef = this.grid[i][j].squareRef;
      if(this.grid[i][j].status === 'miss'){
        this.grid[i][j].squareRef.textContent = 'O';
      }else if(this.grid[i][j].status === 'hit'){
        this.grid[i][j].squareRef.textContent = 'X';
      }
    }
  }
};

GameBoard.prototype.setupBoard = function (size) {
  this.createGrid(size);
};

GameBoard.prototype.addRef = function (i,j,ref) {
  this.grid[i][j].squareRef = ref;
};

//make table
GameBoard.prototype.createGrid = function (size) {
  if(this.grid.length === 0) {    
    for (var i = 0; i < size; i++) {
      var row = [];
      for (var j = 0; j < size; j++) {
        row.push(new Coord());
      }
      this.grid.push(row);
    }
  }else {
    for (i = 0; i < size; i++) {
      for (j = 0; j < size; j++) {
        this.grid[i][j] = new Coord(this.grid[i][j]);
      }
    }
  }
};

GameBoard.prototype.addSub = function (x, y) {
  //subtract one so that grid coordinates start at 1.
  this.grid[x][y].sub = true;
};

GameBoard.prototype.guessed = function (x,y) {
  //subtract one so that grid coordinates start at 1.
  return this.grid[x - 1][y - 1].checkSub();
};

function Coord (object) {
  if(object) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        this[key] = object[key];       
      }
    }
  }else {
    //the default is unseen; once coordinate is picked, status ==== hit || miss.
    this.status = 'unseen';
    //this tells whether there is a sub at this location.
    this.sub = false;
  }
}

var board = new GameBoard(5);
makeGridTable(board);

// paste from player.js
var score = 0;

function Sub(length) {
  if (localStorage.getItem('sub') === null) {
    this.alive = true;
    this.length = length;
    this.lifePoints = this.length;
    this.orientation = this.getOriention();
    this.location = this.getLocation(); 
    this.save(); 
  } else {
    this.restore();
  }
  this.addToBoard();
}

Sub.prototype.save = function() {
  localStorage.setItem('sub', JSON.stringify(this));
};

Sub.prototype.restore = function(){
  var subProps = JSON.parse(localStorage.getItem('sub'));
  for (var key in subProps) {
    if (subProps.hasOwnProperty(key)) {
      this[key] = subProps[key];     
    }
  }
};

Sub.prototype.getOriention = function() {
  var coin = Math.round(Math.random());
  if (coin) {
    return 'north-south';
  } else {
    return 'east-west';
  }
};

Sub.prototype.hit = function() {
  this.lifePoints--;
  if (this.lifePoints === 0) {
    this.alive = false;
  }
  this.save();
};

Sub.prototype.addToBoard = function() {
  // setting physical location of sub on board.
  var x = this.location[0];
  var y = this.location[1];
  for (var i = 0; i < this.length; i++) {
    console.log(x,y);
    board.addSub(x, y);
    if (this.orientation === 'north-south') {
      y++;
    } else {
      x++;
    }
  }
  board.save();
};

Sub.prototype.getLocation = function() {
  var offsetX = 0;
  var offsetY = 0;
  if (this.orientation === 'north-south') {
    offsetY = this.length - 1;
  } else {
    offsetX = this.length - 1;
  }
  var x = Math.floor(Math.random() * (board.size - offsetX));
  var y = Math.floor(Math.random() * (board.size - offsetY));
  return [x, y];
};

var sub = new Sub(3);

function Player() {
  if (localStorage.getItem('player') === null) {
    this.name = name;
    this.score = score;
    this.turns = [];
    this.save();
  }else {
    this.restore();
  }
}

Player.prototype.save = function() {
  localStorage.setItem('player', JSON.stringify(this));
};

Player.prototype.restore = function(){
  var playerProps = JSON.parse(localStorage.getItem('player'));
  for (var key in playerProps) {
    if (playerProps.hasOwnProperty(key)) {
      this[key] = playerProps[key];     
    }
  }
};

Player.prototype.attack = function(x, y) {
  var result = board.guessed(x, y);
  board.save();
  if(result === true) {
    // Game Over!
    sub.hit();
    alert('Hit!');
    if(sub.alive === false) {
      alert('You destroyed the sub!');
    }
  } else {
    alert('Miss!');
  }
  this.turns.push([x, y]);
  this.save();
};

Player.prototype.updateScore = function() {

};

var player = new Player();

var fire = document.getElementById('fire');
fire.addEventListener('submit', function(event) {
  event.preventDefault();
  event.stopPropagation();
  var x = parseInt(event.target.x.value);
  var y = parseInt(event.target.y.value);
  player.attack(x, y);
});
