# behaveplus-cemml

Fire behavior generator for CEMML using the @cbevins/behaveplus-radical fire behavior package.

---

## Requirements

You must have the following installed on your computer prior to downloading and installing this package:
 - [Node.js](https://nodejs.org/en/) version 14.0.0 or greater (which include **NPM**)
 - [git](https://git-scm.com/)

---

## Installation

Change into the directory on your computer that will contain the **behaveplus-cemml** project subfolder.  Clone the **behaveplus-cemml** repository from GitHub by entering the following command:
```
> git clone https://github.com/cbevins/behaveplus-cemml.git
```

This will create the **behaveplus-cemml** folder.  To test the installation:
```
> cd behaveplus-cemml
> npm run hello
```

Eveything is installed fine if the program responds with:
```
Hello from behaveplus-cemml
```

---

## Contents

There are two example files that may be customized for your needs.

### example1.js

**example1.js** demonstrates and documents how to generate a potentially very large number of results from a few, predefined inputs.  Each required input is assigned an array of values to be iterated, and the program writes an orthogonal set of outputs to a CSV file.  This is convenient, say, for generating data sets for subsequent graphical display.

To run the program from the **behaveplus-cemml** folder, you can either enter:
```
> npm run example1
```
or
```
> node ./src/example1.js
```


### example2.js

**example2.js** demonstrates how to generates fire behavior outputs on a case-by-case basis.  This is most useful if you are processing individual samples from various locations or times from a data file or some other stream.

To run the program from the **behaveplus-cemml** folder, you can either enter:
```
> npm run example2
```
or
```
> node ./src/example2.js
```


