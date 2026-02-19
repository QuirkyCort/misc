/**
 * Shroud for TCS3472
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
    { name: 'diameter', type: 'float', initial: 12, caption: 'Inner diameter' },
    { name: 'wall_thickness', type: 'float', initial: 1.5, step: 0.1, caption: 'Wall Thickness' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
  ]
}

const MOUNTING_LENGTH = 25.87;

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const diameter = params.diameter;
  const wall_thickness = params.wall_thickness;
  const m3_hole = params.m3_hole;

  // Mounting points for sensor
  solids.push(cuboid({size: [MOUNTING_LENGTH, 7, 4], center: [0, 0, 2]}))

  solids.push(cylinder({radius: 3.5, height: 4, center: [MOUNTING_LENGTH/2, 0, 2], segments: 32}))
  solids.push(cylinder({radius: 3.5, height: 4, center: [-MOUNTING_LENGTH/2, 0, 2], segments: 32}))

  holes.push(cylinder({radius: m3_hole/2, height: 4, center: [MOUNTING_LENGTH/2, 0, 2], segments: 32}))
  holes.push(cylinder({radius: m3_hole/2, height: 4, center: [-MOUNTING_LENGTH/2, 0, 2], segments: 32}))

  // Shroud
  solids.push(cylinder({radius: diameter/2+wall_thickness, height: height, center: [0, 0, height/2], segments: 32}))

  holes.push(cylinder({radius: diameter/2, height: height, center: [0, 0, height/2], segments: 32}))

  holes.push(cuboid({size: [20, 1.5, 1.5], center: [0, 4, .75]}))


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }



