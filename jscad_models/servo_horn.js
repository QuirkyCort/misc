/**
 * Adapter for Servo Horn
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { rotateX, translate } = require('@jscad/modeling').transforms
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'length1', type: 'int', initial: 1, caption: 'Number of Lego Holes Left' },
    { name: 'length2', type: 'int', initial: 2, caption: 'Number of Lego Holes Right' },
    { name: 'servoHole', type: 'float', initial: 1.5, caption: 'Diameter of servo screw holes' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['SG90', 'MG995 A', 'MG995 B'], captions: ['SG90', 'MG995 A', 'MG995 B'], initial: 'SG90' },
    { name: 'orientation', type: 'choice', caption: 'Orientation', values: ['Straight', 'Cross'], captions: ['Straight', 'Cross'], initial: 'Straight' },
    { name: 'lastOnly', type: 'checkbox', checked: false, caption: 'Only last Lego hole' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, caption: 'Lego: Height of outer diameter' },
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

const SG90_BASE_LENGTH = 28;
const MG995_BASE_LENGTH = 32;
const BASE_LENGTH = 38;
const FIRST_LEGO_HOLE_POS_A1 = 24;
const FIRST_LEGO_HOLE_POS_A2 = 8;
const FIRST_LEGO_HOLE_POS_B1 = 16;
const FIRST_LEGO_HOLE_POS_B2 = 8;
const TYPE_B_SCREW_HOLES = 3;

const main = (params) => {
  const solids = [];
  const holes = [];

  const length1 = params.length1;
  const length2 = params.length2;
  const servoHole = params.servoHole;
  const type = params.type;
  const orientation = params.orientation;
  const lastOnly = params.lastOnly;

  let firstLegoHolePos;
  if (type == 'SG90' || type == 'MG995 A') {
    if (orientation == 'Straight') {
      firstLegoHolePos = FIRST_LEGO_HOLE_POS_A1;
    } else if (orientation == 'Cross') {
      firstLegoHolePos = FIRST_LEGO_HOLE_POS_A2;
    }
  } else if (type == 'MG995 B') {
    if (orientation == 'Straight') {
      firstLegoHolePos = FIRST_LEGO_HOLE_POS_B1;
    } else if (orientation == 'Cross') {
      firstLegoHolePos = FIRST_LEGO_HOLE_POS_B2;
    }
  }

  // Main Body
  let leftLength = BASE_LENGTH / 2
  if (length1 > 0) {
    leftLength = firstLegoHolePos + length1 * 8 - 8;
  }
  let rightLength = BASE_LENGTH / 2
  if (length2 > 0) {
    rightLength = firstLegoHolePos + length2 * 8 - 8;
  }

  let totalLength = leftLength + rightLength
  solids.push(cuboid({size: [totalLength, 8, 8], center: [totalLength/2-leftLength, 0, 0]}))
  solids.push(cylinder({radius: 4, height: 8, center: [-leftLength, 0, 0], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [rightLength, 0, 0], segments: 32}))

  if (type == 'SG90' && orientation == 'Cross') {
    solids.push(cuboid({size: [8, SG90_BASE_LENGTH, 8], center: [0, 0, 0]}))
    solids.push(cylinder({radius: 4, height: 8, center: [0, SG90_BASE_LENGTH/2, 0], segments: 32}))
    solids.push(cylinder({radius: 4, height: 8, center: [0, -SG90_BASE_LENGTH/2, 0], segments: 32}))
  } else if (type == 'MG995 A' && orientation == 'Cross') {
    solids.push(cuboid({size: [8, MG995_BASE_LENGTH, 8], center: [0, 0, 0]}))
    solids.push(cylinder({radius: 4, height: 8, center: [0, MG995_BASE_LENGTH/2, 0], segments: 32}))
    solids.push(cylinder({radius: 4, height: 8, center: [0, -MG995_BASE_LENGTH/2, 0], segments: 32}))
  }

  if (type == 'SG90' || type == 'MG995 A') {
    solids.push(cylinder({radius: 6, height: 8, segments: 32}))
  } else if (type == 'MG995 B') {
    solids.push(cylinder({radius: 10, height: 8, segments: 32}))
  }

  // Center hole
  holes.push(cylinder({radius: 3, height: 8, segments: 32}))
  holes.push(legoHole(0, 0, 0, params))

  // Servo screw holes
  if (type == 'SG90') {
    if (orientation == 'Straight') {
      for (let i=0; i<3; i++) {
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [6.65+i*4, 0, 0], segments: 32}))
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [-(6.65+i*4), 0, 0], segments: 32}))
      }
    } else if (orientation == 'Cross') {
      for (let i=0; i<3; i++) {
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [0, 6.65+i*4, 0], segments: 32}))
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [0, -(6.65+i*4), 0], segments: 32}))
      }
    }
  } else if (type == 'MG995 A') {
    if (orientation == 'Straight') {
      for (let i=0; i<4; i++) {
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [7.5+i*3, 0, 0], segments: 32}))
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [-(7.5+i*3), 0, 0], segments: 32}))
      }
    } else if (orientation == 'Cross') {
      for (let i=0; i<4; i++) {
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [0, 7.5+i*3, 0], segments: 32}))
        holes.push(cylinder({radius: servoHole/2, height: 8, center: [0, -(7.5+i*3), 0], segments: 32}))
      }
    }
  } else if (type == 'MG995 B') {
    if (orientation == 'Straight') {
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [-7, 0, 0], segments: 32}))
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [7, 0, 0], segments: 32}))
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [0, -7, 0], segments: 32}))
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [0, 7, 0], segments: 32}))
    } else if (orientation == 'Cross') {
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [-4.95, 4.95, 0], segments: 32}))
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [4.95, 4.95, 0], segments: 32}))
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [4.95, -4.95, 0], segments: 32}))
      holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [-4.95, -4.95, 0], segments: 32}))
    }
  }

  // Lego Holes
  if (lastOnly) {
    if (length1 > 0) {
      holes.push(legoHole(-(firstLegoHolePos + (length1-1)*8), 0, 0, params))
    }
    if (length2 > 0) {
      holes.push(legoHole(firstLegoHolePos + (length2-1)*8, 0, 0, params))
    }
  } else {
    for (let i=0; i<length1; i++) {
      holes.push(legoHole(-(firstLegoHolePos + i*8), 0, 0, params))
    }
    for (let i=0; i<length2; i++) {
      holes.push(legoHole(firstLegoHolePos + i*8, 0, 0, params))
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
