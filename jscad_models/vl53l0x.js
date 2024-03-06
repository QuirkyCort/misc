/**
 * Adapter for VL53L0X
 */

const jscad = require('@jscad/modeling')
const { union, subtract } = require('@jscad/modeling').booleans
const { rotateX, translate } = require('@jscad/modeling').transforms
const { cylinder, cuboid } = jscad.primitives

const getParameterDefinitions = () => {
  return [
    { name: 'height', type: 'float', initial: 15, caption: 'Height of mouting holes from base' },
    { name: 'width', type: 'float', initial: 6, step: 0.5, caption: 'Width of mount points' },
    { name: 'm3', type: 'float', initial: 2.8, caption: 'Diameter of M3 holes' },
    { name: 'bigger', type: 'checkbox', checked: false, caption: 'Bigger base' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, caption: 'Lego: Height of outer diameter' },
  ]
}

const legoHole = (x, y, z, params) => {
  const inner = params.legoInnerDia
  const outer = params.legoOuterDia
  const height = params.legoHeight

  const center = cylinder({radius: inner/2, height: 8, center: [x, y, z], segments: 64})
  const top = cylinder({radius: outer/2, height: height, center: [x, y, z + 4 - height / 2], segments: 64})
  const bottom = cylinder({radius: outer/2, height: height, center: [x, y, z - 4 + height / 2], segments: 64})

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

  const height = params.height;
  const width = params.width;
  const m3 = params.m3;
  const bigger = params.bigger;

  // Mounting points for sensor
  solids.push(translate([10, 0, height], rotateX(Math.PI/2, cylinder({radius: width/2, height: 7, segments: 64}))))
  solids.push(translate([-10, 0, height], rotateX(Math.PI/2, cylinder({radius: width/2, height: 7, segments: 64}))))
  solids.push(cuboid({size: [width, 7, height], center: [10, 0, height/2]}))
  solids.push(cuboid({size: [width, 7, height], center: [-10, 0, height/2]}))

  holes.push(translate([10, 0, height], rotateX(Math.PI/2, cylinder({radius: m3/2, height: 10, segments: 64}))))
  holes.push(translate([-10, 0, height], rotateX(Math.PI/2, cylinder({radius: m3/2, height: 10, segments: 64}))))


  // Base
  if (bigger) {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 8.5, 4]}))
  } else {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 4.5, 4]}))
  }

  holes.push(legoHole(0, 0.5, 4, params))
  holes.push(legoHole(0, 8.5, 4, params))
  holes.push(legoHole(8, 8.5, 4, params))
  holes.push(legoHole(-8, 8.5, 4, params))
  if (bigger) {
    holes.push(legoHole(0, 16.5, 4, params))
    holes.push(legoHole(8, 16.5, 4, params))
    holes.push(legoHole(-8, 16.5, 4, params))
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
