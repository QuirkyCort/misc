/**
 * Adapter for shaft to lego axle
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'diameter', type: 'float', initial: 9, caption: 'Outer diameter' },
    { name: 'shaft_diameter', type: 'float', initial: 5, caption: 'Shaft diameter' },
    { name: 'd_depth', type: 'float', initial: 0.5, caption: 'Depth of flat surface on shaft (set to 0 if shaft does not have a flat)' },
    { name: 'shaft_depth', type: 'float', initial: 16, caption: 'Depth of shaft hole' },
    { name: 'lego_depth', type: 'float', initial: 16, caption: 'Depth of lego shaft' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Hole for M3 screw (set to 0 if not needed)' },
_PREPROCESSOR_LEGO_AXLE_
  ]
}

const d_shaft = (shaft_diameter, d_depth, shaft_depth) => {
  const solids = [];
  const holes = [];

  solids.push(cylinder({radius: shaft_diameter/2, height: shaft_depth, center: [0, 0, 0], segments: 32}))
  holes.push(cuboid({size: [shaft_diameter, d_depth, shaft_depth], center: [0, shaft_diameter/2 - d_depth/2, 0]}))

  return merge(solids, holes)
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const diameter = params.diameter;
  const shaft_diameter = params.shaft_diameter;
  const d_depth = params.d_depth;
  const shaft_depth = params.shaft_depth;
  const lego_depth = params.lego_depth;
  const m3 = params.m3;

  // Main body and hole for d shaft
  let height = shaft_depth + lego_depth;
  solids.push(cylinder({radius: diameter/2, height: height, center: [0, 0, height/2], segments: 32}))
  holes.push(translate([0, 0, shaft_depth/2], d_shaft(shaft_diameter, d_depth, shaft_depth)))
  holes.push(translate([0, diameter/4, shaft_depth/2], rotateX(Math.PI/2, cylinder({radius: m3/2, height: diameter/2, segments: 32}))))

  // Hole for axle
  holes.push(legoAxle(0, 0, shaft_depth+lego_depth/2, lego_depth, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }



