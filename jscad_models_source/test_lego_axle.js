/**
 * Test model for lego axle
 */

const jscad = require('@jscad/modeling')

_PREPROCESSOR_DEFAULTS_

const getParameterDefinitions = () => {
  return [
_PREPROCESSOR_LEGO_AXLE_
  ]
}

const main = (params) => {
  const solids = [];
  const holes = [];

  // Main body
  solids.push(cuboid({size: [8, 8, 8], center: [0, 0, 0]}))
  holes.push(legoAxle(0, 0, 0, 8, params))

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }



