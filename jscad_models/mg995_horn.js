/**
 * Adapter for MG995/MG996 Servo Horn
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
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A', 'B'], captions: ['A', 'B'], initial: 'A' },
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

const BASE_LENGTH = 38;
const FIRST_LEGO_HOLE_POS = 24;
const TYPE_B_SCREW_HOLES = 3;

const main = (params) => {
  const solids = [];
  const holes = [];

  const length1 = params.length1;
  const length2 = params.length2;
  const servoHole = params.servoHole;
  const type = params.type;
  const lastOnly = params.lastOnly;

  // Main Body
  let leftLength = BASE_LENGTH / 2
  if (length1 > 0) {
    leftLength = 20 + length1 * 8;
  }
  leftLength -= 4;
  let rightLength = BASE_LENGTH / 2
  if (length2 > 0) {
    rightLength = 20 + length2 * 8;
  }
  rightLength -= 4;

  let totalLength = leftLength + rightLength
  solids.push(cuboid({size: [totalLength, 8, 8], center: [totalLength/2-leftLength, 0, 0]}))
  solids.push(cylinder({radius: 4, height: 8, center: [-leftLength, 0, 0], segments: 32}))
  solids.push(cylinder({radius: 4, height: 8, center: [rightLength, 0, 0], segments: 32}))

  if (type == 'A') {
    solids.push(cylinder({radius: 6, height: 8, segments: 32}))
  } else if (type == 'B') {
    solids.push(cylinder({radius: 10, height: 8, segments: 32}))
  }

  // Center hole
  holes.push(cylinder({radius: 3, height: 8, segments: 32}))
  holes.push(legoHole(0, 0, 0, params))

  // Servo screw holes
  if (type == 'A') {
    for (let i=0; i<4; i++) {
      holes.push(cylinder({radius: servoHole/2, height: 8, center: [7.5+i*3, 0, 0], segments: 32}))
      holes.push(cylinder({radius: servoHole/2, height: 8, center: [-(7.5+i*3), 0, 0], segments: 32}))
    }
  } else if (type == 'B') {
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [-7, 0, 0], segments: 32}))
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [7, 0, 0], segments: 32}))
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [0, -7, 0], segments: 32}))
    holes.push(cylinder({radius: TYPE_B_SCREW_HOLES/2, height: 8, center: [0, 7, 0], segments: 32}))
  }


  // Lego Holes
  if (lastOnly) {
    holes.push(legoHole(-(FIRST_LEGO_HOLE_POS + (length1-1)*8), 0, 0, params))
    holes.push(legoHole(FIRST_LEGO_HOLE_POS + (length2-1)*8, 0, 0, params))
  } else {
    for (let i=0; i<length1; i++) {
      holes.push(legoHole(-(FIRST_LEGO_HOLE_POS + i*8), 0, 0, params))
    }
    for (let i=0; i<length2; i++) {
      holes.push(legoHole(FIRST_LEGO_HOLE_POS + i*8, 0, 0, params))
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
