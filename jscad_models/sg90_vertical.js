/**
 * Vertical Adapter for SG90 Servo
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const SG90_LENGTH = 23; // 22.5 + 0.5mm clearance
const SG90_WIDTH = 12.3; // 11.8 + 0.5mm clearance
const SG90_HOLES_DIST = 27.3;
const SG90_WIRE_GAP_HEIGHT = 5;
const SG90_BASE_HEIGHT = 16.7;

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Base Type', values: ['A', 'B'], captions: ['A', 'B'], initial: 'A' },
    { name: 'baseWidth', type: 'int', initial: 2, step: 1, min:1, caption: 'Base Width' },
    { name: 'height', type: 'float', initial: SG90_BASE_HEIGHT, step: 0.1, min:8, caption: 'Height' },
    { name: 'm2', type: 'float', initial: 1.6, step: 0.1, caption: 'Diameter of M2 holes' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
  ]
}

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
  const height = params.height;
  const m2 = params.m2;

  // Mounting points for motor
  solids.push(cuboid({size: [5, SG90_WIDTH, height], center: [SG90_LENGTH/2+2.5, 0, height/2-4]}))
  solids.push(cuboid({size: [5, SG90_WIDTH, height], center: [-(SG90_LENGTH/2+2.5), 0, height/2-4]}))
  if (height > 15.7-6) { // Gap for cable
    const holeHeight = height - (SG90_BASE_HEIGHT - SG90_WIRE_GAP_HEIGHT)
    const holeWidth = SG90_WIDTH/2+4.5/2
    holes.push(cuboid({size: [5, holeWidth, holeHeight], center: [SG90_LENGTH/2+2.5, -(SG90_WIDTH/2)+holeWidth/2, holeHeight/2-4]}))
    holes.push(cuboid({size: [5, holeWidth, holeHeight], center: [-(SG90_LENGTH/2+2.5), -(SG90_WIDTH/2)+holeWidth/2, holeHeight/2-4]}))
  }

  holes.push(cylinder({radius: m2/2, height: height, center: [SG90_HOLES_DIST/2, 0, height/2-4], segments: 32}))
  holes.push(cylinder({radius: m2/2, height: height, center: [-SG90_HOLES_DIST/2, 0, height/2-4], segments: 32}))

  // Base
  solids.push(cuboid({size: [SG90_LENGTH+10, baseWidth*8, 8], center: [0, baseWidth*4+SG90_WIDTH/2, 0]}))

  // Lego Holes
  let yOffset = SG90_WIDTH/2+4;
  if (type == 'A') {
    for (let x=-1; x<=1; x++) {
      for (let y=0; y<baseWidth; y++) {
        holes.push(legoHole(x*8, yOffset+y*8, 0, params))
      }
    }
  } else if (type == 'B') {
    for (let x=0; x<2; x++) {
      for (let y=0; y<baseWidth; y++) {
        holes.push(legoHole(-(x*8+4), yOffset+y*8, 0, params))
        holes.push(legoHole(x*8+4, yOffset+y*8, 0, params))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
