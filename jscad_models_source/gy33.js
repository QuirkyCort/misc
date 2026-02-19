/**
 * Adapter for GY-33
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 18, caption: 'Overall height' },
    { name: 'diameter', type: 'float', initial: 6, step: 0.5, caption: 'Diameter of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'B'], captions: ['A1', 'A2', 'B'], initial: 'A1' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height - 8;
  const diameter = params.diameter;
  const m3 = params.m3;
  const type = params.type;

  // Mounting points for sensor
  solids.push(cylinder({radius: diameter/2, height: height, center: [10, 9, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-10, 9, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [10, -9, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-10, -9, height/2], segments: 32}))

  holes.push(cylinder({radius: m3/2, height: height + 16, center: [10, 9, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-10, 9, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [10, -9, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-10, -9, height/2], segments: 32}))

  // Base
  let baseWidth = 40;
  if (type == 'A2' || type == 'B') {
    baseWidth = 20 + diameter;
  }
  solids.push(cuboid({size: [baseWidth, 8, 8], center: [0, 8, -4]}))
  solids.push(cuboid({size: [baseWidth, 8, 8], center: [0, -8, -4]}))

  if (type == 'A1' || type == 'A2') {
    solids.push(cuboid({size: [8, 8, 8], center: [-8, 0, -4]}))
    solids.push(cuboid({size: [8, 8, 8], center: [8, 0, -4]}))
  } else if (type == 'B') {
    solids.push(cuboid({size: [8, 8, 8], center: [-4, 0, -4]}))
    solids.push(cuboid({size: [8, 8, 8], center: [4, 0, -4]}))
  }

  if (type == 'A1' || type == 'A2') {
    holes.push(legoHole(0, 8, -4, params))
    holes.push(legoHole(0, -8, -4, params))
    holes.push(legoHole(-8, 0, -4, params))
    holes.push(legoHole(8, 0, -4, params))

    holes.push(legoHole(16, 8, -4, params))
    holes.push(legoHole(-16, 8, -4, params))
    holes.push(legoHole(16, -8, -4, params))
    holes.push(legoHole(-16, -8, -4, params))
  } else if (type == 'B') {
    holes.push(legoHole(-4, 8, -4, params))
    holes.push(legoHole(4, 8, -4, params))
    holes.push(legoHole(-4, -8, -4, params))
    holes.push(legoHole(4, -8, -4, params))
    holes.push(legoHole(-4, 0, -4, params))
    holes.push(legoHole(4, 0, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }

