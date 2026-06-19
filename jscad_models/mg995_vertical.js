/**
 * Vertical Adapter for MG995 Servo
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
    { name: 'type', type: 'choice', caption: 'Base Type', values: ['A', 'B'], captions: ['A', 'B'], initial: 'A' },
    { name: 'baseWidth', type: 'int', initial: 2, step: 1, min:1, caption: 'Base Width' },
    { name: 'height', type: 'float', initial: 27.8, step: 0.1, min:8, caption: 'Height' },
    { name: 'm4', type: 'float', initial: 3.8, step: 0.1, caption: 'Diameter of M4 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 5, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.4, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.9, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MG995_LENGTH = 40.5; // 40 + 0.5mm clearance
const MG995_WIDTH = 20.5; // 20 + 0.5mm clearance
const MG995_HOLES_DIST = 49.5;

const main = (params) => {
  const solids = [];
  const holes = [];

  const type = params.type;
  const baseWidth = params.baseWidth;
  const height = params.height;
  const m4 = params.m4;

  // Mounting points for motor
  solids.push(cuboid({size: [10, MG995_WIDTH, height], center: [MG995_LENGTH/2+5, 0, height/2-4]}))
  solids.push(cuboid({size: [10, MG995_WIDTH, height], center: [-(MG995_LENGTH/2+5), 0, height/2-4]}))
  if (height > 27.8-12) { // Gap for cable
    const holeHeight = height - (27.8 - 12)
    const holeWidth = MG995_WIDTH/2+4.5/2
    holes.push(cuboid({size: [10, holeWidth, holeHeight], center: [MG995_LENGTH/2+5, -(MG995_WIDTH/2)+holeWidth/2, holeHeight/2-4]}))
    holes.push(cuboid({size: [10, holeWidth, holeHeight], center: [-(MG995_LENGTH/2+5), -(MG995_WIDTH/2)+holeWidth/2, holeHeight/2-4]}))
  }

  holes.push(cylinder({radius: m4/2, height: height, center: [MG995_HOLES_DIST/2, -5, height/2-4], segments: 32}))
  holes.push(cylinder({radius: m4/2, height: height, center: [-MG995_HOLES_DIST/2, -5, height/2-4], segments: 32}))
  holes.push(cylinder({radius: m4/2, height: height, center: [MG995_HOLES_DIST/2, 5, height/2-4], segments: 32}))
  holes.push(cylinder({radius: m4/2, height: height, center: [-MG995_HOLES_DIST/2, 5, height/2-4], segments: 32}))

  // Base
  solids.push(cuboid({size: [MG995_LENGTH+20, baseWidth*8, 8], center: [0, baseWidth*4+MG995_WIDTH/2, 0]}))

  // Lego Holes
  let yOffset = MG995_WIDTH/2+4;
  if (type == 'A') {
    for (let x=-3; x<=3; x++) {
      for (let y=0; y<baseWidth; y++) {
        holes.push(legoHole(x*8, yOffset+y*8, 0, params))
      }
    }
  } else if (type == 'B') {
    for (let x=0; x<3; x++) {
      for (let y=0; y<baseWidth; y++) {
        holes.push(legoHole(-(x*8+4), yOffset+y*8, 0, params))
        holes.push(legoHole(x*8+4, yOffset+y*8, 0, params))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
