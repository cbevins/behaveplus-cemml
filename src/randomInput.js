/**
 * Generates some random fire behavior input for example2.js
 */

// Returns float x, where min <= x < max
function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

// Returns integer i, where min <= i < max
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// These are the possible fuel models
const fuels = ['gr1', 'gr2', 'gr3', 'gr4', 'gr7', 'gs1', 'gs2', 'sh1', 'sh2', 'sh5', 'sh7', 'tu1']

/**
 * Returns an example2.js fire behavior input object.
 */
export function randomInput() {
  const data = {
    fuel: fuels[randomInt(0, fuels.length)],
    moisDead: randomFloat(0.01, 0.2),
    moisLive: randomFloat(0.5, 3),
    windAt20Ft: randomFloat(0, 20*88),
    slopeSteepness: randomFloat(0, 2),
    canopyBaseHt: randomFloat(0, 10),
    canopyBulk:randomFloat(0, 0.03),
    canopyCover: randomFloat(0,1),
    canopyFoliarMoist: randomFloat(0.5, 2),
    timeSinceIgnition: 60
  }
  data.canopyTotalHt = data.canopyBaseHt + randomFloat(0, 40)
  return data
}
