/**
 * Adapter for shaft to lego axle
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'shaft_diameter', type: 'float', initial: 5, caption: 'Shaft diameter' },
    { name: 'd_depth', type: 'float', initial: 0.5, caption: 'Depth of flat surface on shaft. To facilitate testing of shaft diameter, half of the model will not have flat.' },
  ]
}

const d_shaft = (shaft_diameter, d_depth, shaft_depth) => {
  const solids = [];
  const holes = [];

  solids.push(cylinder({radius: shaft_diameter/2, height: shaft_depth, center: [0, 0, 0], segments: 32}))
  holes.push(cuboid({size: [shaft_diameter, d_depth, shaft_depth/2], center: [0, shaft_diameter/2 - d_depth/2, -shaft_depth/4]}))

  return merge(solids, holes)
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const shaft_diameter = params.shaft_diameter;
  const d_depth = params.d_depth;

  // Main body and hole for d shaft
  let height = 8;
  let diameter = shaft_diameter + 4;
  let shaft_depth = 8;
  solids.push(cylinder({radius: diameter/2, height: height, center: [0, 0, height/2], segments: 32}))
  holes.push(translate([0, 0, shaft_depth/2], d_shaft(shaft_diameter, d_depth, shaft_depth)))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
