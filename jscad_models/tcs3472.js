/**
 * Adapter for TCS3472
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 18, caption: 'Overall height' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'offset', type: 'checkbox', checked: false, caption: 'Offset mount point to one side' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_LENGTH = 25.87;
const MOUNTING_DIAMETER = 6;

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
  const offset = params.offset;

  // Mounting points for sensor
  let yPos = 0;
  if (offset) {
    if (bigger) {
      yPos = -12 + MOUNTING_DIAMETER / 2
    } else {
      yPos = -8 + MOUNTING_DIAMETER /2
    }
  }

  solids.push(cuboid({size: [MOUNTING_LENGTH, 6, 8], center: [0, yPos, -4]}))

  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [MOUNTING_LENGTH/2, yPos, height/2-8], segments: 32}))
  solids.push(cylinder({radius: MOUNTING_DIAMETER/2, height: height, center: [-MOUNTING_LENGTH/2, yPos, height/2-8], segments: 32}))

  holes.push(cylinder({radius: m3/2, height: height, center: [MOUNTING_LENGTH/2, yPos, height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-MOUNTING_LENGTH/2, yPos, height/2-8], segments: 32}))

  // Base
  if (bigger) {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 0, -4]}))

    for (let x=-1; x<=1; x++) {
      for (let y=-1; y<=1; y++) {
        holes.push(legoHole(x*8, y*8, -4, params))
      }
    }
  } else {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 0, -4]}))

    holes.push(legoHole(-4, -4, -4, params))
    holes.push(legoHole(-4, 4, -4, params))
    holes.push(legoHole(4, -4, -4, params))
    holes.push(legoHole(4, 4, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }