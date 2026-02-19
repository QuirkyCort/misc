/**
 * Adapter for HW-127 (HMC5883L)
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOUNTING_LENGTH = 8.5;

const main = (params) => {
  const solids = [];
  const holes = [];

  const m3 = params.m3;
  const bigger = params.bigger;

  // Mounting points for sensor
  solids.push(cuboid({size: [6, 8, 3], center: [MOUNTING_LENGTH/2, 0, 1.5]}))
  solids.push(cuboid({size: [6, 8, 3], center: [-MOUNTING_LENGTH/2, 0, 1.5]}))

  solids.push(cuboid({size: [MOUNTING_LENGTH+6, 8, 8], center: [0, 0, -4]}))

  holes.push(cylinder({radius: m3/2, height: 11, center: [MOUNTING_LENGTH/2, -1, -2.5], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: 11, center: [-MOUNTING_LENGTH/2, -1, -2.5], segments: 32}))

  // Base
  if (bigger) {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 12, -4]}))
  } else {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 12, -4]}))
  }


  if (bigger) {
    holes.push(legoHole(0, 8, -4, params))
    holes.push(legoHole(-8, 8, -4, params))
    holes.push(legoHole(8, 8, -4, params))
    holes.push(legoHole(0, 16, -4, params))
    holes.push(legoHole(-8, 16, -4, params))
    holes.push(legoHole(8, 16, -4, params))
  } else {
    holes.push(legoHole(-4, 8, -4, params))
    holes.push(legoHole(4, 8, -4, params))
    holes.push(legoHole(-4, 16, -4, params))
    holes.push(legoHole(4, 16, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
