import {Configs} from './configs';
import {Events} from './configs/events';
import express from 'express';
import {Server} from 'socket.io';
import cors from 'cors';
import http from 'http';
import * as auth from './modules/auth';
import {db} from './db/connections.js';
import {getRandomGameId} from './libs/helpers';
import {Game} from './modules/game/game';
import {logger} from './modules/logger/winston';


const gamesList = new Map();
const finishedGamesList = new Map();
const app = express();
// ToDo: Make CORS more precious to endpoints,

app.use(cors(Configs.cors));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

db.init();

const port = Configs.httpPort;
app.post('/login', (req, res, next) => {
  auth.signin(req, res, next);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// eslint-disable-next-line new-cap
const httpServer = http.Server(app);


const io = new Server(httpServer, {
  cors: Configs.cors,
});
httpServer.listen(Configs.socketPort);
io.use((socket, next) => {
  auth.verifyToken(socket, next);
  next();
});

io.use((socket, next) => {
  // if user have ongoing game
  // put game id on socket object
  gamesList.forEach((game, gameId) => {
    if (((game.playerOne.id === socket.user.id) ||
     (game.playerTwo.id === socket.user.id)) &&
     (!game.isPaused && !game.isFinished)) {
      socket.user.ongoingGameId = gameId;
    }
  });
  next();
});

io.on('connection', function(socket) {
  console.log('connection event for' + socket.user.username);
  socket.conn.on('close', (reason) => {
    console.log('reason', reason);
    // called when the underlying connection is closed
  });
  // console.log(socket.user);
  // send event for reconnection
  // to current ongoing game
  if (socket.user.ongoingGameId) {
    socket.emit(Events.RECONNECT_ONGOING_GAME,
        {gameId: socket.user.ongoingGameId});
  }
  socket.on(Events.PAUSE_GAME, (message)=>{
    console.log(message.gameId);
    console.log(gamesList);
    const game = gamesList.get(message.gameId);
    if (game.gameCanStart()) {
      const user = socket.user;
      game.pauseGame({id: user.id, username: user.username});
      console.log(gamesList);
      const res = {'pausedBy': user.username, 'gameId': game.gameId};
      io.to(game.gameId).emit(Events.GAME_PAUSED, res);
    } else {
      console.log('game cannot be paused');
      const error = new Error('Game cannot be paused');
      error.message = 'Game didnt started to be paused';
      socket.emit(Events.GAME_ERROR, error);
    }
  });
  socket.on(Events.JOIN_GAME, (message)=>{
    const user = socket.user;
    console.log('join_game was called for '+user.username);
    const gameId = message.gameId;
    const game = gamesList.get(gameId);
    if (!game) {
      console.log('invalid game id');
      const error = new Error('Invalid game Id');
      error.message = 'Please provide valid game Id';
      socket.emit('game-error', error);
    } else if (game.gameCanStart()) {
      console.log('invalid game id');
      const error = new Error('Invalid game Id');
      error.message = 'Game is already happening';
      socket.emit('game-error', error);
    } else if (game.pause.isPaused) {
      game.pause.isPaused = false;
      // here we let to continue game only the users who played game earlier
      if (user.id === game.pause.playerOne.id ||
                user.id === game.pause.playerTwo.id) {
        game.addPlayer({id: user.id, username: user.username});
        if (game.gameCanStart()) {
          io.to(game.gameId).emit(Events.GAME_JOINED,
              game);
        } else {
          io.to(game.gameId).emit(Events.PLAYER_JOINED,
              game);
        }
      } else {
        console.log('invalid game id');
        const error = new Error('Invalid game Id');
        error.message = 'Please provide valid game Id';
        socket.emit('game-error', error);
      }
    } else {
      game.addPlayer({id: user.id, username: user.username});
      socket.join(gameId);
      if (game.gameCanStart()) {
        io.to(game.gameId).emit(Events.GAME_JOINED,
            game);
      } else {
        io.to(game.gameId).emit(Events.PLAYER_JOINED,
            game);
      }
    }
  });
  socket.on(Events.CREATE_GAME, (message)=>{
    // to redirect if there is ongoing game
    // if (!socket.user.ongoingGameId) {
    let gameId = getRandomGameId();
    // to avoid random collision
    while (gamesList[gameId]) {
      gameId = getRandomGameId();
    }
    const rounds = message.rounds;
    const game = new Game({rounds, gameId, playerOne: {id: socket.user.id,
      username: socket.user.username}});
    gamesList.set(gameId, game);
    socket.join(gameId);
    socket.user.ongoingGameId = gameId;
    socket.emit(Events.GAME_CREATED, game);
    console.log(gamesList);
    // }
  });
  socket.on(Events.LEAVE_GAME, (message) => {
    const currentGame = gamesList.get(message.gameId);
    if (game.gameCanStart()) {
      if (currentGame.playerOne.id === socket.user.id) {
        currentGame.registerWinner(currentGame.playerTwo);
      } else {
        currentGame.registerWinner(currentGame.playerOne);
      }
      const results = game.gameResults();
      io.to(game.gameId).emit(Events.END_GAME, results);
    } else {
      gamesList.delete(message.gameId);
      socket.emit(Events.END_GAME, message.gameId);
    }
  });
  socket.on(Events.MAKE_CHOICE, (message) => {
    try {
      const gameId = message.gameId;
      if (!gameId) {
        const error = new Error('No game');
        error.message = 'Please create or join the game';
        socket.emit(Events.GAME_ERROR, error);
      } else if (gamesList.get(gameId).isFinished) {
        const error = new Error('Finished game');
        error.message = `Game wit id ${gameId} is finished,
       please join to other game`;
        socket.emit(Events.GAME_ERROR, error);
      } else {
        const game = gamesList.get(gameId);
        const currentRound = game.currentRound;
        // check if user is not already choiced
        if (!currentRound.playersChoice[socket.user.id]) {
          currentRound.playersChoice[socket.user.id] = message.choice;
        }
        if (game.currentRoundIsPlayable()) {
        // game can be played only if both choices are done
          game.playGame();
          if (game.isFinalRound()) {
            console.log('Final round');
            game.finishGame();
            console.log(game);
            io.to(game.gameId).emit(Events.END_GAME, game);
            io.socketsLeave(game.gameId);
            finishedGamesList.set(game);
            gamesList.delete(game.gameId);
            socket.user.gameId = null;
          } else {
            io.to(game.gameId)
                .emit(Events.END_ROUND, game.currentRound);
            game.newRound();
            io.to(game.gameId)
                .emit(Events.NEW_ROUND, game.currentRound);
          }
        }
      }
    } catch (err) {
      // log error
      logger.log({level: 'info',
        message: `Player ${player.username} was 
                registered ${time.now()}`} );
      console.log(err);
    }
  });
});
io.of('/').adapter.on('create-room', (room) => {
  console.log(`room ${room} was created`);
});
io.of('/').adapter.on('join-room', (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
