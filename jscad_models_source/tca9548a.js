/**
 * Adapter for TCA9548A
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Overall height' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOUNTING_LENGTH = 25.4;

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const m3 = params.m3;
  const bigger = params.bigger;

  // Mounting points for sensor
  solids.push(cuboid({size: [6, 10, height], center: [MOUNTING_LENGTH/2, 0, -height/2+4]}))
  solids.push(cuboid({size: [6, 10, height], center: [-MOUNTING_LENGTH/2, 0, -height/2+4]}))

  holes.push(cylinder({radius: m3/2, height: height, center: [MOUNTING_LENGTH/2, 0, -height/2+4], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-MOUNTING_LENGTH/2, 0, -height/2+4], segments: 32}))

  // Base
  if (bigger) {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 0, -4]}))

    holes.push(legoHole(0, 8, -4, params))
    holes.push(legoHole(-8, 8, -4, params))
    holes.push(legoHole(8, 8, -4, params))

    holes.push(legoHole(0, -8, -4, params))
    holes.push(legoHole(-8, -8, -4, params))
    holes.push(legoHole(8, -8, -4, params))

    holes.push(legoHole(0, 0, -4, params))
  } else {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 0, -4]}))
    solids.push(cuboid({size: [24, 10, 8], center: [0, 0, -4]}))

    holes.push(legoHole(-4, -4, -4, params))
    holes.push(legoHole(-4, 4, -4, params))
    holes.push(legoHole(4, -4, -4, params))
    holes.push(legoHole(4, 4, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }


