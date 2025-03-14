/**
 * Adapter for Sharp Distance Sensors
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
    { name: 'size', type: 'float', initial: 37, caption: 'Distance between sensor mounting holes' },
    { name: 'type', type: 'choice', caption: 'Base type', values: ['A1', 'A2', 'B1', 'B2'], captions: ['A1', 'A2', 'B1', 'B2'], initial: 'A1' },
    { name: 'legoInnerDia', type: 'float', initial: 4.8, caption: 'Lego: Inner diameter of hole' },
    { name: 'legoOuterDia', type: 'float', initial: 6.2, caption: 'Lego: Outer diameter of hole' },
    { name: 'legoHeight', type: 'float', initial: 0.8, caption: 'Lego: Height of outer diameter' },
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

  const height = params.height;
  const width = params.width;
  const m3 = params.m3;
  const size = params.size;
  const type = params.type;

  // Mounting points for sensor
  let mounting_holes_distance = size;

  const holes_offset = mounting_holes_distance / 2
  solids.push(translate([holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: width/2, height: 7, segments: 32}))))
  solids.push(translate([-holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: width/2, height: 7, segments: 32}))))
  solids.push(cuboid({size: [width, 7, height], center: [holes_offset, 0, height/2]}))
  solids.push(cuboid({size: [width, 7, height], center: [-holes_offset, 0, height/2]}))
  solids.push(cuboid({size: [mounting_holes_distance, 7, 8], center: [0, 0, 4]}))

  holes.push(translate([holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: m3/2, height: 10, segments: 32}))))
  holes.push(translate([-holes_offset, 0, height], rotateX(Math.PI/2, cylinder({radius: m3/2, height: 10, segments: 32}))))


  // Base
  if (type == 'A1') {
    solids.push(cuboid({size: [24, 16, 8], center: [0, 4.5, 4]}))
  } else if (type == 'A2') {
    solids.push(cuboid({size: [24, 24, 8], center: [0, 8.5, 4]}))
  } else if (type == 'B1') {
    solids.push(cuboid({size: [16, 16, 8], center: [0, 4.5, 4]}))
  } else if (type == 'B2') {
    solids.push(cuboid({size: [16, 24, 8], center: [0, 8.5, 4]}))
  }

  if (type == 'A1' || type == 'A2') {
    for (let x=-1; x<=1; x++) {
      for (let y=0; y<=2; y++) {
        holes.push(legoHole(x*8, 0.5+y*8, 4, params))
      }
    }
  } else if (type == 'B1' || type == 'B2') {
    for (let y=0; y<=2; y++) {
      holes.push(legoHole(-4, 0.5+y*8, 4, params))
      holes.push(legoHole(4, 0.5+y*8, 4, params))
    }
  }

  return merge(solids, holes);
}

module.exports = { getParameterDefinitions, main }
