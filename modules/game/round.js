/** Class representing the Round of Game. */
class Round {
  /**
    * The game rules class.
    * @param {string} gameId - ID of specific game
    * @param {int} roundNumber - number of round in game
    */
  constructor({gameId, roundNumber}) {
    this.winner = null;
    this.playersChoice = {};
    this.gameId = gameId;
    this.tie = false;
    this.roundNumber = roundNumber;
  }
  /**
   * Getter to check if round is finished
   * @return {boolean} - if game is finished
   *  */
  get isFinished() {
    return (this.tie || this.winner);
  }
  /**
   * procedure to finish game
   * @param {Object} winner - {id:'winnerID'}
   * this function called if someone win by
   * round timeout
   */
  registerRoundWin(winner) {
    this.winner = winner;
  }
}
export {Round};
