/**
 * Adapter for GY-521 (MPU-6050) and MPU-9250
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Sensor Type', values: ['gy521', 'mpu9250'], captions: ['GY-521', 'MPU-9250'], initial: 0 },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_LENGTH_GY521 = 15.56;
const MOUNTING_LENGTH_9250 = 20.26;

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 64})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 64})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 64})

  return union(center, union(top, bottom));
}

const merge = (solids, holes) => {
  let shape = solids[0];

  for (let i=1; i<solids.length; i++) {
    shape = union(shape, solids[i])
  }

  for (let i=0; i<holes.length; i++) {
    shape = subtract(shape, holes[i])
  }

  return shape;
}

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
