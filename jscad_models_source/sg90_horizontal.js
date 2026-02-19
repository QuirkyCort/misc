/**
 * Horizontal Adapter for SG90 Servo
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Base Type', values: ['A', 'B'], captions: ['A', 'B'], initial: 'A' },
    { name: 'baseWidth', type: 'int', initial: 2, step: 1, min:1, caption: 'Base Width' },
    { name: 'm2', type: 'float', initial: 1.6, step: 0.1, caption: 'Diameter of M2 holes' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const SG90_LENGTH = 23; // 22.5 + 0.5mm clearance
const SG90_WIDTH = 12.3; // 11.8 + 0.5mm clearance
const SG90_HOLES_DIST = 27.3;

const main = (params) => {
  const solids = [];
  const holes = [];

  const type = params.type;
  const baseWidth = params.baseWidth;
  const m2 = params.m2;

  // Mounting points for sensor
  solids.push(cuboid({size: [5, 8, SG90_WIDTH+8], center: [SG90_LENGTH/2+2.5, 0, (SG90_WIDTH+8)/2-4]}))
  solids.push(cuboid({size: [5, 8, SG90_WIDTH+8], center: [-(SG90_LENGTH/2+2.5), 0, (SG90_WIDTH+8)/2-4]}))

  holes.push(translate([SG90_HOLES_DIST/2, 0, 4+SG90_WIDTH/2], rotateX(Math.PI/2, cylinder({radius: m2/2, height: 8, segments: 32}))))
  holes.push(translate([-SG90_HOLES_DIST/2, 0, 4+SG90_WIDTH/2], rotateX(Math.PI/2, cylinder({radius: m2/2, height: 8, segments: 32}))))

  // Base
  let baseLength = 32;
  if (type == 'A') {
    baseLength = 24;
  }
  solids.push(cuboid({size: [baseLength, baseWidth*8, 8], center: [0, baseWidth*4-4, 0]}))

  // Lego Holes
  let yOffset = 0;
  if (type == 'A') {
    for (let x=-1; x<=1; x++) {
      for (let y=0; y<baseWidth; y++) {
        holes.push(legoHole(x*8, yOffset+y*8, 0, params))
      }
    }
  } else if (type == 'B') {
    holes.push(legoHole(-4, 0, 0, params))
    holes.push(legoHole(4, 0, 0, params))
    for (let x=0; x<2; x++) {
      for (let y=1; y<baseWidth; y++) {
        holes.push(legoHole(-(x*8+4), yOffset+y*8, 0, params))
        holes.push(legoHole(x*8+4, yOffset+y*8, 0, params))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
