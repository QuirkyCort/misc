/**
 * Adapter for GY-33
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 18, caption: 'Overall height' },
    { name: 'diameter', type: 'float', initial: 6, step: 0.5, caption: 'Diameter of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, step: 0.1, caption: 'Diameter of M3 holes' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'B'], captions: ['A1', 'A2', 'B'], initial: 'A1' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, step: 0.1, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, step: 0.1, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, step: 0.1, caption: 'Lego: Height of outer diameter' },
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

  const height = params.height - 8;
  const diameter = params.diameter;
  const m3 = params.m3;
  const type = params.type;

  // Mounting points for sensor
  solids.push(cylinder({radius: diameter/2, height: height, center: [10, 9, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-10, 9, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [10, -9, height/2], segments: 32}))
  solids.push(cylinder({radius: diameter/2, height: height, center: [-10, -9, height/2], segments: 32}))

  holes.push(cylinder({radius: m3/2, height: height + 16, center: [10, 9, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-10, 9, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [10, -9, height/2], segments: 32}))
  holes.push(cylinder({radius: m3/2, height: height + 16, center: [-10, -9, height/2], segments: 32}))

  // Base
  let baseWidth = 40;
  if (type == 'A2' || type == 'B') {
    baseWidth = 20 + diameter;
  }
  solids.push(cuboid({size: [baseWidth, 8, 8], center: [0, 8, -4]}))
  solids.push(cuboid({size: [baseWidth, 8, 8], center: [0, -8, -4]}))

  if (type == 'A1' || type == 'A2') {
    solids.push(cuboid({size: [8, 8, 8], center: [-8, 0, -4]}))
    solids.push(cuboid({size: [8, 8, 8], center: [8, 0, -4]}))
  } else if (type == 'B') {
    solids.push(cuboid({size: [8, 8, 8], center: [-4, 0, -4]}))
    solids.push(cuboid({size: [8, 8, 8], center: [4, 0, -4]}))
  }

  if (type == 'A1' || type == 'A2') {
    holes.push(legoHole(0, 8, -4, params))
    holes.push(legoHole(0, -8, -4, params))
    holes.push(legoHole(-8, 0, -4, params))
    holes.push(legoHole(8, 0, -4, params))

    holes.push(legoHole(16, 8, -4, params))
    holes.push(legoHole(-16, 8, -4, params))
    holes.push(legoHole(16, -8, -4, params))
    holes.push(legoHole(-16, -8, -4, params))
  } else if (type == 'B') {
    holes.push(legoHole(-4, 8, -4, params))
    holes.push(legoHole(4, 8, -4, params))
    holes.push(legoHole(-4, -8, -4, params))
    holes.push(legoHole(4, -8, -4, params))
    holes.push(legoHole(-4, 0, -4, params))
    holes.push(legoHole(4, 0, -4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }

