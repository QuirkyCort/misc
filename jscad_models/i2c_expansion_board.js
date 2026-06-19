/**
 * Adapter for I2C Expansion Board
 */

const jscad = require('@jscad/modeling')

const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid, polygon } = jscad.primitives
const { rotateX, rotateY, rotateZ, translate } = require('@jscad/modeling').transforms

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 32})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 32})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 32})

  return union(center, union(top, bottom));
}

const legoAxle = (x, y, z, depth, params) => {
  const solids = [];
  const holes = [];

  const length = params.legoAxleLength
  const width = params.legoAxleWidth
  const chamfer = params.legoAxleChamfer

  solids.push(cuboid({size: [length, width, depth], center: [0, 0, 0]}))
  solids.push(cuboid({size: [width, length, depth], center: [0, 0, 0]}))
  solids.push(translate([width/2, width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([-width/2, width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([width/2, -width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([-width/2, -width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))

  return translate([x, y, z], merge(solids, holes))
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

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Overall height' },
    { name: 'diameter', type: 'float', initial: 6, step: 0.5, caption: 'Diameter of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 5, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.4, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.9, step: 0.1, caption: 'Lego: Height of outer diameter' },
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

