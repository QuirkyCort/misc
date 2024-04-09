/**
 * Adapter for PCA9685
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Overall height' },
    { name: 'diameter', type: 'float', initial: 6, step: 0.5, caption: 'Diameter of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'smaller', type: 'checkbox', checked: false, caption: 'Smaller base' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_LENGTH = 55.63;
const MOUNTING_WIDTH = 19.1;

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
  const diameter = params.diameter;
  const m3 = params.m3;
  const smaller = params.smaller;

  // Mounting points for sensor
  solids.push(cylinder({radius: diameter/2, height: height, center: [MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2-8], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2-8], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2-8], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2-8], segments: 32}))

  holes.push(cylinder({radius: m3/2, height: height + 16, center: [MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-MOUNTING_LENGTH/2, MOUNTING_WIDTH/2, height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2-8], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-MOUNTING_LENGTH/2, -MOUNTING_WIDTH/2, height/2-8], segments: 32}))

  // Base
  if (smaller) {
    solids.push(cuboid({size: [diameter, MOUNTING_WIDTH, 8], center: [-MOUNTING_LENGTH/2, 0, -4]}))
    solids.push(cuboid({size: [diameter, MOUNTING_WIDTH, 8], center: [MOUNTING_LENGTH/2, 0, -4]}))
    solids.push(cuboid({size: [MOUNTING_LENGTH, 8, 8], center: [0, 0, -4]}))
  } else {
    solids.push(cuboid({size: [MOUNTING_LENGTH, MOUNTING_WIDTH+diameter, 8], center: [0, 0, -4]}))
    solids.push(cuboid({size: [MOUNTING_LENGTH+diameter, MOUNTING_WIDTH, 8], center: [0, 0, -4]}))
  }

  for (let y=-1; y<=1; y++) {
    for (let x=-2; x<=2; x++) {
      holes.push(legoHole(x*8, y*8, -4, params))
    }
  }
  holes.push(legoHole(-3*8, 0, -4, params))
  holes.push(legoHole(3*8, 0, -4, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }

