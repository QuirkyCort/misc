/**
 * Base for OpenMV Cam H7, H7+ (Does not include base)
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const SWIVEL_THICKNESS = 4;
const SWIVEL_LENGTH = 11;
const BASE_THICKNESS = 4;
const MOUNTING_THICKNESS = 3;

const getParameterDefinitions = () => {
  return [
    { name: 'swivelXOffset', type: 'float', initial: 4, step: 0.1, caption: 'Swivel Mount X Offset' },
    { name: 'swivelHeight', type: 'float', initial: 12, step: 0.1, caption: 'Swivel Mount Height' },
    { name: 'mountingLength', type: 'float', initial: 29.46, step: 0.1, caption: 'Camera Mount Length' },
    { name: 'mountingHeight', type: 'float', initial: 3, step: 0.1, caption: 'Camera Mount Height' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
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

  const swivelXOffset = params.swivelXOffset;
  const m3_hole = params.m3_hole;
  const mountingHeight = params.mountingHeight;
  const mountingLength = params.mountingLength;

  solids.push(translate([swivelXOffset, 0, 0], swivel(params)))

  let length = mountingLength + m3_hole + MOUNTING_THICKNESS * 2
  solids.push(cuboid({size: [length, SWIVEL_LENGTH, BASE_THICKNESS], center: [0, 0, BASE_THICKNESS/2]}));

  let width = m3_hole + MOUNTING_THICKNESS * 2
  solids.push(cuboid({size: [width, mountingHeight, BASE_THICKNESS], center: [length/2 - width/2, SWIVEL_LENGTH/2 + mountingHeight/2, BASE_THICKNESS/2]}));
  solids.push(cuboid({size: [width, mountingHeight, BASE_THICKNESS], center: [-length/2 + width/2, SWIVEL_LENGTH/2 + mountingHeight/2, BASE_THICKNESS/2]}));

  solids.push(cylinder({radius: width/2, height: BASE_THICKNESS, center: [mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))
  solids.push(cylinder({radius: width/2, height: BASE_THICKNESS, center: [-mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))

  holes.push(cylinder({radius: m3_hole/2, height: BASE_THICKNESS, center: [mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))
  holes.push(cylinder({radius: m3_hole/2, height: BASE_THICKNESS, center: [-mountingLength/2, SWIVEL_LENGTH/2 + mountingHeight, BASE_THICKNESS/2], segments: 32}))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }