/**
 * Base for Camera (Does not include adapter)
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;

const getParameterDefinitions = () => {
  return [
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], captions: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'], initial: 'A2' },
    { name: 'tilt', type: 'checkbox', checked: false, caption: 'Tilt Swivel Mount' },
    { name: 'swivelHeight', type: 'float', initial: 26, step: 0.1, caption: 'Swivel Mount Height' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
_PREPROCESSOR_LEGO_HOLE_
  ]
}

const swivel = (params) => {
  const solids = [];
  const holes = [];

  const swivelHeight = params.swivelHeight
  const m3_hole = params.m3_hole;
  const tilt = params.tilt;

  // Swivel mount
  solids.push(cuboid({size: [SWIVEL_THICKNESS, SWIVEL_LENGTH, swivelHeight], center: [0, 0, swivelHeight/2]}));
  solids.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: SWIVEL_LENGTH/2, height: SWIVEL_THICKNESS, segments: 32}))))
  holes.push(translate([0, 0, swivelHeight], rotateY(Math.PI/2, cylinder({radius: m3_hole/2, height: SWIVEL_THICKNESS, segments: 32}))))

  let merged = merge(solids, holes);

  if (tilt) {
    merged = rotateX(30/180*Math.PI, merged);
    let trimBottom = cuboid({size: [100, 100, 100], center: [0, 0, -50]})
    merged = merge([merged], [trimBottom])
    merged = translate([0, 3, 0], merged)
  }

  return merged;
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const type = params.type;

  let exclude = [];
  let yOffset = 0;
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 8, 4]}))
    exclude = ['1,0'];
    yOffset = 3;
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 12, 4]}))
    exclude = ['1,0', '1,1'];
    yOffset = 11;
  } else if (type == 'A3') {
    solids.push(cuboid({size: [24, 32, 8], center: [0, 16, 4]}))
    exclude = ['1,1', '1,2'];
    yOffset = 16;
  } else if (type == 'B1') {
    solids.push(cuboid({size: [32, 16, 8], center: [0, 8, 4]}))
    exclude = ['1,0', '2,0'];
    yOffset = 3.5;
  } else if (type == 'B2') {
    solids.push(cuboid({size: [32, 24, 8], center: [0, 12, 4]}))
    exclude = ['1,0', '2,0', '1,1', '2,1'];
    yOffset = 11.5;
  } else if (type == 'B3') {
    solids.push(cuboid({size: [32, 32, 8], center: [0, 16, 4]}))
    exclude = ['1,1', '2,1', '1,2', '2,2'];
    yOffset = 16;
  }

  solids.push(translate([0, yOffset, 0], swivel(params)))

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