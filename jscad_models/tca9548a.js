/**
 * Adapter for TCA9548A
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Overall height' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_LENGTH = 25.4;

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 32})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 32})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 32})

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


