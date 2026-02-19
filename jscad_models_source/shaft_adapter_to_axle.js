/**
 * Adapter for 16mm 0shaft adapter to lego axle
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'major_diameter', type: 'float', initial: 24, caption: 'Major diameter' },
    { name: 'minor_diameter', type: 'float', initial: 9, caption: 'Minor diameter' },
    { name: 'm3_spacing', type: 'float', initial: 16, caption: 'Spacing between M3 holes' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Hole for M3 screw (set to 0 if not needed)' },
    { name: 'height', type: 'float', initial: 8, caption: 'Height' },
    { name: 'protrusion', type: 'float', initial: 8, caption: 'Protrusion height' },
_PREPROCESSOR_LEGO_AXLE_
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const major_diameter = params.major_diameter;
  const minor_diameter = params.minor_diameter;
  const m3_spacing = params.m3_spacing;
  const m3 = params.m3;
  const height = params.height;
  const protrusion = params.protrusion;

  // Main body and hole for d shaft
  let totalHeight = height + protrusion;
  solids.push(cylinder({radius: major_diameter/2, height: height, center: [0, 0, height/2], segments: 32}))
  solids.push(cylinder({radius: minor_diameter/2, height: protrusion, center: [0, 0, protrusion/2+height], segments: 32}))

  // Holes for m3
  holes.push(cylinder({radius: m3/2, height: height, center: [m3_spacing/2, 0, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [-m3_spacing/2, 0, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [0, m3_spacing/2, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height, center: [0, -m3_spacing/2, height/2], segments: 32}))

  // Hole for axle
  holes.push(legoAxle(0, 0, totalHeight/2, totalHeight, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
