import * as Dag from '@cbevins/behaveplus-radical'

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
  dag.results.map.forEach((runs, node) => {
    fields.push( node.key.padEnd(50, ' ') +
      node.value.toString().padStart(8, ' ') +
      node.displayString().padStart(20, ' ') )
  })
  console.log(fields.join('\n'))
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
  ['configure.fuel.moisture', ['individual', 'liveCategory', 'category', 'catalog'][0]],
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

// Step 5 - have the Dag call our custom storage function after every run
dag.setStoreFunction(customStore)

// Step 6 - simulate reading input data from a file or other stream...
let elapsed = new Date()
dag.runInputs([
  ['surface.primary.fuel.model.catalogKey', ['tu3']],
    ['site.moisture.live.herb', [.5]],
    ['site.moisture.live.stem', [.9]],
    ['site.moisture.dead.tl1h', [.06]],
    ['site.moisture.dead.tl10h', [.08]],
    ['site.moisture.dead.tl100h', [.1]],
    ['site.canopy.crown.baseHeight', [5]],
    ['site.canopy.crown.totalHeight', [60]],
    ['site.canopy.cover', [0.75]],
    ['site.slope.steepness.ratio', [0.1]],
    ['site.wind.speed.at20ft', [15*88]],
    ['site.canopy.fuel.bulkDensity', [0.032]], // only used if selecting crown fire outputs
    ['site.canopy.fuel.foliar.moistureContent', [1]],  // only used if selecting crown fire outputs
    ['site.fire.time.sinceIgnition', [8*60]], // only used if selecting fire area or perimeter outputs
  ])

// Step 8 - display the output file fields
// let str = `\nThe output file fields are:\n`
// let n = 1
// dag.results().map.forEach((runs, node) => {
//   str += `${n++}: ${node.key} (${node.variant.displayUnits()})\n`
// })
// console.log(str)
