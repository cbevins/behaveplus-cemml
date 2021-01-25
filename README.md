# behaveplus-cemml

Fire behavior generator for CEMML using the @cbevins/behaveplus-radical fire behavior package.

- [Requirements](#requirements)
- [Installation](#installation)
- [Contents](#contents)
  - [example1.js](#example1.js)
  - [example2.js](#example2.js)
  - [randomInput.js](#randomInput.js)
  - [BehavePlusNodesAlphabeticalOrder.js](#BehavePlusNodesAlphabeticalOrder.js)
- [API](#api)
  - [Step 1 - Creating the DAG](#step-1---creating-the-dag)
  - [Step 2 - Configuring the DAG](#step-2---configuring-the-dag)
  - [Step 3 - Select Outputs](#step-3---select-outputs)
  - [Step 4 - Set Input Values](#step-4---set-input-values)
  - [Storage Function](#storage-function)
  - [Run Limit](#run-limit)
- [Configuration Variables](#configuration-variables)

---

# Requirements

You must have the following installed on your computer prior to downloading and installing this package:
 - [Node.js](https://nodejs.org/en/) version 14.0.0 or greater (which include **NPM**)
 - [git](https://git-scm.com/)

---

# Installation

Change into the directory on your computer that will contain the new **behaveplus-cemml** project subfolder.  Clone the **behaveplus-cemml** repository from GitHub by entering the following command:
```
> git clone https://github.com/cbevins/behaveplus-cemml.git
```

This will create the **behaveplus-cemml** folder. Change into the new folder, install its dependencies (behaveplus-radical), and test the installation as follows:
```
> cd behaveplus-cemml
> npm install
> npm run hello
```

Eveything is installed fine if the program responds with:
```
Hello from behaveplus-cemml
```

---

# Contents

There are two example files that may be customized for your needs.

---

## example1.js

**behaveplus-cemml/src/example1.js** demonstrates and documents how to generate a potentially very large number of results from a few, predefined inputs.  Each required input is assigned an array of values to be iterated, and the program writes an orthogonal set of outputs to a CSV file.  This is convenient for generating data sets for subsequent graphical display or lookup tables.

To run the program from the **behaveplus-cemml** folder, you can either enter:
```
> npm run example1
```
which generates the output file **behaveplus-cemml/example1.results.txt**, or
```
> node ./src/example1.js
```
which generates the output file **behaveplus-cemml/src/example1.results.txt**.

---

## example2

**behaveplus-cemml/src/example2.js** demonstrates how to generate fire behavior outputs on a case-by-case basis.  This is most useful if you are processing individual samples from various locations or times whose data soure is a text file, web service, or some other input stream.

To run the program from the **behaveplus-cemml** folder, you can either enter:
```
> npm run example2
```
which generates the output file **behaveplus-cemml/example2.results.txt**, or
```
> node ./src/example2.js
```
which generates the output file **behaveplus-cemml/src/example2.results.txt**.

---

## randomInput.js

**behaveplus-cemml/src/randomInput.js** is a utility file used by **example2.js** to simulate input of 1000 random input samples from a text file or other data stream.

---

## BehavePlusNodesAlphabeticalOrder.js

**behaveplus-cemml/docs/BehavePlusNodesAlphabeticalOrder.js** contains the names of all (1200+) variables used by **behaveplus-radical**.

The surface fire variables of primary interest to CEMML include:
- 'surface.fire.ellipse.head.spreadRate' (ft/min),
- 'surface.fire.ellipse.head.firelineIntensity (BTU/ft-s)',
- 'surface.fire.ellipse.head.flameLength (ft)',
- 'surface.fire.ellipse.size.area' (ft2), and
- 'surface.fire.ellipse.size.perimeter' (ft).

The wind speed outputs include:
- 'surface.fire.ellipse.wind.speed.atMidflame' (ft/min), and
- 'surface.primary.fuel.fire.windSpeedAdjustmentFactor' (dl).

The crown fire outputs include:
- 'crown.fire.active.firelineIntensity' (BTU/ft-s),
- 'crown.fire.active.flameLength' (ft),
- 'crown.fire.active.spreadRate' (ft/min), and
- 'crown.fire.initiation.type' ('Active', 'Passive', 'Surface').

The above outputs require the following inputs.

Estimating surface fire spread rate, flame length, and fireline intensity requires:
- 'site.moisture.live.category' (dl)
- 'surface.primary.fuel.model.catalogKey' (string),
- 'site.moisture.dead.category' (dl)
- 'site.slope.steepness.ratio' (vertical rise / horizontal reach), and
- 'site.wind.speed.at20ft' (ft/min).

Estimating surface or crown fire distance, size, or perimeter requires:
- 'site.fire.time.sinceIgnition' (min).

Estimating the midflame wind speed from 20-ft wind and site conditions requires:
- 'site.canopy.crown.baseHeight' (ft),
- 'site.canopy.crown.totalHeight' (ft),
- 'site.canopy.cover' (dl).

Estimating crown fire behavior requires:
- 'site.canopy.fuel.bulkDensity' (lb/ft3),
- 'site.canopy.fuel.foliar.moistureContent' (dl),

---

## API

Only a small number of functions are required.

# Step 1 - Creating the DAG

Create an instance of the behaveplus-radical directed acyclical graph (DAG) via:
```js
import * as Dag from '@cbevins/behaveplus-radical'
// Step 1 - create a behaveplus-radical directed acyclical graph (DAG)
const dag = new Dag.Bpx()
```

# Step 2 - Configuring the DAG
```js
// Step 2 - configure input choices and computational options
dag.setConfigs(configArray)
```
The **configArray** is an array whose elements are themselves 2-element arrays specifying:
- the configuration variable name (string), and
- the configuration variable value (string).

While the following code works fine:
```js
dag.setConfigs([
  ['configure.fuel.curedHerbFraction', 'estimated'],
])
```

I prefer the more lengthy, but self-documenting form:
```js
dag.setConfigs([
  ['configure.fuel.curedHerbFraction', ['input', 'estimated'][1]],
])
```

For a complete list of all configuration variables and values,
see [Configuration Variables](#configuration-variables)

For example:

```js
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
```

# Step 3 - Select Outputs

```js
dag.setSelected(selectionArray)
```

The **selectionArray** is an array whose elements are themselves 2-element arrays specifying:
  - the name of the variable to be produced, and
  - **true** if the variable is added to the selection list, or **false** if the variable is removed from the selection list.

For example:
```js
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
```

See [BehavePlusNodesAlphabeticalOrder.js](#-behaveplusnodesalphabeticalorder.js) for a list of the variables used by CEMML.

# Step 4 - Set Input Values

```js
dag.runInputs(inputsArray)
```

The **inputsArray** is an array whose elements are themselves 2-element arrays specifying:
  - the name of the input variable, and
  - an array of 1 or more input values.

For example:
```js
const fuels= ['gr1', 'gs1', 'sh1', 'tu1'] // see Scott & Burgan
dag.runInputs([
  ['site.moisture.live.category', [0.5, 1, 1.5, 2, 3, 4], // dl
  ['surface.primary.fuel.model.catalogKey', fuels], // see Scott & Burgan
  ['site.moisture.dead.category', [0.05, 0.1, 0.15, 0.2]], // dl
  ['site.canopy.crown.baseHeight', [10]], // ft
  ['site.canopy.crown.totalHeight', [40]], // ft
  ['site.canopy.cover', [.5]],  // dl
  ['site.slope.steepness.ratio', [0, 0.5, 1, 4]], // dl
  ['site.wind.speed.at20ft', [0, 5*88, 10*88, 15*88, 20*88]], // ft/min
  ['site.canopy.fuel.bulkDensity', [0.01]], // lb/ft3
  ['site.canopy.fuel.foliar.moistureContent', [0.5]], // dl
  ['site.fire.time.sinceIgnition', [60]] // min
])
```

Note that **runInputs()** orthogonally iterates through each input value and performs the following tasks:
- sets the new input value,
- updates all the DAG's selected output values,
- calls a storage function to store all the required input and selected output values,
- repeats until all input values have been iterated.

# Storage Function

All required inputs and selected outputs are stored at the end of each run.  The default storage function simply pushes the vaiable's current value onto an array. The **runInputs()** example above results in 1920 runs (4 fuel models, 6 live moistures, 4 dead moistures, 4 slopes, and 5 wind speeds),
so each input and output will have a results array with 1920 values.

You may access a variables current value via:
```js
const node = dag.get('surface.fire.ellipse.head.spreadRate') // get reference to variable's node
console.log(node.value) // displays node value to full precision in native units
console.log(node.displayValue()) // displays node value to display precision and units-of-measure
```

You may substitute the default storage function with a custom function.  For example, to write each run's results to a file:
- first define the new storage function,
```js
function customStore( dag ) {
  const fields = []
  dag.results.map.forEach((runs, node) => fields.push(node.displayValue()))
  writer.write(fields.join(', ')+'\n')
}
```
- and then set it as the storage function:

```js
dag.setStoreFunction(customStore)
```

# Run Limit

By default, the maximum  number of runs that are allowed per runinputs() invocation is 10,000.  This is intended to prevent inadvertantly huge outputs.  You may change this via:

```js
dag.setRunLimit(10000000)
```
---

# Configuration Variables

The **behaveplus-radical** DAG has 14 configuration variables that control various input option and computational preferences:
- 'configure.fuel.primary' determines how the primary surface fuel will be entered.
  - 'catalog' [default] requires input of a fuel model catalog key.
  - 'behave' requires input of the 12 standard 'fuel modeling' parameters.
  - 'chaparral' requires input of the 4 or 5 (see below) dynamic chaparral fuel parameters.
  - 'palmettoGallberry' requires input of the 4 dynamic palmetto-gallberry fuel paranmeters.
  - 'westernAspen' requires input of the 2 dynamic western aspen fuel paranmeters.

- 'configure.fuel.secondary' determines how the secondary surface fuel will be entered.  It takes the same values as 'configure.fuel.primary' with the additional value of:
  - 'none' [default] indicates there is no secondary fuel model.
  - 'catalog', 'behave', 'chaparral', 'palmettoGallberry', and 'westernAspen' have the same effect as for the primary fuel, and causes 'two-fuel modeling' and fire behavior weighting methods to be applied.

- 'configure.fuel.curedHerbFraction' determines how cured herb fraction is determined.
  - 'input' [default].
  - 'estimated' from the live herbaceous fuel moisture content.

- 'configure.fuel.moisture' determines the number and type of surface fuel moisture content input.
  - 'individual' [default] requires 5 inputs for dead 1-h, 10-h, and 100-h time lag fuel moisture contents, and live herbaceous and stem fuel moisture contents.
  - 'liveCategory' requires 4 inputs for dead 1-h, 10-h, and 100-h time lag fuel moisture contents, and a single live fuel moisture content.
  - 'category' requires 2 moisture content inputs, one for all dead fuels and one for all live fuels.
  - 'catalog' is not currently used.

- 'configure.slope.steepness' determines how site slope steepness is entered.
  - 'ratio' [default]requires the input of slope vertical rise / horizontal reach (dl).
  - 'degrees' requires input of slope degrees.
  - 'map' estimates slope steepness from map scale, map contour interval, map transect distance, and number of map contours crossed over the transect distance.

- 'configure.wind.direction' determines how the wind direction is entered.
  - 'sourceFromNorth' [default] requires input of the direction *from which* the wind is blowing (degrees clockwise from North).
  - 'headingFromUpslope' requires input of the wind *heading vector* in degrees clockwise from *upslope*.
  - 'upslope' assumes the wind is heading upslope, and therefore neither wind direction nor site aspect inputs are required.

- 'configure.wind.speed' determines how the wind speed is entered.
  - 'at10m' [default] requires wind speed at 10-m *and* input or estimation of a wind speed adjustment factor (see 'configure.fuel.windSpeedAdjustmentFactor').
  - 'at20ft' requires wind speed at 20-ft *and* input or estimation of a wind speed adjustment factor (see 'configure.fuel.windSpeedAdjustmentFactor').
  - 'atMidflame' requires wind speed at midflame height, and does not require a wind speed adjustment factor.

- 'configure.fuel.windSpeedAdjustmentFactor' determines how the wind speed adjustment factor is determined.  It is only referenced if wind speed input is *not* at midflame height.
  - 'input' [default] requires direct entry of the adjustment factor.
  - 'estimated' requires 3 additional inputs for:
    - 'site.canopy.crown.baseHeight',
    - 'site.canopy.crown.totalHeight', and
    - 'site.canopy.cover'.

- 'configure.fire.effectiveWindSpeedLimit'
  - 'applied' [default] applies Rothermel's (1972) upper limit on the surface fire maximum spread rate.
  - 'ignored' follow Andrews' (2020) recommendation to remove the spread rate limit.

- 'configure.fire.weightingMethod' determines how the surface fire spread rate is weighted between the **primary** and **secondary** surface fuels.  This is only referenced if 'configure.fuel.secondary' is not 'none'.
  - 'arithmetic' [default] applies the arithmetic mean spread rate.
  - 'expected' is not yet implemented.
  - 'harmonic' applies the harmonic mean spread rate.

- 'configure.fire.firelineIntensity' determines how fireline intensity is determined *if* running the fire ellipse or crown fire modules in stand-alone mode (i.e., if the surface fire module is not active).
  - 'firelineIntensity' [default] prefers input of the surface fireline intensity.
  - 'flameLength' prefers input of the surface fire flame length.

- 'configure.fire.lengthToWidthRatio' determines how the surface fire ellipse length-to-width ratio is determined *if* running the fire ellipse module in stand-alone mode (i.e., if the surface fire module is not active).
  - 'lengthToWidthRatio' prefers input of the surface fire ellipse length-to-width ratio.
  - 'effectiveWindSpeed' prefers input of the effective wind speed the midflame wind speed plus the slope contribution equivalence).

- 'configure.fire.vector' determines how the fire vector is to be entered when requesting fire behavior at a direction other than head, back, or flank.  The fire vector direction may be entered as degrees clockwise from:
  - 'fromHead' the fire heading direction,
  - 'fromUpslope' the upslope direction, or
  - 'fromNorth'.

- 'configure.fuel.chaparralTotalLoad' determines whether the total chaparral fuel load will be estimated or input when performing chaparral fuel modeling (i.e., if 'configure.fuel.primary' or 'configure.fuel.secondary' are 'chaparral').
  - 'input' [default] requires input of the total chaparral fuel load.
  - 'estimated' estimated total chaparral fuel load from the fuel depth.
