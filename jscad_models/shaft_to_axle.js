/**
 * Adapter for d_shaft_to_axle
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives
const { rotateX, rotateZ, translate } = require('@jscad/modeling').transforms

const getParameterDefinitions = () => {
  return [
    { name: 'diameter', type: 'float', initial: 9, caption: 'Outer diameter' },
    { name: 'shaft_diameter', type: 'float', initial: 5, caption: 'Shaft diameter' },
    { name: 'd_depth', type: 'float', initial: 0.5, caption: 'Depth of flat surface on shaft (set to 0 if shaft does not have a flat)' },
    { name: 'shaft_depth', type: 'float', initial: 16, caption: 'Depth of shaft hole' },
    { name: 'lego_depth', type: 'float', initial: 16, caption: 'Depth of lego shaft' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Hole for M3 screw (set to 0 if not needed)' },
    { name: 'legoAxleLength', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Axle Length' },
    { name: 'legoAxleWidth', type: 'float', initial: 1.8, step: 0.1, caption: 'Lego: Axle Width' },
    { name: 'legoAxleChamfer', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Inner Chamfer Size' },
  ]
}

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

const d_shaft = (shaft_diameter, d_depth, shaft_depth) => {
  const solids = [];
  const holes = [];

  solids.push(cylinder({radius: shaft_diameter/2, height: shaft_depth, center: [0, 0, 0], segments: 32}))
  holes.push(cuboid({size: [shaft_diameter, d_depth, shaft_depth], center: [0, shaft_diameter/2 - d_depth/2, 0]}))

  return merge(solids, holes)
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const diameter = params.diameter;
  const shaft_diameter = params.shaft_diameter;
  const d_depth = params.d_depth;
  const shaft_depth = params.shaft_depth;
  const lego_depth = params.lego_depth;
  const m3_hole = params.m3_hole;

  // Main body and hole for d shaft
  let height = shaft_depth + lego_depth;
  solids.push(cylinder({radius: diameter/2, height: height, center: [0, 0, height/2], segments: 32}))
  holes.push(translate([0, 0, shaft_depth/2], d_shaft(shaft_diameter, d_depth, shaft_depth)))
  holes.push(translate([0, diameter/4, shaft_depth/2], rotateX(Math.PI/2, cylinder({radius: m3_hole/2, height: diameter/2, segments: 32}))))

  // Hole for axle
  holes.push(legoAxle(0, 0, shaft_depth+lego_depth/2, lego_depth, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }


