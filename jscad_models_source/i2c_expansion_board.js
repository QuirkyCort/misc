/**
 * Adapter for I2C Expansion Board
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Overall height' },
    { name: 'diameter', type: 'float', initial: 6, step: 0.5, caption: 'Diameter of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOUNTING_LENGTH = 33;
const MOUNTING_WIDTH = 15;

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height - 8;
  const diameter = params.diameter;
  const m3 = params.m3;
  const type = params.type;

  // Mounting points for sensor
  solids.push(cylinder({radius: diameter/2, height: height, center: [MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2], segments: 32}))

  holes.push(cylinder({radius: m3/2, height: height + 16, center: [MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2], segments: 32}))

  // Base
  let baseWidth = MOUNTING_LENGTH + diameter;
  solids.push(cuboid({size: [baseWidth, 8, 8], center: [0, 8, -4]}))
  solids.push(cuboid({size: [baseWidth, 8, 8], center: [0, -8, -4]}))

  solids.push(cuboid({size: [8, 8, 8], center: [-8, 0, -4]}))
  solids.push(cuboid({size: [8, 8, 8], center: [8, 0, -4]}))

  holes.push(legoHole(0, 8, -4, params))
  holes.push(legoHole(0, -8, -4, params))
  holes.push(legoHole(-8, 8, -4, params))
  holes.push(legoHole(8, 8, -4, params))
  holes.push(legoHole(-8, -8, -4, params))
  holes.push(legoHole(8, -8, -4, params))
  holes.push(legoHole(-8, 0, -4, params))
  holes.push(legoHole(8, 0, -4, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }

