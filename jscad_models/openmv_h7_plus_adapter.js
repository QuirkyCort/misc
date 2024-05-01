/**
 * Base for OpenMV Cam H7, H7+ (Does not include base)
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid, polygon } = jscad.primitives
const { rotateY, rotateZ, translate } = require('@jscad/modeling').transforms
const { extrudeLinear } = require('@jscad/modeling').extrusions
const { measureBoundingBox } = require('@jscad/modeling').measurements

const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;
const BASE_THICKNESS = 4;
const MOUNTING_THICKNESS = 3;

const getParameterDefinitions = () => {
  return [
    { name: 'swivelXOffset', type: 'float', initial: 4, step: 0.1, caption: 'Swivel Mount X Offset' },
    { name: 'swivelHeight', type: 'float', initial: 12, step: 0.1, caption: 'Swivel Mount Height' },
    { name: 'mountingLength', type: 'float', initial: 29.46, step: 0.1, caption: 'Camera Mount Length' },
    { name: 'mountingHeight', type: 'float', initial: 3, step: 0.1, caption: 'Camera Mount Height' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
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

const swivel = (params) => {
  const solids = [];
  const holes = [];

  const swivelHeight = params.swivelHeight
  const m3_hole = params.m3_hole;

  // Swivel mount
  solids.push(cuboid({size: [SWIVEL_THICKNESS, SWIVEL_LENGTH, swivelHeight], center: [0, 0, swivelHeight/2]}));
  solids.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: SWIVEL_LENGTH/2, height: SWIVEL_THICKNESS, segments: 32}))))
  holes.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: m3_hole/2, height: SWIVEL_THICKNESS, segments: 32}))))

  return merge(solids, holes);
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const swivelXOffset = params.swivelXOffset;
  const m3_hole = params.m3_hole;
  const mountingHeight = params.mountingHeight;
  const mountingLength = params.mountingLength;

  solids.push(translate([swivelXOffset, 0, 0], swivel(params)))

  let length = mountingLength + m3_hole + MOUNTING_THICKNESS * 2
  solids.push(cuboid({size: [length, SWIVEL_LENGTH, BASE_THICKNESS], center: [0, 0, BASE_THICKNESS/2]}));

  let width = m3_hole + MOUNTING_THICKNESS * 2
  solids.push(cuboid({size: [width, mountingHeight, BASE_THICKNESS], center: [length/2 - width/2, SWIVEL_LENGTH/2 + mountingHeight/2, BASE_THICKNESS/2]}));
  solids.push(cuboid({size: [width, mountingHeight, BASE_THICKNESS], center: [-length/2 + width/2, SWIVEL_LENGTH/2 + mountingHeight/2, BASE_THICKNESS/2]}));

  solids.push(cylinder({radius: width/2, height: BASE_THICKNESS, center: [mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))
  solids.push(cylinder({radius: width/2, height: BASE_THICKNESS, center: [-mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))

  holes.push(cylinder({radius: m3_hole/2, height: BASE_THICKNESS, center: [mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))
  holes.push(cylinder({radius: m3_hole/2, height: BASE_THICKNESS, center: [-mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }