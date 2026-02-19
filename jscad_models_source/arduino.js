/**
 * Adapter for Arduino
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Overall height' },
    { name: 'diameter', type: 'float', initial: 6, step: 0.5, caption: 'Diameter of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'smaller', type: 'checkbox', checked: false, caption: 'Smaller base' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOUNTING_LENGTH = 55.63;
const MOUNTING_WIDTH = 19.1;

const HOLE_1 = [-25.4, 29.15]
const HOLE_2 = [25.4, 13.95]
const HOLE_3 = [25.4, -13.95]
const HOLE_4 = [-26.7, -19.05]

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const diameter = params.diameter;
  const m3 = params.m3;
  const smaller = params.smaller;

  // Mounting points for sensor
  solids.push(cylinder({radius: diameter/2, height: height, center: [HOLE_1[0], HOLE_1[1], height/2-8], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [HOLE_2[0], HOLE_2[1], height/2-8], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [HOLE_3[0], HOLE_3[1], height/2-8], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [HOLE_4[0], HOLE_4[1], height/2-8], segments: 32}))

  holes.push(cylinder({radius: m3/2, height: height + 16, center: [HOLE_1[0], HOLE_1[1], height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [HOLE_2[0], HOLE_2[1], height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [HOLE_3[0], HOLE_3[1], height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [HOLE_4[0], HOLE_4[1], height/2-8], segments: 32}))

  // Base
  solids.push(cuboid({size: [8, HOLE_2[1]-HOLE_3[1], 8], center: [24, 0, -4]}))
  solids.push(cuboid({size: [8, HOLE_1[1]-HOLE_4[1]-2, 8], center: [-24, (HOLE_1[1] + HOLE_4[1])/2-1, -4]}))
  solids.push(cuboid({size: [48, 8, 8], center: [0, 16, -4]}))
  solids.push(cuboid({size: [48, 8, 8], center: [0, -16, -4]}))

  solids.push(cylinder({radius: 4, height: 8, center: [-24, HOLE_1[1] - 2, -4], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [24, 16, -4], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [24, -16, -4], segments: 32}))

  for (let y=-1; y<=1; y++) {
    for (let x=-3; x<=4; x++) {
      holes.push(legoHole(x*8, y*8, -4, params))
    }
  }
  for (let x=-3; x<=2; x++) {
    holes.push(legoHole(x*8, 2*8, -4, params))
  }
  for (let x=-2; x<=2; x++) {
    holes.push(legoHole(x*8, -2*8, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }

