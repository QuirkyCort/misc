/**
 * Model for plain base with holes
 */

const jscad = require('@jscad/modeling')
const { roundedRectangle, circle } = jscad.primitives

const { union, subtract } = require('@jscad/modeling').booleans
const { cylinder, cuboid, polygon } = jscad.primitives
const { rotateX, rotateY, rotateZ, translate } = require('@jscad/modeling').transforms

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

const getParameterDefinitions = () => {
  return [
    { name: 'width', type: 'int', initial: 17, caption: 'Width in Lego units (8mm)' },
    { name: 'length', type: 'int', initial: 25, caption: 'Length in Lego units (8mm)' },
    { name: 'steps', type: 'int', initial: 2, caption: 'Steps between holes' },
    { name: 'm3_hole', type: 'float', initial: 3.4, step: 0.1, caption: 'Pass through hole for M3 screw (not secured)' },
  ]
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