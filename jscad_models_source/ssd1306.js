/**
 * Adapter for SSD1306
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 23, caption: 'Overall height' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOUNTING_Y_DIST = 23;
const MOUNTING_X_DIST = 20;
const MOUNTING_DIAMETER = 6;

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const m3 = params.m3;
  const bigger = params.bigger;

  // Mounting points for sensor
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [-MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [MOUNTING_X_DIST/2, MOUNTING_DIAMETER/2, height/2], segments: 32}))

  let yPos = MOUNTING_DIAMETER/2 + MOUNTING_Y_DIST
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [-MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [MOUNTING_X_DIST/2, yPos, height/2], segments: 32}))

  // Beam connecting top to bottom mounting points
  yPos = MOUNTING_DIAMETER/2 + MOUNTING_Y_DIST/2
  solids.push(cuboid({size: [MOUNTING_DIAMETER, MOUNTING_Y_DIST, 8], center: [-MOUNTING_X_DIST/2, yPos, 4]}))
  solids.push(cuboid({size: [MOUNTING_DIAMETER, MOUNTING_Y_DIST, 8], center: [MOUNTING_X_DIST/2, yPos, 4]}))


  // Base
  if (bigger) {
    solids.push(cuboid({size: [MOUNTING_X_DIST, 24, 8], center: [0, 12, 4]}))
  } else {
    solids.push(cuboid({size: [MOUNTING_X_DIST, 16, 8], center: [0, 8, 4]}))
  }

  holes.push(legoHole(0, 4, 4, params))
  holes.push(legoHole(-8, 12, 4, params))
  holes.push(legoHole(0, 12, 4, params))
  holes.push(legoHole(8, 12, 4, params))
  if (bigger) {
    holes.push(legoHole(-8, 20, 4, params))
    holes.push(legoHole(0, 20, 4, params))
    holes.push(legoHole(8, 20, 4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }