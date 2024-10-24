/**
 * Adapter for AMG8833 Sensors
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { rotateX, rotateY, translate } = require('@jscad/modeling').transforms
const { cylinder, cuboid } = jscad.primitives

const MOUNTING_HOLES_DISTANCE = 13.2;
const MARGIN = 3;
const MOUNT_DEPTH = 7;
const PROTRUSION_DEPTH = 1;
const SWIVEL_THICKNESS = 4;
const SWIVEL_HEIGHT = 11;

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 12, caption: 'Height of mouting holes from base' },
    { name: 'm2', type: 'float', initial: 1.8, caption: 'Diameter of M2 holes' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
    { name: 'swivelXOffset', type: 'float', initial: 4, step: 0.1, caption: 'Swivel Mount X Offset' },
    { name: 'swivelLength', type: 'float', initial: 12, step: 0.1, caption: 'Swivel Mount Length' },
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
  const m2 = params.m2;
  const swivelXOffset = params.swivelXOffset;
  const swivelLength = params.swivelLength;
  const m3_hole = params.m3_hole;

  const mountWidth = MOUNTING_HOLES_DISTANCE + MARGIN * 2;
  const mountHeight = height + MARGIN;
  const holes_offset = MOUNTING_HOLES_DISTANCE / 2;
  solids.push(cuboid({size: [mountWidth, MOUNT_DEPTH, mountHeight], center: [0, 0, mountHeight/2]}))

  const protrusionWidth = MOUNTING_HOLES_DISTANCE - m2 * 2;
  const protrusionHeight = height + m2 * 1 / 2;
  const protrusionY = -(MOUNT_DEPTH + PROTRUSION_DEPTH) / 2;
  solids.push(cuboid({size: [protrusionWidth, PROTRUSION_DEPTH, protrusionHeight], center: [0, protrusionY, protrusionHeight/2]}))

  holes.push(translate([holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: m2/2, height: 10, segments: 32}))))
  holes.push(translate([-holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: m2/2, height: 10, segments: 32}))))

  // Swivel
  const swivelY = (MOUNT_DEPTH + swivelLength) / 2;
  solids.push(cuboid({size: [SWIVEL_THICKNESS, swivelLength + SWIVEL_HEIGHT/2, SWIVEL_HEIGHT], center: [-swivelXOffset, swivelY, SWIVEL_HEIGHT/2]}))
  holes.push(translate([-swivelXOffset, swivelLength, SWIVEL_HEIGHT/2], rotateY(Math.PI/2, cylinder({radius: m3_hole/2, height: SWIVEL_THICKNESS, segments: 32}))))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
