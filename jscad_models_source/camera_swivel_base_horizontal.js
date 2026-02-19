/**
 * Base for camera (Does not include adapter)
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], captions: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], initial: 'A2' },
    { name: 'swivelHeight', type: 'float', initial: 16, step: 0.1, caption: 'Swivel Mount Protrusion Length' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
_PREPROCESSOR_LEGO_HOLE_
  ]
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

  const type = params.type;

  let exclude = [];
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 8, 4]}))
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 12, 4]}))
  } else if (type == 'A3') {
    solids.push(cuboid({size: [24, 32, 8], center: [0, 16, 4]}))
  } else if (type == 'B1') {
    solids.push(cuboid({size: [32, 16, 8], center: [0, 8, 4]}))
  } else if (type == 'B2') {
    solids.push(cuboid({size: [32, 24, 8], center: [0, 12, 4]}))
  } else if (type == 'B3') {
    solids.push(cuboid({size: [32, 32, 8], center: [0, 16, 4]}))
  }

  solids.push(translate([0, 0, SWIVEL_LENGTH/2], rotateX(Math.PI/2, swivel(params))))

  // Fillet
  solids.push(cuboid({size: [8, 8, 8], center: [4+SWIVEL_THICKNESS/2, -4, 4]}))
  holes.push(cylinder({radius: 8, height: 8, center: [8+SWIVEL_THICKNESS/2, -8, 4], segments: 32}))
  solids.push(cuboid({size: [8, 8, 8], center: [-4-SWIVEL_THICKNESS/2, -4, 4]}))
  holes.push(cylinder({radius: 8, height: 8, center: [-8-SWIVEL_THICKNESS/2, -8, 4], segments: 32}))

  if (type.includes('A')) {
    for (let x=0; x<3; x++) {
      for (let y=0; y<4; y++) {
        if (exclude.includes(x + ',' + y)) {
          continue;
        }
        holes.push(legoHole(x*8 - 8, y*8 + 4, 4, params))
      }
    }
  } else if (type.includes('B')) {
    for (let x=0; x<4; x++) {
      for (let y=0; y<4; y++) {
        if (exclude.includes(x + ',' + y)) {
          continue;
        }
        holes.push(legoHole(x*8 - 12, y*8 + 4, 4, params))
      }
    }
  }


  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }