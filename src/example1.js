/**
 * This is an example behaveplus-radical processing file for use by the
 *  Center for Environmental Management of Military Lands
 *  at Colorado State University, Fort Collins, CO.
 *
 * It demonstrates a batch run where all input values are defined up front
 * to produce an orthogonal set of results stored in a text file.
 * Each required input is assigned an array of values to be iterated,
 * and the program writes an orthogonal set of outputs to a CSV file.
 * This is convenient, say, for generating data sets for subsequent graphical display.
 *
 * The selected surface fire outputs are:
 * - surface fire spread rate (ft/min) at the fire head
 * - surface fire fireline intensity (Btu/ft/s) at the fire head
 * - surface fire flame length (ft) at the fire head
 * - surface fire size (ft2)
 * - surface fire perimeter (ft)
 * - estimated wind speed adjustment factor (dl)
 * - estimated wind speed at midflame height (ft/min)
 *
 * The above outputs require the following inputs:
 * - primary fuel model (catalog key)
 * - dead fuel moisture (dl)
 * - live fuel moisture content (dl)
 * - wind speed at 20 ft (ft/min)
 * - slope steepness ratio (vertical rise / horizontal reach)
 * - elapsed time since ignition (min)
 *
 * Because the 20-ft wind speed is input, the wind adjustment factor and
 * wind speed at midflame height must be estimated, which requires the following
 * additional inputs:
 * - canopy height (ft)
 * - canopy base ht (ft)
 * - canopy cover (dl)
 *
 * Additionally, the following crown fire outputs may be selected:
 * - active crown fire spread rate (ft/min)
 * - active crown fire fireline intensity (Btu/ft/s)
 * - active crown fire flame length (ft)
 * - crown fire type (key)
 *
 * The above crown fire outputs require the following additional inputs:
 * - canopy fuel bulk density (lb/ft3)
 * - canopy foliar moisture content (dl)
 */
import * as Dag from '@cbevins/behaveplus-radical'
import * as fs from 'fs'

// Create a writeable stream to hold the results
const fileName = 'example1.results.txt'
const writer = fs.createWriteStream(fileName, {flags: 'w'})
.on('error', function (err) { console.log('Received error:', err) })

/**
 * At the end of every run, behaveplus-radical calls a results storage function.
 * The internal default function simply stores the results in memory for each variable.
 * Here, though, we define a new storage function that will write results to a simple CSV file
 * (See Step 5 below, where the DAG is instructed to use this as the storage function)
 *
 * Each run produces a single record containing the run's input and output variable values
 * A list of the record fields is displayed upon program completion.
 */
function customStore( dag ) {
  const fields = []
  dag.results.map.forEach((runs, node) => fields.push(node.displayValue()))
  writer.write(fields.join(', ')+'\n')
}

// Step 1 - create a behaveplus-radical directed acyclical graph (DAG)
const dag = new Dag.Bpx()

// Step 2 - configure input choices and computational options
dag.setConfigs([
  // We use a single primary fuel model from the Burgan & Scott catalog
  ['configure.fuel.primary', ['catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'][0]],
  // There is no secondary fuel model
  ['configure.fuel.secondary', ['none', 'catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'][0]],
  // Cured herb fraction is estimated from the live herb fuel moisture
  ['configure.fuel.curedHerbFraction', ['input', 'estimated'][1]],
  // Fuel moistures are entered by life category
  ['configure.fuel.moisture', ['individual', 'liveCategory', 'category', 'catalog'][2]],
  // Slope steepness is entered as ratio of vertical rise / horizontal reach
  ['configure.slope.steepness', ['ratio', 'degrees', 'map'][0]],
  // Wind direction is assumed to be upslope (so no need to enter wind source or aspect)
  ['configure.wind.direction', ['sourceFromNorth', 'headingFromUpslope', 'upslope'][2]],
  // CEMML preferes to enter wind speed at 20-ft
  ['configure.wind.speed', ['at10m', 'at20ft', 'atMidflame'][1]],
  // Follow Pat Andrews' (2020) recommendation to remove limit spread rate
  ['configure.fire.effectiveWindSpeedLimit', ['applied', 'ignored'][1]],
  // Prefer to estimate the wind adjustment factor (rather than enter it as input)
  ['configure.fuel.windSpeedAdjustmentFactor', ['input', 'estimated'][1]],

  // The following configuration options are not active for this example,
  // but are included here for reference/completeness.

  // If not linked to a surface fire, prefer to input fireline intensity or flame length?
  ['configure.fire.firelineIntensity', ['firelineIntensity', 'flameLength'][1]],
  // If not linked to a surface fire, prefer to input length-to-width ratio or effective wind speed?
  ['configure.fire.lengthToWidthRatio', ['lengthToWidthRatio', 'effectiveWindSpeed'][0]],
  // If both primary and secondary fuels are present, which weighting method should be applied?
  ['configure.fire.weightingMethod', ['arithmetic', 'expected', 'harmonic'][0]],
  // If requesting fire behavior in a specific direction, it is with respect to:
  ['configure.fire.vector', ['fromHead', 'fromUpslope', 'fromNorth'][0]],
  // If performing chaparral fuel modeling, prefer to enter or estimate total fuel load?
  ['configure.fuel.chaparralTotalLoad', ['input', 'estimated'][0]]
])

// Step 3 - specify the fire behavior variables to be produced
// (See ./docs/BehavePlusAlphabeticalOrder.js for complete list of 1200+ names)
dag.setSelected([
  // surface fire outputs
  ['surface.fire.ellipse.head.spreadRate', true],
  ['surface.fire.ellipse.head.firelineIntensity', true],
  ['surface.fire.ellipse.head.flameLength', true],
  ['surface.fire.ellipse.size.area', true],
  ['surface.fire.ellipse.size.perimeter', true],
  // wind speed outputs
  ['surface.fire.ellipse.wind.speed.atMidflame', true],
  ['surface.primary.fuel.fire.windSpeedAdjustmentFactor', true],
  // crown fire outputs
  ['crown.fire.active.firelineIntensity', true],
  ['crown.fire.active.flameLength', true],
  ['crown.fire.active.spreadRate', true],
  ['crown.fire.initiation.type', true]
])

// If interested, uncomment the following statement to request and display the active configuration settings
// console.log('The active configuration options are:',
//   dag.requiredConfigNodes().map(node => `${node.key} = '${node.value}'`))

// Step 4 - if interested, request and display the required inputs
console.log('Required inputs are:', dag.requiredInputNodes().map(node => node.key))

// Define the input values:
// Some possible fuel models appropriate to dry climate grass, grass-shrub, grass-timber
// Please see Scott & Burgan for full list and key
// gr1: 'Short, sparse, dry climate grass'
// gr2: 'Low load, dry climate grass'
// gr4: 'Moderate load, dry climate grass'
// gr7: 'High load, dry climate grass'
// gs1: 'Low load, dry climate grass-shrub'
// gs2: 'Moderate load, dry climate grass-shrub'
// sh1: 'Low load, dry climate shrub'
// sh2: 'Moderate load, dry climate shrub'
// sh5: 'High load, dry climate shrub'
// sh7: 'Very high load, dry climate shrub'
// tu1: 'Light load, dry climate timber-grass-shrub'
// tu5: 'Very high load, dry climate timber-shrub'
const fuel = ['gr1', 'gs1', 'sh1', 'tu1']
// Wind at 20-ft (ft/min)
const windAt20Ft = []
for (let i = 0; i < 21;  i+=5) { windAt20Ft.push(i * 88) } // 88 converts mi/h to ft/min
// Dead fuel moisture content (ratio water mass / ovendry fuel mass)
const moisDead = []
for (let i = 1; i <= 20; i++) { moisDead.push(i * 0.01) }
// Live fuel moisture content (ratio water mass / ovendry fuel mass)
const moisLive = [0.5, 1, 1.5, 2]
// Slope steepness ratio (ratio of vertical rise / horizonatl reach)
const slopeSteepness = [0, 0.25, 0.5, 0.75, 1, 2]
// Canopy heights (ft), bulk density (lb fuel /ft3 crown), and cover (dl)
const canopyBaseHt = [0]
const canopyTotalHt = [0]
const canopyBulk = [0.01] // only required if selecting crown fire outputs
const canopyCover = [0]
const canopyFoliarMoist = [1] // (ratio water mass / ovendry fuel mass)
// Elapsed time since since ignition
const timeSinceIgnition = [60] // min

// Step 5 - have the Dag call our custom storage function after every run
dag.setStoreFunction(customStore)
// Bump up the run limit so we can stress test with a lot of inputs
dag.setRunLimit(10000000)

// Step 6 - generate an orthogonal set of results
dag.runInputs([
  ['site.moisture.live.category', moisLive],
  ['surface.primary.fuel.model.catalogKey', fuel],
  ['site.moisture.dead.category', moisDead],
  ['site.canopy.crown.baseHeight', canopyBaseHt],
  ['site.canopy.crown.totalHeight', canopyTotalHt],
  ['site.canopy.cover', canopyCover],
  ['site.slope.steepness.ratio', slopeSteepness],
  ['site.wind.speed.at20ft', windAt20Ft],
  ['site.canopy.fuel.bulkDensity', canopyBulk], // only used if selecting crown fire outputs
  ['site.canopy.fuel.foliar.moistureContent', canopyFoliarMoist],  // only used if selecting crown fire outputs
  ['site.fire.time.sinceIgnition', timeSinceIgnition], // only used if selecting fire area or perimeter outputs
])

// Step 7 - close the output file and display run times
writer.end()
const results = dag.results()
let rps = (results.runs / (0.001 * results.elapsed)).toFixed(0)
console.log(`\nThere were ${results.runs} runs requiring ${results.elapsed} milliseconds (${rps} runs/s): ${results.message}`)

// Step 8 - display the output file fields
let str = `\nThe '${fileName}' output file fields are:\n`
let n = 1
results.map.forEach((runs, node) => {
  str += `${n++}: ${node.key} (${node.variant.displayUnits()})\n`
})
console.log(str)
