import {Round} from './round';

/** Class representing the Game. */
class Game {
  /**
    * The game rules class.
    * @param {int} rounds Number of rounds.
    * @param {int} timePerRound Time between choice.
    * @param {string} gameId - ID of specific game
    * @param {object} playerOne - player that creates the game become playerOne
    */
  constructor({rounds = 3, timePerRound = 30, gameId,
    playerOne}) {
    // some very simple check
    // in fact this check should
    // done before class constructor call
    this.rounds = (typeof rounds !== 'number' || rounds === 0) ? 3 : rounds;
    this.timePerRound = timePerRound;
    this.playerOne = {id: playerOne.id, username: playerOne.username};
    this.playerTwo = {id: null, username: null};
    this.emptyPlayer = {id: null, username: null};
    this.gameId = gameId;
    this.winner = null;
    this.tie = false;
    this.currentRound = new Round({gameId, roundNumber: 1});
    this.roundsHistory = [];
    this.pause = {isPaused: false, playerOne: null,
      playerTwo: null, pauseCalledBy: null};
    this.isFinished = false;
  }
  /**
   * game pause function,
   * stores players, removes
   * @param {Object} pauseCalledBy - pause caller param
   */
  pauseGame(pauseCalledBy) {
    this.pause.playerOne = this.playerOne;
    this.pause.playerTwo = this.playerTwo;
    this.pause.pauseCalledBy = pauseCalledBy;
    this.playerOne = this.emptyPlayer;
    this.playerTwo = this.emptyPlayer;
    this.pause.isPaused = true;
  }
  /**
   * function increments winner player wins
   * @param {Object} player - object
   * @return {Object} player
   */
  addPlayer(player) {
    if (!this.playerOne.id) {
      this.playerOne = player;
    } else {
      this.playerTwo = player;
    }
    return true;
  }
  /**
   * function increments winner player wins
   * @return {any}
   */
  newRound() {
    const roundNumber = this.currentRound.roundNumber + 1;
    this.currentRound = new Round({gameId: this.gameId, roundNumber});
    return this.currentRound;
  }
  /**
   * procedure to finish game
   * @param {Object} winner - {id:'winnerID'}
   * this function must be called if someone
   * leave the game
   */
  registerGameWin(winner) {
    this.winner = winner;
    this.isFinished = true;
  }
  /**
   * get all state values in one object
   * @return {Object}
   */
  getGameStatus() {
    return {isFinished: this.isFinished, gameId: this.gameId,
      winner: this.winner.username, tie: this.tie};
  }
  /**
   * procedure to finish game
   */
  finishGame() {
    this.currentRound = null;
    const playersWinsSum = {};
    playersWinsSum[this.playerOne.id] = 0;
    playersWinsSum[this.playerTwo.id] = 0;
    for (let i = 0; i < this.roundsHistory.length; i++) {
      const round = this.roundsHistory[i];
      if (round.winner.id) {
        playersWinsSum[round.winner.id]++;
      }
    };
    const playerOneSum = playersWinsSum[this.playerOne.id];
    const playerTwoSum = playersWinsSum[this.playerTwo.id];
    if (playerOneSum === playerTwoSum) {
      this.tie = true;
    } else {
      if (playerOneSum > playerTwoSum) {
        this.winner = this.playerOne;
      } else {
        this.winner = this.playerTwo;
      }
    }
    this.isFinished = true;
  }
  /**
   * play game round procedure
   */
  playGame() {
    const playerOneChoice = this.currentRound.playersChoice[this.playerOne.id];
    const playerTwoChoice = this.currentRound.playersChoice[this.playerTwo.id];
    const winner = chooseWinner(playerOneChoice, playerTwoChoice);
    switch (winner) {
      case 0:
        this.currentRound.tie = true;
        break;
      case 1:
        this.currentRound.winner = this.playerOne;
        break;
      case 2:
        this.currentRound.winner = this.playerTwo;
        break;
    };
    this.roundsHistory.push(this.currentRound);
  }
  /**
   * checks if current round is ready to play
   * @return {boolean}
   */
  currentRoundIsPlayable() {
    const playerOneChoice = this.currentRound.playersChoice[this.playerOne.id];
    const playerTwoChoice = this.currentRound.playersChoice[this.playerTwo.id];
    return playerOneChoice && playerTwoChoice;
  }
  /**
   * checks if current round is ready to play
   * @return {boolean}
   */
  gameCanStart() {
    return this.playerOne.id && this.playerTwo.id && !this.pause.isPaused;
  }

  /**
   * checks if game is over
   * and mark isFinished to true
   * in some cases isFinished can be true
   * @return {boolean}
   */
  isFinalRound() {
    return (this.currentRound.roundNumber === this.rounds);
  }
}

/**
 * Function takes as params rock = 0,
 * paper = 1, skissors = 2,
 * returns 0 if idle, 1 if playerOneChoice win,
 * 2 if player 2 choice win
 *
 * @param {int} playerOneChoice
 * @param {int} playerTwoChoice
 * @return {int}
 */
function chooseWinner(playerOneChoice, playerTwoChoice) {
  return (3 + playerOneChoice - playerTwoChoice) % 3;
};
export {chooseWinner, Game};
