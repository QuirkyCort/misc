/**
 * Test model for m3 hole
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const m3 = params.m3;

  // Main body
  solids.push(cuboid({size: [8, 8, 8], center: [0, 0, 0]}))
  holes.push(cylinder({radius: m3/2, height: 8, segments: 32}))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }



