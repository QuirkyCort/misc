/**
 * Horizontal Adapter for MG995 Servo
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { rotateX, translate } = require('@jscad/modeling').transforms
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Base Type', values: ['A', 'B'], captions: ['A', 'B'], initial: 'A' },
    { name: 'baseWidth', type: 'int', initial: 2, step: 1, min:1, caption: 'Base Width' },
    { name: 'm4', type: 'float', initial: 3.8, step: 0.1, caption: 'Diameter of M4 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

const MG995_LENGTH = 40.5; // 40 + 0.5mm clearance
const MG995_WIDTH = 20.5; // 20 + 0.5mm clearance
const MG995_HOLES_DIST = 49.5;

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 64})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 64})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 64})

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

  const type = params.type;
  const baseWidth = params.baseWidth;
  const m4 = params.m4;

  // Mounting points for sensor
  solids.push(cuboid({size: [10, 8, MG995_WIDTH+8], center: [MG995_LENGTH/2+5, 0, (MG995_WIDTH+8)/2-4]}))
  solids.push(cuboid({size: [10, 8, MG995_WIDTH+8], center: [-(MG995_LENGTH/2+5), 0, (MG995_WIDTH+8)/2-4]}))

  holes.push(translate([MG995_HOLES_DIST/2, 0, 4+MG995_WIDTH/2-5], rotateX(Math.PI/2, cylinder({radius: m4/2, height: 8, segments: 32}))))
  holes.push(translate([-MG995_HOLES_DIST/2, 0, 4+MG995_WIDTH/2-5], rotateX(Math.PI/2, cylinder({radius: m4/2, height: 8, segments: 32}))))
  holes.push(translate([MG995_HOLES_DIST/2, 0, 4+MG995_WIDTH/2+5], rotateX(Math.PI/2, cylinder({radius: m4/2, height: 8, segments: 32}))))
  holes.push(translate([-MG995_HOLES_DIST/2, 0, 4+MG995_WIDTH/2+5], rotateX(Math.PI/2, cylinder({radius: m4/2, height: 8, segments: 32}))))

  // Base
  let baseLength = 48;
  if (type == 'A') {
    baseLength = 56;
  }
  solids.push(cuboid({size: [baseLength, baseWidth*8, 8], center: [0, baseWidth*4-4, 0]}))
  
  // Lego Holes
  let yOffset = 0;
  if (type == 'A') {
    for (let x=-2; x<=2; x++) {
      holes.push(legoHole(x*8, 0, 0, params))
    }
    for (let x=-3; x<=3; x++) {
      for (let y=1; y<baseWidth; y++) {
        holes.push(legoHole(x*8, yOffset+y*8, 0, params))
      }
    }
  } else if (type == 'B') {
    for (let x=0; x<2; x++) {
      holes.push(legoHole(-(4+x*8), 0, 0, params))
      holes.push(legoHole(4+x*8, 0, 0, params))
    }
    for (let x=0; x<3; x++) {
      for (let y=1; y<baseWidth; y++) {
        holes.push(legoHole(-(x*8+4), yOffset+y*8, 0, params))
        holes.push(legoHole(x*8+4, yOffset+y*8, 0, params))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
