/**
 * Adapter for JGA25 motors with metal brackets
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'width', type: 'int', initial: 5, step: 1, min: 5, caption: 'Base Width in Lego units (8mm)' },
    { name: 'length', type: 'int', initial: 5, step: 1, min:1, caption: 'Base Length in Lego units (8mm)' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MOUNTING_HOLES_Y = 14;
const MOUNTING_HOLES_X = 16;
const MOUNTING_HOLES_Y_OFFSET = 11;
const BRACKET_LENGTH = 34;

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

  const width = params.width;
  const length = params.length;
  const m3 = params.m3;

  let xOffset = 16;
  let baseWidth = 4 * 8;
  if (width % 2) {
    xOffset = 12;
    baseWidth = 3 * 8;
  }

  // Base
  solids.push(cuboid({size: [baseWidth, BRACKET_LENGTH, 8], center: [0, BRACKET_LENGTH/2, 0]}))

  // Mounting Holes
  holes.push(cylinder({radius: m3/2, height: 8, center: [MOUNTING_HOLES_X/2, MOUNTING_HOLES_Y_OFFSET, 0], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: 8, center: [-MOUNTING_HOLES_X/2, MOUNTING_HOLES_Y_OFFSET, 0], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: 8, center: [MOUNTING_HOLES_X/2, MOUNTING_HOLES_Y_OFFSET+MOUNTING_HOLES_Y, 0], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: 8, center: [-MOUNTING_HOLES_X/2, MOUNTING_HOLES_Y_OFFSET+MOUNTING_HOLES_Y, 0], segments: 32}))

  // Base for lego holes
  const extensionWidth = Math.ceil((width - 4) / 2) * 8;
  const extensionLength = length * 8;
  solids.push(cuboid({size: [extensionWidth, extensionLength, 8], center: [xOffset+extensionWidth/2, extensionLength/2, 0]}))
  solids.push(cuboid({size: [extensionWidth, extensionLength, 8], center: [-(xOffset+extensionWidth/2), extensionLength/2, 0]}))

  // Lego Holes
  for (let x=0; x<((width - 4) / 2); x++) {
    for (let y=0; y<length; y++) {
      holes.push(legoHole(xOffset + 4 + x*8, 4 + y*8, 0, params))
      holes.push(legoHole(-(xOffset + 4 + x*8), 4 + y*8, 0, params))
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
