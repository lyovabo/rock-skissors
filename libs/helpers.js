/**
 * Return random number in a given range
 * @param {int} min
 * @param {int} max
 * @return {int} random number
 */
function randomBetween(min, max) {
  return Math.floor(
      Math.random() * (max - min + 1) + min,
  );
}
/**
 * Return random number in a given range
 * @return {string} random game string
 */
function getRandomGameId() {
  const retVal = 'game-'+randomBetween(100000, 1000000);
  console.log('getRandomBetween was called with val: '+retVal);
  return retVal;
}
export {randomBetween, getRandomGameId};
