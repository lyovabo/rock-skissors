import $ from 'jquery';
import {io} from 'socket.io-client';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Events} from '../../configs/events.js';

const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', {
  reconnectionDelayMax: 10000,
  auth: {
    token: token,
  },
});
/**
 * UI check not to send empty strings
 * @return {object}
 */
function checkValidity() {
  const userName = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (!userName || !password) {
    return {isValid: false, message: 'Username or Password is empty'};
  }
  return {isValid: true};
}
/**
 * Shows lobby page
 */
function showLobbyPage() {
  $('#lobby-wrapper').show();
  $('#game-wrapper').hide();
  $('#login-wrapper').hide();
}
/**
 * Shows login page
 */
function showLoginPage() {
  $('#lobby-wrapper').hide();
  $('#game-wrapper').hide();
  $('#login-wrapper').show();
}
/**
 * Shows game page
 */
function showGamePage() {
  $('#lobby-wrapper').hide();
  $('#game-wrapper').show();
  $('#login-wrapper').hide();
}
/**
 * Send form data to endpoint
 * If auth is ok, get token and
 * store it in localStorage
 */
function loginRegister() {
  if (checkValidity().isValid) {
    const userName = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const params = {
      userName,
      password,
    };
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),

    }).then((data) => {
      return data.json();
    }).then((parsedData) => {
      if (parsedData.token) {
        showLobbyPage();
        localStorage.setItem('token', parsedData.token);
        localStorage.setItem('username', parsedData.username);
      } else {
        console.log(parsedData.message);
      }
    }).catch((err) => {
      console.log(err);
    });
  }
}
/**
 * Game creation event sending
 */
function createGame() {
  const rounds = document.getElementById('rounds').value;
  socket.emit(Events.CREATE_GAME, {rounds});
}
/**
 * Game creation event sending
 */
function pauseGame() {
  const currentGameId = localStorage.getItem('current-game');
  socket.emit(Events.PAUSE_GAME, {gameId: currentGameId});
}
/**
 * Join game handler function
 */
function joinGame() {
  const gameId = document.getElementById('game-id').value;
  if (gameId!=='') {
    socket.emit(Events.JOIN_GAME, {gameId: gameId});
  }
}
/**
 * make step handler function
 */
function makeChoice() {
  const currentGameId = localStorage.getItem('current-game');
  // const gameId = document.getElementById('game-id').value;
  if (currentGameId) {
    const choice = document
        .querySelector('input[name="flexRadioDefault"]:checked').value;
    socket.emit(Events.MAKE_CHOICE, {gameId: currentGameId,
      choice: choice});
  }
}
/**
 * assign all game data to html
 * @param {Object} game - game object
 */
function assignGameData(game) {
  $('#current-game-id').text(game.gameId);
  $('#rounds-number').text(game.rounds);
  $('#current-round').text(game.currentRound.roundNumber);
  $('#opponent1').text(game.playerOne.username);
  $('#opponent2').text(game.playerTwo.username);
}
/**
 * Socket connection to server function
 */
function connectToServer() {
  // socket.connect();
  socket.on('error', (error) => {
    // showLoginPage();
    // show error message()
  });
  socket.on('connect', () => {
    showLobbyPage();
  });
  socket.on('reconnect_failed', (err) => {
    console.log('reconnect failed'+err);
    // show error message
  });
  socket.on('connect_error', (err) => {
    showLoginPage();
    console.log('connect_error');
    console.log(err.message); // prints the message associated with the error
  });
  socket.on(Events.GAME_CREATED, (game) => {
    localStorage.setItem('current-game', game.gameId);
    console.log(game.gameId);
    console.log(game);
    assignGameData(game);
    showGamePage();
  });
  socket.on(Events.GAME_JOINED, (game) => {
    console.log('game-joined', game);
    localStorage.setItem('current-game', game.gameId);
    assignGameData(game);
    showGamePage();
  });
  socket.on(Events.PLAYER_JOINED, (game) => {
    console.log(game);
    localStorage.setItem('current-game', game.gameId);
  });
  socket.on(Events.GAME_PAUSED, (gameData) => {
    console.log(gameData);
    // show message that game was paused
    // and show the data of game
    showLobbyPage();
  });
  socket.on(Events.END_ROUND, (roundData) => {
    console.log('End round');
    
    // show popup
    console.log(roundData);
  });
  socket.on('game-error', (error) => {
    // show message with error
    console.log(error);
  });
  socket.on(Events.END_GAME, (gameData) => {
    console.log('End Game');
    localStorage.removeItem('current-game');
    console.log(gameData);
    showLobbyPage();
    // show message that game was ended
    // show result of the game(winner/looser)
    // see lobby page
  });
  socket.on(Events.NEW_ROUND, (roundData) => {
    // update round number
    $('#current-round').text(roundData.roundNumber);
    // show message that new round begins
    console.log(roundData);
  });
}
const events = [
  {id: 'login', callback: loginRegister},
  {id: 'create', callback: createGame},
  {id: 'pause', callback: pauseGame},
  {id: 'join', callback: joinGame},
  {id: 'make-choice', callback: makeChoice}];
/**
 * Add all listeners
 */
function addListeners() {
  for (let i = 0; i < events.length; i++) {
    document.getElementById(events[i].id).addEventListener('click', (e)=> {
      e.preventDefault();
      events[i].callback();
    });
  }
}
document.addEventListener('DOMContentLoaded', function() {
  connectToServer();
  addListeners();
  console.log('DOM content loaded');
}, false);
