/**
 * Adapter for HW-127 (HMC5883L)
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_LENGTH = 8.5;

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
