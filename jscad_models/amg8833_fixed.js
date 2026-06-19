/**
 * Adapter for AMG8833 Sensors
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

const MOUNTING_HOLES_DISTANCE = 13.2;
const MARGIN = 3;
const MOUNT_DEPTH = 7;
const PROTRUSION_DEPTH = 1;

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 10, caption: 'Height of mouting holes from base' },
    { name: 'm2', type: 'float', initial: 1.8, caption: 'Diameter of M2 holes' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'B1', 'B2'], captions: ['A1', 'A2', 'B1', 'B2'], initial: 'A1' },
    { name: 'legoInnerDia', type: 'float', initial: 5, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.4, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.9, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const height = params.height;
  const m2 = params.m2;
  const type = params.type;

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

  // Base
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 4.5, 4]}))
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 8.5, 4]}))
  } else if (type == 'B1') {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 4.5, 4]}))
  } else if (type == 'B2') {
    solids.push(cuboid({size: [16, 24, 8], center: [0, 8.5, 4]}))
  }

  if (type == 'A1' || type == 'A2') {
    for (let x=-1; x<=1; x++) {
      for (let y=1; y<=2; y++) {
        holes.push(legoHole(x*8, 0.5+y*8, 4, params))
      }
    }
  } else if (type == 'B1' || type == 'B2') {
    for (let y=1; y<=2; y++) {
      holes.push(legoHole(-4, 0.5+y*8, 4, params))
      holes.push(legoHole(4, 0.5+y*8, 4, params))
    }
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
