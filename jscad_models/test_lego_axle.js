/**
 * Test model for lego axle
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives
const { rotateX, rotateZ, translate } = require('@jscad/modeling').transforms

const getParameterDefinitions = () => {
  return [
    { name: 'legoAxleLength', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Axle Length' },
    { name: 'legoAxleWidth', type: 'float', initial: 1.8, step: 0.1, caption: 'Lego: Axle Width' },
    { name: 'legoAxleChamfer', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Inner Chamfer Size' },
  ]
}

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 32})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 32})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 32})

  return union(center, union(top, bottom));
}

const legoAxle = (x, y, z, depth, params) => {
  const solids = [];
  const holes = [];

  const length = params.legoAxleLength
  const width = params.legoAxleWidth
  const chamfer = params.legoAxleChamfer

  solids.push(cuboid({size: [length, width, depth], center: [0, 0, 0]}))
  solids.push(cuboid({size: [width, length, depth], center: [0, 0, 0]}))
  solids.push(translate([width/2, width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([-width/2, width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([width/2, -width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))
  solids.push(translate([-width/2, -width/2, 0], rotateZ(Math.PI/4, cuboid({size: [chamfer, chamfer, depth]}))))

  return translate([x, y, z], merge(solids, holes))
}

const merge = (solids, holes) => {
  let shape = solids[0];

  for (let i=1; i<solids.length; i++) {
    shape = union(shape, solids[i])
  }

  for (let i=0; i<holes.length; i++) {
    shape = subtract(shape, holes[i])
  }

  return shape;
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



