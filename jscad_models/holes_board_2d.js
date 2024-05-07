/**
 * Model for plain base with holes
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { roundedRectangle, circle } = jscad.primitives
const { rotateY, rotateZ, translate } = require('@jscad/modeling').transforms
const { extrudeLinear } = require('@jscad/modeling').extrusions
const { measureBoundingBox } = require('@jscad/modeling').measurements

const getParameterDefinitions = () => {
  return [
    { name: 'width', type: 'int', initial: 17, caption: 'Width in Lego units (8mm)' },
    { name: 'length', type: 'int', initial: 25, caption: 'Length in Lego units (8mm)' },
    { name: 'steps', type: 'int', initial: 2, caption: 'Steps between holes' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
  ]
}

const merge = (solids, holes) => {
  let solid = union(...solids)

  if (holes.length > 0) {
    let hole = union(...holes)
    return subtract(solid, hole);
  }

  return solid;
}

const main = (params) => {
  const solids = [];
  const holes = [];

  const width = params.width;
  const length = params.length;
  const steps = params.steps;
  const type = params.type;
  const m3_hole = params.m3_hole;

  solids.push(roundedRectangle({size: [8*width, 8*length], center: [8*width/2, 8*length/2], roundRadius: 4}))
  for (let x=0; x<width; x+=steps) {
    for (let y=0; y<length; y+=steps) {
      let xPos = x * 8 + 4
      let yPos = y * 8 + 4
    holes.push(circle({radius: m3_hole/2, center: [xPos, yPos], segments: 32}))
    }
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }