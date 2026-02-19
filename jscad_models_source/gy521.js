/**
 * Adapter for GY-521 (MPU-6050) and MPU-9250
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Sensor Type', values: ['gy521', 'mpu9250'], captions: ['GY-521', 'MPU-9250'], initial: 'gy521' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const MOUNTING_LENGTH_GY521 = 15.56;
const MOUNTING_LENGTH_9250 = 20.26;

const main = (params) => {
  const solids = [];
  const holes = [];

  const type = params.type;
  const m3 = params.m3;
  const bigger = params.bigger;

  let mounting_length;
  if (type == 'mpu9250') {
    mounting_length = MOUNTING_LENGTH_9250;
  } else {
    mounting_length = MOUNTING_LENGTH_GY521;
  }

  // Mounting points for sensor
  solids.push(cuboid({size: [6, 8, 11], center: [mounting_length/2, 0, -2.5]}))
  solids.push(cuboid({size: [6, 8, 11], center: [-mounting_length/2, 0, -2.5]}))

  holes.push(cylinder({radius: m3/2, height: 11, center: [mounting_length/2, -1, -2.5], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: 11, center: [-mounting_length/2, -1, -2.5], segments: 32}))

  // Base
  if (bigger) {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 8, -4]}))
  } else {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 4, -4]}))
  }

  holes.push(legoHole(0, 0, -4, params))
  holes.push(legoHole(0, 8, -4, params))
  holes.push(legoHole(-8, 8, -4, params))
  holes.push(legoHole(8, 8, -4, params))

  if (bigger) {
    holes.push(legoHole(0, 16, -4, params))
    holes.push(legoHole(-8, 16, -4, params))
    holes.push(legoHole(8, 16, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
