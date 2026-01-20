/*
 * Base for ESP32-Cam (Does not include adapter)
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { rotateX, rotateY, translate } = require('@jscad/modeling').transforms
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'servoHole', type: 'float', initial: 1.5, caption: 'Diameter of servo screw holes (for SG60 and MG995 A)' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['SG90', 'MG995 A', 'MG995 B'], captions: ['SG90', 'MG995 A', 'MG995 B'], initial: 'SG90' },
    { name: 'swivelType', type: 'choice', caption: 'Swivel type', values: ['Horizontal', 'Vertical', 'Slanted'], captions: ['Horizontal', 'Vertical', 'Slanted'], initial: 'Horizontal' },
    { name: 'swivelHeight', type: 'float', initial: 20, step: 0.1, caption: 'Swivel Mount Height/Length' },
    { name: 'swivelOffset', type: 'float', initial: 9, step: 0.1, caption: 'Swivel Mount Offset (for Vertical only)' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
  ]
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

const SG90_BASE_LENGTH = 28;
const MG995_BASE_LENGTH = 32;
const TYPE_B_SCREW_HOLES = 3;
const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;
const SWIVEL_SLANT_ANGLE = 30 / 180 * Math.PI;

const swivel = (params, angle) => {
  const solids = [];
  const holes = [];

  const swivelHeight = params.swivelHeight;
  const m3_hole = params.m3_hole;

  // Swivel mount
  solids.push(cuboid({size: [SWIVEL_THICKNESS, SWIVEL_LENGTH, swivelHeight], center: [0, 0, swivelHeight/2]}));
  solids.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: SWIVEL_LENGTH/2, height: SWIVEL_THICKNESS, segments: 32}))))
  holes.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: m3_hole/2, height: SWIVEL_THICKNESS, segments: 32}))))

  return rotateX(angle, merge(solids, holes));
}

const slanted_swivel = (params) => {
  const solids = [];
  const holes = [];

  solids.push(swivel(params, SWIVEL_SLANT_ANGLE));
  holes.push(cuboid({size: [SWIVEL_THICKNESS, SWIVEL_LENGTH*2, 10], center: [0, 0, -10/2+Math.sin(SWIVEL_SLANT_ANGLE) * SWIVEL_LENGTH/2]}));

  return merge(solids, holes);
}



const main = (params) => {
  const solids = [];
  const holes = [];

  const servoHole = params.servoHole;
  const type = params.type;
  const swivelType = params.swivelType;
  const swivelOffset = params.swivelOffset;

  // Main Body
  if (type == 'SG90') {
    solids.push(cuboid({size: [SG90_BASE_LENGTH, 8, 8], center: [0, 0, 0]}))
    solids.push(cylinder({radius: 4, height: 8, center: [-SG90_BASE_LENGTH/2, 0, 0], segments: 32}))
    solids.push(cylinder({radius: 4, height: 8, center: [SG90_BASE_LENGTH/2, 0, 0], segments: 32}))
    solids.push(cylinder({radius: 6, height: 8, segments: 32}))
  } else if (type == 'MG995 A') {
    solids.push(cuboid({size: [MG995_BASE_LENGTH, 8, 8], center: [0, 0, 0]}))
    solids.push(cylinder({radius: 4, height: 8, center: [-MG995_BASE_LENGTH/2, 0, 0], segments: 32}))
    solids.push(cylinder({radius: 4, height: 8, center: [MG995_BASE_LENGTH/2, 0, 0], segments: 32}))
    solids.push(cylinder({radius: 6, height: 8, segments: 32}))
  } else if (type == 'MG995 B') {
    solids.push(cylinder({radius: 10, height: 8, segments: 32}))
  }

  // Center hole
  holes.push(cylinder({radius: 3, height: 80, segments: 32}))

  // Servo screw holes
  if (type == 'SG90') {
    for (let i=0; i<3; i++) {
      holes.push(cylinder({radius: servoHole/2, height: 8, center: [6.65+i*4, 0, 0], segments: 32}))
      holes.push(cylinder({radius: servoHole/2, height: 8, center: [-(6.65+i*4), 0, 0], segments: 32}))
    }
  } else if (type == 'MG995 A') {
    for (let i=0; i<4; i++) {
      holes.push(cylinder({radius: servoHole/2, height: 8, center: [7.5+i*3, 0, 0], segments: 32}))
      holes.push(cylinder({radius: servoHole/2, height: 8, center: [-(7.5+i*3), 0, 0], segments: 32}))
    }
  } else if (type == 'MG995 B') {
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [-4.95, 4.95, 0], segments: 32}))
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [4.95, 4.95, 0], segments: 32}))
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [4.95, -4.95, 0], segments: 32}))
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [-4.95, -4.95, 0], segments: 32}))
  }

  // Swivel mount
  if (swivelType == 'Vertical') {
    solids.push(cuboid({size: [SWIVEL_THICKNESS, swivelOffset, 8], center: [0, swivelOffset/2, 0]}))
    solids.push(translate([0, swivelOffset, -4], swivel(params, 0)))
  } else if (swivelType == 'Horizontal') {
    solids.push(translate([0, 0, SWIVEL_LENGTH/2 - 4], swivel(params, Math.PI / 2)))
  } else if (swivelType == 'Slanted') {
    solids.push(translate([0, 0, Math.sin(SWIVEL_SLANT_ANGLE) * -SWIVEL_LENGTH/2 - 4], slanted_swivel(params)))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
